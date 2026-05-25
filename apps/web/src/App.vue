<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  ClipboardCheck,
  FileText,
  Lightbulb,
  RefreshCw,
} from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import type {
  AnalysisBatch,
  HealthResponse,
  HighLevelSyncResponse,
  OptimizationRecommendation,
  OptimizationRun,
  OptimizerTestCase,
  PerformancePattern,
  TestEvaluation,
  TranscriptAnalysis,
} from '@agent-optimizer/contracts';

import { getHealth, runAgentAnalysis, runOptimization, syncHighLevel } from './lib/api';

const health = ref<HealthResponse | null>(null);
const healthError = ref<string | null>(null);
const integration = ref<HighLevelSyncResponse | null>(null);
const integrationError = ref<string | null>(null);
const analysesByAgentId = ref<Record<string, AnalysisBatch>>({});
const optimizationsByAgentId = ref<Record<string, OptimizationRun>>({});
const analysisError = ref<string | null>(null);
const optimizationError = ref<string | null>(null);
const analyzingAgentId = ref<string | null>(null);
const optimizingAgentId = ref<string | null>(null);
const isSyncing = ref(false);
const locationId = import.meta.env.VITE_GHL_LOCATION_ID ?? '';

onMounted(async () => {
  try {
    health.value = await getHealth();
  } catch (error) {
    healthError.value = error instanceof Error ? error.message : 'Unable to reach API';
  }
});

async function runSync(): Promise<void> {
  if (!locationId) {
    integrationError.value = 'Set VITE_GHL_LOCATION_ID to sync the sandbox location.';
    return;
  }

  isSyncing.value = true;
  integrationError.value = null;

  try {
    integration.value = await syncHighLevel(locationId);
  } catch (error) {
    integrationError.value =
      error instanceof Error ? error.message : 'Unable to sync HighLevel data';
  } finally {
    isSyncing.value = false;
  }
}

async function analyzeAgent(agentId: string): Promise<void> {
  analyzingAgentId.value = agentId;
  analysisError.value = null;

  try {
    const result = await runAgentAnalysis(agentId);
    analysesByAgentId.value = {
      ...analysesByAgentId.value,
      [agentId]: result,
    };
  } catch (error) {
    analysisError.value = error instanceof Error ? error.message : 'Unable to analyze transcripts';
  } finally {
    analyzingAgentId.value = null;
  }
}

async function optimizeAgent(agentId: string): Promise<void> {
  optimizingAgentId.value = agentId;
  optimizationError.value = null;

  try {
    const result = await runOptimization(agentId);
    optimizationsByAgentId.value = {
      ...optimizationsByAgentId.value,
      [agentId]: result,
    };
  } catch (error) {
    optimizationError.value =
      error instanceof Error ? error.message : 'Unable to run optimization loop';
  } finally {
    optimizingAgentId.value = null;
  }
}

function analysesForAgent(agentId: string): TranscriptAnalysis[] {
  return analysesByAgentId.value[agentId]?.analyses ?? [];
}

function patternsForAgent(agentId: string): PerformancePattern[] {
  return analysesByAgentId.value[agentId]?.patterns ?? [];
}

function averageScore(agentId: string): number {
  const analyses = analysesForAgent(agentId);

  if (analyses.length === 0) {
    return 0;
  }

  return Math.round(
    analyses.reduce((total, analysis) => total + analysis.score, 0) / analyses.length,
  );
}

function failureCount(agentId: string): number {
  return analysesForAgent(agentId).filter((analysis) => analysis.outcome === 'failure').length;
}

function patternLabel(pattern: PerformancePattern): string {
  return pattern.category.replaceAll('_', ' ');
}

function evaluationForTestCase(agentId: string, testCaseId: string): TestEvaluation | undefined {
  return optimizationsByAgentId.value[agentId]?.evaluations.find(
    (evaluation) => evaluation.testCaseId === testCaseId,
  );
}

function testCasesForAgent(agentId: string): OptimizerTestCase[] {
  return optimizationsByAgentId.value[agentId]?.testCases ?? [];
}

function recommendationsForAgent(agentId: string): OptimizationRecommendation[] {
  return optimizationsByAgentId.value[agentId]?.recommendations ?? [];
}

function failedEvaluationCount(agentId: string): number {
  return (
    optimizationsByAgentId.value[agentId]?.evaluations.filter(
      (evaluation) => evaluation.status === 'fail',
    ).length ?? 0
  );
}

