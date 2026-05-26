/**
 * OptimizationService - Closes the transcript-to-recommendation loop.
 *
 * Reruns analysis, generates test cases, evaluates the current prompt/config,
 * and persists proposed recommendations with evidence IDs in one transaction.
 */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  RecommendationStatus,
  RecommendationTarget,
  TestEvaluationStatus,
  TestPathType,
} from '@prisma/client';
import { runOptimizationLoop } from '@agent-optimizer/ai';
import {
  issueCategorySchema,
  testCaseSchema,
  type AgentConfig,
  type OptimizationRecommendation,
  type OptimizationRun,
  type OptimizerTestCase,
  type TestEvaluation,
} from '@agent-optimizer/contracts';

import { AnalysisService } from '../analysis/analysis.service';
import { PrismaService } from '../prisma/prisma.service';
import { LlmRecommendationService } from './llm-recommendation.service';

@Injectable()
export class OptimizationService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AnalysisService) private readonly analysisService: AnalysisService,
    @Inject(LlmRecommendationService)
    private readonly llmRecommendations: LlmRecommendationService,
  ) {}

  /**
   * Closes the optimizer loop: rerun transcript analysis, generate tests,
   * evaluate current config, and persist proposed optimizations atomically.
   */
  async run(agentId: string): Promise<OptimizationRun> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent was not found');
    }

    const analysis = await this.analysisService.analyzeAgent(agentId);
    const agentConfig = toAgentConfig(agent);
    const deterministicOptimization = runOptimizationLoop(agentConfig, analysis);
    const recommendations = await this.llmRecommendations.recommend({
      agent: agentConfig,
      analysis,
      optimization: deterministicOptimization,
    });
    const optimization: OptimizationRun = {
      ...deterministicOptimization,
      recommendations,
    };

    return this.persistOptimization(agentId, optimization);
  }

  async get(agentId: string): Promise<OptimizationRun> {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        testCases: {
          orderBy: { createdAt: 'asc' },
          include: {
            evaluations: true,
          },
        },
        recommendations: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent was not found');
    }

    return {
      agentId,
      testCases: agent.testCases.map((testCase) => ({
        id: testCase.id,
        title: testCase.title,
        scenario: testCase.scenario,
        pathType: toContractPathType(testCase.pathType),
        successCriteria: toStringArray(testCase.successCriteria),
        sourcePattern: toSourcePattern(testCase.sourcePattern),
      })),
      evaluations: agent.testCases.flatMap((testCase) =>
        testCase.evaluations.map((evaluation) => ({
          testCaseId: testCase.id,
          status: toContractEvaluationStatus(evaluation.status),
          score: evaluation.score,
          failedCriteria: toStringArray(evaluation.failedCriteria),
          reasoning: evaluation.reasoning,
        })),
      ),
      recommendations: agent.recommendations.map((recommendation) => ({
        id: recommendation.id,
        target: toContractTarget(recommendation.target),
        title: recommendation.title,
        before: recommendation.beforeValue,
        after: recommendation.afterValue,
        reasoning: recommendation.reasoning,
        evidenceIds: toStringArray(recommendation.evidenceIds),
        status: toContractRecommendationStatus(recommendation.status),
      })),
      generatedAt: new Date().toISOString(),
    };
  }

  private async persistOptimization(
    agentId: string,
    optimization: OptimizationRun,
  ): Promise<OptimizationRun> {
    return this.prisma
      .$transaction(async (tx) => {
        const testCaseIdByExternalKey = new Map<string, string>();

        for (const testCase of optimization.testCases) {
          const persisted = await tx.generatedTestCase.upsert({
            where: {
              agentId_externalKey: {
                agentId,
                externalKey: testCase.id,
              },
            },
            update: {
              title: testCase.title,
              scenario: testCase.scenario,
              pathType: toPrismaPathType(testCase.pathType),
              successCriteria: testCase.successCriteria as Prisma.InputJsonValue,
              sourcePattern: testCase.sourcePattern ?? null,
            },
            create: {
              agentId,
              externalKey: testCase.id,
              title: testCase.title,
              scenario: testCase.scenario,
              pathType: toPrismaPathType(testCase.pathType),
              successCriteria: testCase.successCriteria as Prisma.InputJsonValue,
              sourcePattern: testCase.sourcePattern ?? null,
            },
          });

          testCaseIdByExternalKey.set(testCase.id, persisted.id);
        }

        for (const evaluation of optimization.evaluations) {
          const testCaseId = testCaseIdByExternalKey.get(evaluation.testCaseId);

          if (!testCaseId) {
            continue;
          }

          await tx.testCaseEvaluation.upsert({
            where: { testCaseId },
            update: {
              status: toPrismaEvaluationStatus(evaluation.status),
              score: evaluation.score,
              failedCriteria: evaluation.failedCriteria as Prisma.InputJsonValue,
              reasoning: evaluation.reasoning,
              evaluatedAt: new Date(optimization.generatedAt),
            },
            create: {
              testCaseId,
              status: toPrismaEvaluationStatus(evaluation.status),
              score: evaluation.score,
              failedCriteria: evaluation.failedCriteria as Prisma.InputJsonValue,
              reasoning: evaluation.reasoning,
              evaluatedAt: new Date(optimization.generatedAt),
            },
          });
        }

        for (const recommendation of optimization.recommendations) {
          await tx.recommendation.upsert({
            where: {
              agentId_externalKey: {
                agentId,
                externalKey: recommendation.id,
              },
            },
            update: {
              target: toPrismaTarget(recommendation.target),
              title: recommendation.title,
              beforeValue: recommendation.before,
              afterValue: recommendation.after,
              reasoning: recommendation.reasoning,
              evidenceIds: mapEvidenceIds(
                recommendation.evidenceIds,
                testCaseIdByExternalKey,
              ) as Prisma.InputJsonValue,
            },
            create: {
              agentId,
              externalKey: recommendation.id,
              target: toPrismaTarget(recommendation.target),
              status: RecommendationStatus.PROPOSED,
              title: recommendation.title,
              beforeValue: recommendation.before,
              afterValue: recommendation.after,
              reasoning: recommendation.reasoning,
              evidenceIds: mapEvidenceIds(
                recommendation.evidenceIds,
                testCaseIdByExternalKey,
              ) as Prisma.InputJsonValue,
            },
          });
        }
      })
      .then(() => this.get(agentId));
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

function mapEvidenceIds(
  evidenceIds: string[],
  testCaseIdByExternalKey: Map<string, string>,
): string[] {
  return evidenceIds.map((evidenceId) => testCaseIdByExternalKey.get(evidenceId) ?? evidenceId);
}

function toPrismaPathType(pathType: OptimizerTestCase['pathType']): TestPathType {
  switch (pathType) {
    case 'happy_path':
      return TestPathType.HAPPY_PATH;
    case 'edge_case':
      return TestPathType.EDGE_CASE;
  }
}

function toContractPathType(pathType: TestPathType): OptimizerTestCase['pathType'] {
  switch (pathType) {
    case TestPathType.HAPPY_PATH:
      return 'happy_path';
    case TestPathType.EDGE_CASE:
      return 'edge_case';
  }
}

function toPrismaEvaluationStatus(status: TestEvaluation['status']): TestEvaluationStatus {
  switch (status) {
    case 'pass':
      return TestEvaluationStatus.PASS;
    case 'fail':
      return TestEvaluationStatus.FAIL;
    case 'risk':
      return TestEvaluationStatus.RISK;
  }
}

function toContractEvaluationStatus(status: TestEvaluationStatus): TestEvaluation['status'] {
  switch (status) {
    case TestEvaluationStatus.PASS:
      return 'pass';
    case TestEvaluationStatus.FAIL:
      return 'fail';
    case TestEvaluationStatus.RISK:
      return 'risk';
  }
}

function toPrismaTarget(target: OptimizationRecommendation['target']): RecommendationTarget {
  switch (target) {
    case 'prompt':
      return RecommendationTarget.PROMPT;
    case 'temperature':
      return RecommendationTarget.TEMPERATURE;
    case 'model':
      return RecommendationTarget.MODEL;
    case 'tool':
      return RecommendationTarget.TOOL;
    case 'action':
      return RecommendationTarget.ACTION;
    case 'knowledge_base':
      return RecommendationTarget.KNOWLEDGE_BASE;
    case 'guardrail':
      return RecommendationTarget.GUARDRAIL;
  }
}

function toContractTarget(target: RecommendationTarget): OptimizationRecommendation['target'] {
  switch (target) {
    case RecommendationTarget.PROMPT:
      return 'prompt';
    case RecommendationTarget.TEMPERATURE:
      return 'temperature';
    case RecommendationTarget.MODEL:
      return 'model';
    case RecommendationTarget.TOOL:
      return 'tool';
    case RecommendationTarget.ACTION:
      return 'action';
    case RecommendationTarget.KNOWLEDGE_BASE:
      return 'knowledge_base';
    case RecommendationTarget.GUARDRAIL:
      return 'guardrail';
  }
}

function toContractRecommendationStatus(
  status: RecommendationStatus,
): OptimizationRecommendation['status'] {
  switch (status) {
    case RecommendationStatus.PROPOSED:
      return 'proposed';
    case RecommendationStatus.APPROVED:
      return 'approved';
    case RecommendationStatus.REJECTED:
      return 'rejected';
    case RecommendationStatus.APPLIED:
      return 'applied';
  }
}

function toStringArray(value: Prisma.JsonValue): string[] {
  const parsed = testCaseSchema.shape.successCriteria.safeParse(value);

  return parsed.success ? parsed.data : [];
}

function toSourcePattern(value: string | null): OptimizerTestCase['sourcePattern'] {
  if (!value) {
    return undefined;
  }

  const parsed = issueCategorySchema.safeParse(value);

  return parsed.success ? parsed.data : undefined;
}
