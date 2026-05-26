/**
 * LlmRecommendationService - Optional AI recommendation adapter.
 *
 * Uses a structured-output LLM endpoint when an API key is configured, while
 * keeping deterministic recommendations as the reliable baseline and fallback.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import {
  recommendationSchema,
  type AgentConfig,
  type AnalysisBatch,
  type OptimizationRecommendation,
  type OptimizationRun,
} from '@agent-optimizer/contracts';

import type { AppEnv } from '../config';

const llmRecommendationResponseSchema = z.object({
  recommendations: z.array(recommendationSchema),
});

const openAiRecommendationJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['recommendations'],
  properties: {
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'target',
          'title',
          'before',
          'after',
          'reasoning',
          'evidenceIds',
          'status',
        ],
        properties: {
          id: { type: 'string' },
          target: {
            type: 'string',
            enum: [
              'prompt',
              'temperature',
              'model',
              'tool',
              'action',
              'knowledge_base',
              'guardrail',
            ],
          },
          title: { type: 'string' },
          before: { type: 'string' },
          after: { type: 'string' },
          reasoning: { type: 'string' },
          evidenceIds: {
            type: 'array',
            items: { type: 'string' },
          },
          status: {
            type: 'string',
            enum: ['proposed'],
          },
        },
      },
    },
  },
} as const;

interface RecommendationContext {
  agent: AgentConfig;
  analysis: AnalysisBatch;
  optimization: OptimizationRun;
}

@Injectable()
export class LlmRecommendationService {
  private readonly logger = new Logger(LlmRecommendationService.name);
  private readonly apiKey?: string;
  private readonly model: string;
  private readonly responsesUrl?: string;

  constructor(@Inject(ConfigService) config: ConfigService<AppEnv, true>) {
    this.apiKey = config.get('LLM_API_KEY', { infer: true });
    this.model = config.get('LLM_MODEL', { infer: true }) ?? 'gpt-4.1-mini';
    this.responsesUrl = config.get('LLM_RESPONSES_URL', { infer: true });
  }

  /**
   * Returns deterministic recommendations unless a live LLM key is configured.
   * LLM output is schema-validated and merged by stable recommendation id.
   */
  async recommend(context: RecommendationContext): Promise<OptimizationRecommendation[]> {
    const baseline = context.optimization.recommendations;

    if (!this.apiKey || !this.responsesUrl) {
      return baseline;
    }

    try {
      const refined = await this.requestStructuredRecommendations(context, this.responsesUrl);
      const merged = new Map(baseline.map((recommendation) => [recommendation.id, recommendation]));

      for (const recommendation of refined) {
        merged.set(recommendation.id, recommendation);
      }

      return [...merged.values()];
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `LLM recommendation adapter failed; using deterministic recommendations. ${error.message}`
          : 'LLM recommendation adapter failed; using deterministic recommendations.',
      );

      return baseline;
    }
  }

  private async requestStructuredRecommendations(
    { agent, analysis, optimization }: RecommendationContext,
    responsesUrl: string,
  ): Promise<OptimizationRecommendation[]> {
    const response = await fetch(responsesUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a senior Voice AI QA optimizer. Return only evidence-linked recommendations that improve a HighLevel Voice AI agent. You must output strictly in JSON format matching the following JSON schema:\n' +
              JSON.stringify(openAiRecommendationJsonSchema) +
              '\n\nCRITICAL INSTRUCTION: For any recommendation with target="prompt", do NOT output the entire agent prompt or large parts of it in the "after" field. Instead, output ONLY the specific instructions, rules, or text block that needs to be added, modified, or appended to the prompt.',
          },
          {
            role: 'user',
            content: JSON.stringify(buildPromptPayload(agent, analysis, optimization)),
          },
        ],
        response_format: {
          type: 'json_object',
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    const payload = (await response.json().catch(() => ({}))) as unknown;

    if (!response.ok) {
      throw new Error(`LLM request failed with status ${response.status}`);
    }

    const outputText = extractOutputText(payload);

    if (!outputText) {
      throw new Error('LLM response did not include structured output text');
    }

    const parsedJson = JSON.parse(outputText) as Record<string, unknown>;

    if (parsedJson && Array.isArray(parsedJson.recommendations)) {
      parsedJson.recommendations = parsedJson.recommendations.map((rec: any) => {
        if (typeof rec === 'object' && rec !== null && typeof rec.target === 'string') {
          const target = rec.target.toLowerCase().trim();
          if (target === 'knowledge base' || target === 'knowledge-base' || target === 'knowledgebase') {
            rec.target = 'knowledge_base';
          } else if (target === 'guard rail' || target === 'guard-rail' || target === 'guard_rail') {
            rec.target = 'guardrail';
          } else {
            rec.target = target;
          }
        }
        return rec;
      });
    }

    return llmRecommendationResponseSchema.parse(parsedJson).recommendations;
  }
}

function buildPromptPayload(
  agent: AgentConfig,
  analysis: AnalysisBatch,
  optimization: OptimizationRun,
): Record<string, unknown> {
  return {
    task: 'Recommend specific prompt, temperature, model, tool, action, knowledge base, or guardrail improvements.',
    constraints: [
      'Link every recommendation to transcript IDs or generated test IDs already present in the payload.',
      'Do not invent facts, prices, policies, or call outcomes.',
      'Prefer precise before/after changes over broad advice.',
      'Keep status as proposed.',
    ],
    agent: {
      id: agent.agentId,
      name: agent.name,
      model: agent.model,
      temperature: agent.temperature,
      tools: agent.tools,
      promptExcerpt: agent.prompt.slice(0, 6000),
    },
    transcriptInsights: analysis.analyses.map((item) => ({
      transcriptId: item.transcriptId,
      outcome: item.outcome,
      score: item.score,
      summary: item.summary,
      missedCriteria: item.missedCriteria,
      findings: item.findings,
    })),
    recurringPatterns: analysis.patterns,
    generatedTests: optimization.testCases,
    evaluations: optimization.evaluations,
    baselineRecommendations: optimization.recommendations,
  };
}

function extractOutputText(payload: unknown): string | undefined {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const record = payload as Record<string, unknown>;

  // OpenAI format
  if (Array.isArray(record.choices) && record.choices.length > 0) {
    const choice = record.choices[0] as Record<string, unknown>;
    const message = choice.message as Record<string, unknown> | undefined;
    if (message && typeof message.content === 'string') {
      return message.content;
    }
  }

  if (typeof record.output_text === 'string') {
    return record.output_text;
  }

  if (!Array.isArray(record.output)) {
    return undefined;
  }

  for (const outputItem of record.output) {
    if (typeof outputItem !== 'object' || outputItem === null) {
      continue;
    }

    const content = (outputItem as Record<string, unknown>).content;

    if (!Array.isArray(content)) {
      continue;
    }

    for (const contentItem of content) {
      if (typeof contentItem !== 'object' || contentItem === null) {
        continue;
      }

      const text = (contentItem as Record<string, unknown>).text;

      if (typeof text === 'string') {
        return text;
      }
    }
  }

  return undefined;
}
