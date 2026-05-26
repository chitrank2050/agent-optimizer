/**
 * Tests the optional LLM recommendation adapter without making network calls.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  AgentConfig,
  AnalysisBatch,
  OptimizationRecommendation,
  OptimizationRun,
} from '@agent-optimizer/contracts';

import { LlmRecommendationService } from '../src/modules/optimization/llm-recommendation.service';

const baselineRecommendation: OptimizationRecommendation = {
  id: 'baseline-prompt',
  target: 'prompt',
  title: 'Make budget capture mandatory',
  before: 'Budget capture can be skipped.',
  after: 'Ask budget before closing.',
  reasoning: 'The generated test failed the budget criterion.',
  evidenceIds: ['transcript-1', 'test-1'],
  status: 'proposed',
};

const agent: AgentConfig = {
  agentId: 'agent-1',
  name: 'FrontDoor AI',
  prompt: 'Ask for name, phone, service, ZIP, preferred time, and budget.',
  model: 'highlevel-voice-ai',
  temperature: 0.4,
  tools: ['APPOINTMENT_BOOKING'],
};

const analysis: AnalysisBatch = {
  agentId: 'agent-1',
  analyses: [
    {
      transcriptId: 'transcript-1',
      agentId: 'agent-1',
      outcome: 'failure',
      score: 58,
      summary: 'The agent missed budget capture.',
      passedCriteria: [],
      missedCriteria: [{ key: 'ask_budget', label: 'Must ask for budget before closing' }],
      findings: [
        {
          category: 'qualification',
          severity: 'medium',
          evidence: 'The transcript ended without a budget question.',
          recommendationHint: 'Make budget a required close gate.',
        },
      ],
      analyzedAt: new Date('2026-05-26T00:00:00.000Z').toISOString(),
    },
  ],
  patterns: [
    {
      category: 'qualification',
      severity: 'medium',
      count: 1,
      exampleEvidence: 'The transcript ended without a budget question.',
    },
  ],
  generatedAt: new Date('2026-05-26T00:00:00.000Z').toISOString(),
};

const optimization: OptimizationRun = {
  agentId: 'agent-1',
  testCases: [
    {
      id: 'test-1',
      title: 'Qualified caller books an appointment',
      scenario: 'Caller gives service, ZIP, preferred time, and budget.',
      pathType: 'happy_path',
      successCriteria: ['Must ask for budget before closing'],
    },
  ],
  evaluations: [
    {
      testCaseId: 'test-1',
      status: 'fail',
      score: 64,
      failedCriteria: ['Must ask for budget before closing'],
      reasoning: 'The current prompt misses one close-gate criterion.',
    },
  ],
  recommendations: [baselineRecommendation],
  generatedAt: new Date('2026-05-26T00:00:00.000Z').toISOString(),
};

describe('LlmRecommendationService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses deterministic recommendations when no OpenAI key is configured', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const service = new LlmRecommendationService(configWith({}));

    await expect(service.recommend({ agent, analysis, optimization })).resolves.toEqual([
      baselineRecommendation,
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('merges schema-valid OpenAI recommendations with the deterministic baseline', async () => {
    const llmRecommendation: OptimizationRecommendation = {
      id: 'llm-model-upgrade',
      target: 'model',
      title: 'Use a stronger model for noisy objection handling',
      before: 'The current model is the default HighLevel voice model.',
      after: 'Evaluate a higher reasoning voice model for objection-heavy agents.',
      reasoning:
        'Transcript evidence and generated tests show repeated misses on qualification under pressure.',
      evidenceIds: ['transcript-1', 'test-1'],
      status: 'proposed',
    };
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        output: [
          {
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({ recommendations: [llmRecommendation] }),
              },
            ],
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchSpy);
    const service = new LlmRecommendationService(
      configWith({ OPENAI_API_KEY: 'test-key', OPENAI_MODEL: 'gpt-test' }),
    );

    await expect(service.recommend({ agent, analysis, optimization })).resolves.toEqual([
      baselineRecommendation,
      llmRecommendation,
    ]);

    const [, init] = fetchSpy.mock.calls[0] as [string, { body: string; method: string }];
    const body = JSON.parse(init.body) as {
      model: string;
      text: { format: { type: string } };
    };

    expect(init.method).toBe('POST');
    expect(body.model).toBe('gpt-test');
    expect(body.text.format.type).toBe('json_schema');
  });
});

function configWith(values: Record<string, string | undefined>) {
  return {
    get: vi.fn((key: string) => values[key]),
  } as never;
}
