/**
 * AnalysisService - Runs and persists transcript analysis for an agent.
 *
 * Loads agent configuration and transcripts, delegates deterministic scoring to
 * the AI package, then stores replaceable analysis/finding records atomically.
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AnalysisOutcome, FindingSeverity, Prisma } from '@prisma/client';
import { aggregateAnalysisPatterns, analyzeTranscript } from '@agent-optimizer/ai';
import {
  analysisCriterionSchema,
  transcriptTurnSchema,
  type AgentConfig,
  type AnalysisBatch,
  type AnalysisCriterion,
  type Transcript,
  type TranscriptAnalysis,
  type TranscriptFinding,
} from '@agent-optimizer/contracts';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalysisService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /**
   * Runs deterministic transcript analysis for every stored transcript of an
   * agent and persists the normalized findings atomically per transcript.
   */
  async analyzeAgent(agentId: string): Promise<AnalysisBatch> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        transcripts: {
          orderBy: { callStartedAt: 'desc' },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent was not found');
    }

    await this.prisma.$transaction([
      this.prisma.recommendation.deleteMany({ where: { agentId } }),
      this.prisma.generatedTestCase.deleteMany({ where: { agentId } }),
    ]);

    const agentConfig = toAgentConfig(agent);
    const transcripts = agent.transcripts.map((transcript) => toTranscript(transcript));
    const analyses = transcripts.map((transcript) => analyzeTranscript(agentConfig, transcript));

    for (const analysis of analyses) {
      await this.persistAnalysis(analysis);
    }

    return {
      agentId,
      analyses,
      patterns: aggregateAnalysisPatterns(analyses),
      generatedAt: new Date().toISOString(),
    };
  }

  async getAgentAnalyses(agentId: string): Promise<AnalysisBatch> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        transcripts: {
          orderBy: { callStartedAt: 'desc' },
          include: {
            analysis: true,
            findings: true,
          },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent was not found');
    }

    const analyses = agent.transcripts.flatMap((transcript): TranscriptAnalysis[] => {
      if (!transcript.analysis) {
        return [];
      }

      return [
        {
          transcriptId: transcript.id,
          agentId,
          outcome: toContractOutcome(transcript.analysis.outcome),
          score: transcript.analysis.score,
          summary: transcript.analysis.summary,
          passedCriteria: toCriteria(transcript.analysis.passedCriteria),
          missedCriteria: toCriteria(transcript.analysis.missedCriteria),
          findings: transcript.findings.map((finding) => ({
            category: finding.category as TranscriptFinding['category'],
            severity: toContractSeverity(finding.severity),
            evidence: finding.evidence,
            recommendationHint: finding.recommendationHint,
          })),
          analyzedAt: transcript.analysis.analyzedAt.toISOString(),
        },
      ];
    });

    return {
      agentId,
      analyses,
      patterns: aggregateAnalysisPatterns(analyses),
      generatedAt: new Date().toISOString(),
    };
  }

  private async persistAnalysis(analysis: TranscriptAnalysis): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.transcriptAnalysis.upsert({
        where: { transcriptId: analysis.transcriptId },
        update: {
          outcome: toPrismaOutcome(analysis.outcome),
          score: analysis.score,
          summary: analysis.summary,
          passedCriteria: analysis.passedCriteria as Prisma.InputJsonValue,
          missedCriteria: analysis.missedCriteria as Prisma.InputJsonValue,
          analyzedAt: new Date(analysis.analyzedAt),
        },
        create: {
          transcriptId: analysis.transcriptId,
          outcome: toPrismaOutcome(analysis.outcome),
          score: analysis.score,
          summary: analysis.summary,
          passedCriteria: analysis.passedCriteria as Prisma.InputJsonValue,
          missedCriteria: analysis.missedCriteria as Prisma.InputJsonValue,
          analyzedAt: new Date(analysis.analyzedAt),
        },
      });

      await tx.transcriptFinding.deleteMany({
        where: { transcriptId: analysis.transcriptId },
      });

      if (analysis.findings.length === 0) {
        return;
      }

      await tx.transcriptFinding.createMany({
        data: analysis.findings.map((finding) => ({
          transcriptId: analysis.transcriptId,
          category: finding.category,
          severity: toPrismaSeverity(finding.severity),
          evidence: finding.evidence,
          recommendationHint: finding.recommendationHint,
        })),
      });
    });
  }
}

function toAgentConfig(agent: {
  id: string;
  name: string;
  prompt: string;
  model: string;
  temperature: Prisma.Decimal;
  tools: Prisma.JsonValue;
}): AgentConfig {
  return {
    agentId: agent.id,
    name: agent.name,
    prompt: agent.prompt,
    model: agent.model,
    temperature: agent.temperature.toNumber(),
    tools: toToolNames(agent.tools),
  };
}

function toTranscript(transcript: {
  id: string;
  agentId: string;
  contactId: string | null;
  callStartedAt: Date;
  summary: string | null;
  turns: Prisma.JsonValue;
}): Transcript {
  return {
    id: transcript.id,
    agentId: transcript.agentId,
    contactId: transcript.contactId ?? undefined,
    callStartedAt: transcript.callStartedAt.toISOString(),
    summary: transcript.summary ?? undefined,
    turns: transcriptTurnSchema.array().parse(transcript.turns),
  };
}

function toToolNames(tools: Prisma.JsonValue): string[] {
  if (!Array.isArray(tools)) {
    return [];
  }

  return tools.flatMap((tool) => {
    if (typeof tool !== 'object' || tool === null) {
      return [];
    }

    const record = tool as Record<string, unknown>;
    const name = record.name ?? record.actionType;

    return typeof name === 'string' ? [name] : [];
  });
}

function toPrismaOutcome(outcome: TranscriptAnalysis['outcome']): AnalysisOutcome {
  switch (outcome) {
    case 'success':
      return AnalysisOutcome.SUCCESS;
    case 'failure':
      return AnalysisOutcome.FAILURE;
    case 'missed_opportunity':
      return AnalysisOutcome.MISSED_OPPORTUNITY;
  }
}

function toContractOutcome(outcome: AnalysisOutcome): TranscriptAnalysis['outcome'] {
  switch (outcome) {
    case AnalysisOutcome.SUCCESS:
      return 'success';
    case AnalysisOutcome.FAILURE:
      return 'failure';
    case AnalysisOutcome.MISSED_OPPORTUNITY:
      return 'missed_opportunity';
  }
}

function toPrismaSeverity(severity: TranscriptFinding['severity']): FindingSeverity {
  switch (severity) {
    case 'low':
      return FindingSeverity.LOW;
    case 'medium':
      return FindingSeverity.MEDIUM;
    case 'high':
      return FindingSeverity.HIGH;
  }
}

function toContractSeverity(severity: FindingSeverity): TranscriptFinding['severity'] {
  switch (severity) {
    case FindingSeverity.LOW:
      return 'low';
    case FindingSeverity.MEDIUM:
      return 'medium';
    case FindingSeverity.HIGH:
      return 'high';
  }
}

function toCriteria(value: Prisma.JsonValue): AnalysisCriterion[] {
  const parsed = analysisCriterionSchema.array().safeParse(value);

  return parsed.success ? parsed.data : [];
}