const loopCards = [
  {
    title: 'Analyze transcripts',
    description: 'Score calls, detect missed steps, and group recurring failure patterns.',
    icon: FileText,
  },
  {
    title: 'Generate tests',
    description: 'Create happy-path and edge-case scenarios with explicit success criteria.',
    icon: ClipboardCheck,
  },
  {
    title: 'Recommend fixes',
    description: 'Propose prompt, model, temperature, tool, action, and guardrail changes.',
    icon: Lightbulb,
  },
];
</script>

<template>
  <main class="min-h-screen bg-[var(--surface)] text-[var(--ink)]">
    <section class="border-b border-[var(--border)] bg-white">
      <div class="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-sm font-medium text-[var(--muted)]">HighLevel Voice AI</p>
            <h1 class="mt-2 text-3xl font-semibold tracking-normal">Agent Optimizer</h1>
          </div>

          <div class="flex items-center gap-3 rounded-md border border-[var(--border)] px-4 py-3">
            <Activity class="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
            <div>
              <p class="text-xs font-medium uppercase text-[var(--muted)]">API Status</p>
              <p class="text-sm font-semibold">
                <span v-if="health">{{ health.status }}</span>
                <span v-else-if="healthError">degraded</span>
                <span v-else>checking</span>
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <article
            v-for="card in loopCards"
            :key="card.title"
            class="rounded-md border border-[var(--border)] bg-[var(--panel)] p-5"
          >
            <component :is="card.icon" class="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
            <h2 class="mt-4 text-base font-semibold">{{ card.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-[var(--muted)]">{{ card.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <div class="rounded-md border border-[var(--border)] bg-white p-6">
        <div class="flex items-center gap-3">
          <Bot class="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
          <h2 class="text-lg font-semibold">Phase 2 HighLevel Sync</h2>
        </div>
        <dl class="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Location</dt>
            <dd class="mt-1 text-sm">{{ locationId || 'not configured' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Agents synced</dt>
            <dd class="mt-1 text-sm">{{ integration?.syncedAgents.length ?? 0 }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Call logs found</dt>
            <dd class="mt-1 text-sm">{{ integration?.callLogs.length ?? 0 }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Transcripts imported</dt>
            <dd class="mt-1 text-sm">{{ integration?.transcriptImports.imported ?? 0 }}</dd>
          </div>
        </dl>

        <button
          class="mt-6 inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isSyncing"
          @click="runSync"
        >
          <RefreshCw class="h-4 w-4" aria-hidden="true" />
          {{ isSyncing ? 'Syncing' : 'Sync HighLevel' }}
        </button>

        <p
          v-if="integrationError"
          class="mt-4 rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {{ integrationError }}
        </p>
      </div>

      <div class="rounded-md border border-[var(--border)] bg-white p-6">
        <h2 class="text-lg font-semibold">Readiness</h2>
        <div class="mt-5 space-y-3 text-sm">
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span class="text-[var(--muted)]">Correlation ID</span>
            <span class="font-mono text-xs">{{ health?.correlationId ?? 'pending' }}</span>
          </div>
          <div class="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span class="text-[var(--muted)]">Database</span>
            <span>{{ health?.checks.database ?? 'pending' }}</span>
          </div>
          <p
            v-if="healthError"
            class="rounded-md bg-[var(--danger-bg)] px-3 py-2 text-[var(--danger)]"
          >
            {{ healthError }}
          </p>
        </div>
      </div>
    </section>

    <section
      v-if="integration"
      class="mx-auto grid max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8"
    >
      <div class="rounded-md border border-[var(--border)] bg-white p-6">
        <h2 class="text-lg font-semibold">Synced Agents</h2>
        <div class="mt-5 space-y-4">
          <article
            v-for="agent in integration.syncedAgents"
            :key="agent.id"
            class="rounded-md border border-[var(--border)] p-4"
          >
            <h3 class="text-sm font-semibold">{{ agent.name }}</h3>
            <p class="mt-1 text-xs text-[var(--muted)]">HighLevel ID: {{ agent.ghlAgentId }}</p>
            <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt class="text-[var(--muted)]">Actions</dt>
                <dd>{{ agent.actions.length }}</dd>
              </div>
              <div>
                <dt class="text-[var(--muted)]">Prompt variables</dt>
                <dd>{{ agent.unresolvedVariables.length }}</dd>
              </div>
            </dl>

            <div class="mt-4 flex flex-wrap gap-2">
              <button
                class="inline-flex items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="analyzingAgentId === agent.id"
                @click="analyzeAgent(agent.id)"
              >
                <BarChart3 class="h-4 w-4" aria-hidden="true" />
                {{ analyzingAgentId === agent.id ? 'Analyzing' : 'Run analysis' }}
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="optimizingAgentId === agent.id"
                @click="optimizeAgent(agent.id)"
              >
                <ClipboardCheck class="h-4 w-4" aria-hidden="true" />
                {{ optimizingAgentId === agent.id ? 'Optimizing' : 'Run optimizer' }}
              </button>
            </div>
          </article>
        </div>
      </div>

      <div class="rounded-md border border-[var(--border)] bg-white p-6">
        <div class="flex items-center gap-3">
          <AlertTriangle class="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
          <h2 class="text-lg font-semibold">Integration Notes</h2>
        </div>
        <ul class="mt-5 space-y-3 text-sm">
          <li
            v-for="warning in integration.warnings"
            :key="warning"
            class="rounded-md bg-[var(--warning-bg)] px-3 py-2 text-[var(--warning-ink)]"
          >
            {{ warning }}
          </li>
        </ul>
      </div>
    </section>

    <section v-if="integration" class="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
      <div class="rounded-md border border-[var(--border)] bg-white p-6">
        <div class="flex items-center gap-3">
          <BarChart3 class="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
          <h2 class="text-lg font-semibold">Transcript Analysis</h2>
        </div>

        <p
          v-if="analysisError"
          class="mt-4 rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {{ analysisError }}
        </p>

        <div class="mt-5 space-y-5">
          <article
            v-for="agent in integration.syncedAgents"
            :key="`${agent.id}-analysis`"
            class="rounded-md border border-[var(--border)] p-4"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 class="text-sm font-semibold">{{ agent.name }}</h3>
                <p class="mt-1 font-mono text-xs text-[var(--muted)]">{{ agent.id }}</p>
              </div>
              <p class="text-sm font-medium text-[var(--muted)]">
                {{ analysesForAgent(agent.id).length }} analyzed calls
              </p>
            </div>

            <div v-if="analysesByAgentId[agent.id]" class="mt-5 space-y-5">
              <dl class="grid gap-3 text-sm sm:grid-cols-3">
                <div class="rounded-md bg-[var(--surface)] p-3">
                  <dt class="text-[var(--muted)]">Average score</dt>
                  <dd class="mt-1 text-xl font-semibold">{{ averageScore(agent.id) }}</dd>
                </div>
                <div class="rounded-md bg-[var(--surface)] p-3">
                  <dt class="text-[var(--muted)]">Failures</dt>
                  <dd class="mt-1 text-xl font-semibold">{{ failureCount(agent.id) }}</dd>
                </div>
                <div class="rounded-md bg-[var(--surface)] p-3">
                  <dt class="text-[var(--muted)]">Recurring patterns</dt>
                  <dd class="mt-1 text-xl font-semibold">
                    {{ patternsForAgent(agent.id).length }}
                  </dd>
                </div>
              </dl>

              <div
                v-if="patternsForAgent(agent.id).length > 0"
                class="rounded-md bg-[var(--warning-bg)] p-4"
              >
                <h4 class="text-sm font-semibold text-[var(--warning-ink)]">Recurring issues</h4>
                <ul class="mt-3 space-y-2 text-sm text-[var(--warning-ink)]">
                  <li
                    v-for="pattern in patternsForAgent(agent.id)"
                    :key="`${pattern.category}-${pattern.exampleEvidence}`"
                  >
                    <span class="font-semibold">{{ patternLabel(pattern) }}</span>
                    <span class="text-[var(--muted)]">
                      · {{ pattern.count }} calls · {{ pattern.severity }}
                    </span>
                  </li>
                </ul>
              </div>

              <div class="grid gap-4 lg:grid-cols-2">
                <article
                  v-for="analysis in analysesForAgent(agent.id)"
                  :key="analysis.transcriptId"
                  class="rounded-md border border-[var(--border)] p-4"
                >
                  <div class="flex items-center justify-between gap-3">
                    <p class="font-mono text-xs text-[var(--muted)]">
                      {{ analysis.transcriptId }}
                    </p>
                    <span
                      class="rounded-md px-2 py-1 text-xs font-semibold"
                      :class="
                        analysis.outcome === 'success'
                          ? 'bg-[var(--success-bg)] text-[var(--success-ink)]'
                          : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                      "
                    >
                      {{ analysis.outcome }} · {{ analysis.score }}
                    </span>
                  </div>
                  <p class="mt-3 text-sm leading-6">{{ analysis.summary }}</p>

                  <div v-if="analysis.missedCriteria.length > 0" class="mt-4">
                    <h5 class="text-xs font-semibold uppercase text-[var(--muted)]">
                      Missed criteria
                    </h5>
                    <ul class="mt-2 space-y-2 text-sm">
                      <li
                        v-for="criterion in analysis.missedCriteria"
                        :key="criterion.key"
                        class="rounded-md bg-[var(--surface)] px-3 py-2"
                      >
                        {{ criterion.label }}
                      </li>
                    </ul>
                  </div>
                </article>
              </div>
            </div>

            <p
              v-else
              class="mt-4 rounded-md bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
            >
              Run analysis after syncing transcripts for this agent.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section v-if="integration" class="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
      <div class="rounded-md border border-[var(--border)] bg-white p-6">
        <div class="flex items-center gap-3">
          <Lightbulb class="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
          <h2 class="text-lg font-semibold">Generated Tests & Recommendations</h2>
        </div>

        <p
          v-if="optimizationError"
          class="mt-4 rounded-md bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]"
        >
          {{ optimizationError }}
        </p>

        <div class="mt-5 space-y-5">
          <article
            v-for="agent in integration.syncedAgents"
            :key="`${agent.id}-optimization`"
            class="rounded-md border border-[var(--border)] p-4"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 class="text-sm font-semibold">{{ agent.name }}</h3>
                <p class="mt-1 font-mono text-xs text-[var(--muted)]">{{ agent.id }}</p>
              </div>
              <dl class="grid grid-cols-3 gap-3 text-sm">
                <div class="rounded-md bg-[var(--surface)] px-3 py-2">
                  <dt class="text-[var(--muted)]">Tests</dt>
                  <dd class="font-semibold">
                    {{ optimizationsByAgentId[agent.id]?.testCases.length ?? 0 }}
                  </dd>
                </div>
                <div class="rounded-md bg-[var(--surface)] px-3 py-2">
                  <dt class="text-[var(--muted)]">Failures</dt>
                  <dd class="font-semibold">{{ failedEvaluationCount(agent.id) }}</dd>
                </div>
                <div class="rounded-md bg-[var(--surface)] px-3 py-2">
                  <dt class="text-[var(--muted)]">Fixes</dt>
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
                    v-for="testCase in testCasesForAgent(agent.id)"
                    :key="testCase.id"
                    class="rounded-md border border-[var(--border)] p-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h5 class="text-sm font-semibold">{{ testCase.title }}</h5>
                        <p class="mt-1 text-xs uppercase text-[var(--muted)]">
                          {{ testCase.pathType.replace('_', ' ') }}
                        </p>
                      </div>
                      <span
                        v-if="evaluationForTestCase(agent.id, testCase.id)"
                        class="rounded-md px-2 py-1 text-xs font-semibold"
                        :class="
                          evaluationForTestCase(agent.id, testCase.id)?.status === 'pass'
                            ? 'bg-[var(--success-bg)] text-[var(--success-ink)]'
                            : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                        "
                      >
                        {{ evaluationForTestCase(agent.id, testCase.id)?.status }}
                        · {{ evaluationForTestCase(agent.id, testCase.id)?.score }}
                      </span>
                    </div>
                    <p class="mt-3 text-sm leading-6">{{ testCase.scenario }}</p>
                    <ul class="mt-3 space-y-2 text-sm">
                      <li
                        v-for="criterion in testCase.successCriteria"
                        :key="criterion"
                        class="rounded-md bg-[var(--surface)] px-3 py-2"
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
                    v-for="recommendation in recommendationsForAgent(agent.id)"
                    :key="recommendation.id"
                    class="rounded-md border border-[var(--border)] p-4"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h5 class="text-sm font-semibold">{{ recommendation.title }}</h5>
                        <p class="mt-1 text-xs uppercase text-[var(--muted)]">
                          {{ recommendation.target.replace('_', ' ') }} ·
                          {{ recommendation.status }}
                        </p>
                      </div>
                      <span class="rounded-md bg-[var(--surface)] px-2 py-1 text-xs font-semibold">
                        {{ recommendation.evidenceIds.length }} evidence
                      </span>
                    </div>
                    <dl class="mt-4 grid gap-3 text-sm">
                      <div>
                        <dt class="font-semibold text-[var(--muted)]">Before</dt>
                        <dd class="mt-1 max-h-28 overflow-auto rounded-md bg-[var(--surface)] p-3">
                          {{ recommendation.before }}
                        </dd>
                      </div>
                      <div>
                        <dt class="font-semibold text-[var(--muted)]">After</dt>
                        <dd class="mt-1 max-h-28 overflow-auto rounded-md bg-[var(--surface)] p-3">
                          {{ recommendation.after }}
                        </dd>
                      </div>
                    </dl>
                    <p class="mt-3 text-sm leading-6 text-[var(--muted)]">
                      {{ recommendation.reasoning }}
                    </p>
                  </article>
                </div>
              </div>
            </div>

            <p
              v-else
              class="mt-4 rounded-md bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]"
            >
              Run the optimizer to generate test cases, evaluate the current config, and propose
              changes.
            </p>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
