<!--
  OptimizationPanel - Generated tests and recommendations section.

  Presents optimizer outputs: happy-path/edge-case scenarios, evaluation scores,
  failed criteria, and before/after recommendation reasoning.
-->
<script setup lang="ts">
import { Lightbulb } from 'lucide-vue-next';

import type {
  HighLevelSyncResponse,
  OptimizationRecommendation,
  OptimizationRun,
  OptimizerTestCase,
  TestEvaluation,
} from '@agent-optimizer/contracts';

defineProps<{
  integration: HighLevelSyncResponse;
  optimizationsByAgentId: Record<string, OptimizationRun>;
  optimizationError: string | null;
}>();

function evaluationForTestCase(
  optimizationsByAgentId: Record<string, OptimizationRun>,
  agentId: string,
  testCaseId: string,
): TestEvaluation | undefined {
  return optimizationsByAgentId[agentId]?.evaluations.find(
    (evaluation) => evaluation.testCaseId === testCaseId,
  );
}

function testCasesForAgent(
  optimizationsByAgentId: Record<string, OptimizationRun>,
  agentId: string,
): OptimizerTestCase[] {
  return optimizationsByAgentId[agentId]?.testCases ?? [];
}

function recommendationsForAgent(
  optimizationsByAgentId: Record<string, OptimizationRun>,
  agentId: string,
): OptimizationRecommendation[] {
  return optimizationsByAgentId[agentId]?.recommendations ?? [];
}

function failedEvaluationCount(
  optimizationsByAgentId: Record<string, OptimizationRun>,
  agentId: string,
): number {
  return (
    optimizationsByAgentId[agentId]?.evaluations.filter(
      (evaluation) => evaluation.status === 'fail',
    ).length ?? 0
  );
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
    <div class="rounded-md border border-(--border) bg-white p-6">
      <div class="flex items-center gap-3">
        <Lightbulb class="h-5 w-5 text-(--accent)" aria-hidden="true" />
        <h2 class="text-lg font-semibold">Generated Tests & Recommendations</h2>
      </div>

      <p
        v-if="optimizationError"
        class="mt-4 rounded-md bg-(--danger-bg) px-3 py-2 text-sm text-(--danger)"
      >
        {{ optimizationError }}
      </p>

      <div class="mt-5 space-y-5">
        <article
          v-for="agent in integration.syncedAgents"
          :key="`${agent.id}-optimization`"
          class="rounded-md border border-(--border) p-4"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 class="text-sm font-semibold">{{ agent.name }}</h3>
              <p class="mt-1 font-mono text-xs text-(--muted)">{{ agent.id }}</p>
            </div>
            <dl class="grid grid-cols-3 gap-3 text-sm">
              <div class="rounded-md bg-(--surface) px-3 py-2">
                <dt class="text-(--muted)">Tests</dt>
                <dd class="font-semibold">
                  {{ optimizationsByAgentId[agent.id]?.testCases.length ?? 0 }}
                </dd>
              </div>
              <div class="rounded-md bg-(--surface) px-3 py-2">
                <dt class="text-(--muted)">Failures</dt>
                <dd class="font-semibold">
                  {{ failedEvaluationCount(optimizationsByAgentId, agent.id) }}
                </dd>
              </div>
              <div class="rounded-md bg-(--surface) px-3 py-2">
                <dt class="text-(--muted)">Fixes</dt>
                <dd class="font-semibold">
                  {{ optimizationsByAgentId[agent.id]?.recommendations.length ?? 0 }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-if="optimizationsByAgentId[agent.id]" class="mt-5 grid gap-5 xl:grid-cols-2">
            <div>
              <h4 class="text-sm font-semibold">Generated test cases</h4>
              <div class="mt-3 space-y-3">
                <article
                  v-for="testCase in testCasesForAgent(optimizationsByAgentId, agent.id)"
                  :key="testCase.id"
                  class="rounded-md border border-(--border) p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h5 class="text-sm font-semibold">{{ testCase.title }}</h5>
                      <p class="mt-1 text-xs uppercase text-(--muted)">
                        {{ testCase.pathType.replace('_', ' ') }}
                      </p>
                    </div>
                    <span
                      v-if="evaluationForTestCase(optimizationsByAgentId, agent.id, testCase.id)"
                      class="rounded-md px-2 py-1 text-xs font-semibold"
                      :class="
                        evaluationForTestCase(optimizationsByAgentId, agent.id, testCase.id)
                          ?.status === 'pass'
                          ? 'bg-(--success-bg) text-(--success-ink)'
                          : 'bg-(--danger-bg) text-(--danger)'
                      "
                    >
                      {{
                        evaluationForTestCase(optimizationsByAgentId, agent.id, testCase.id)?.status
                      }}
                      ·
                      {{
                        evaluationForTestCase(optimizationsByAgentId, agent.id, testCase.id)?.score
                      }}
                    </span>
                  </div>
                  <p class="mt-3 text-sm leading-6">{{ testCase.scenario }}</p>
                  <ul class="mt-3 space-y-2 text-sm">
                    <li
                      v-for="criterion in testCase.successCriteria"
                      :key="criterion"
                      class="rounded-md bg-(--surface) px-3 py-2"
                    >
                      {{ criterion }}
                    </li>
                  </ul>
                </article>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-semibold">Optimization recommendations</h4>
              <div class="mt-3 space-y-3">
                <article
                  v-for="recommendation in recommendationsForAgent(
                    optimizationsByAgentId,
                    agent.id,
                  )"
                  :key="recommendation.id"
                  class="rounded-md border border-(--border) p-4"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h5 class="text-sm font-semibold">{{ recommendation.title }}</h5>
                      <p class="mt-1 text-xs uppercase text-(--muted)">
                        {{ recommendation.target.replace('_', ' ') }} ·
                        {{ recommendation.status }}
                      </p>
                    </div>
                    <span class="rounded-md bg-(--surface) px-2 py-1 text-xs font-semibold">
                      {{ recommendation.evidenceIds.length }} evidence
                    </span>
                  </div>
                  <dl class="mt-4 grid gap-3 text-sm">
                    <div>
                      <dt class="font-semibold text-(--muted)">Before</dt>
                      <dd class="mt-1 max-h-28 overflow-auto rounded-md bg-(--surface) p-3">
                        {{ recommendation.before }}
                      </dd>
                    </div>
                    <div>
                      <dt class="font-semibold text-(--muted)">After</dt>
                      <dd class="mt-1 max-h-28 overflow-auto rounded-md bg-(--surface) p-3">
                        {{ recommendation.after }}
                      </dd>
                    </div>
                  </dl>
                  <p class="mt-3 text-sm leading-6 text-(--muted)">
                    {{ recommendation.reasoning }}
                  </p>
                </article>
              </div>
            </div>
          </div>

          <p v-else class="mt-4 rounded-md bg-(--surface) px-3 py-2 text-sm text-(--muted)">
            Run the optimizer to generate test cases, evaluate the current config, and propose
            changes.
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
