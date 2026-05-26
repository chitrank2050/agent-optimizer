<!--
  AnalysisPanel - Transcript analysis dashboard section.

  Shows per-agent scores, failure counts, recurring patterns, and missed
  criteria after the backend analysis loop runs.
-->
<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next';
import type {
  AnalysisBatch,
  HighLevelSyncResponse,
  PerformancePattern,
  TranscriptAnalysis,
} from '@agent-optimizer/contracts';

defineProps<{
  integration: HighLevelSyncResponse;
  analysesByAgentId: Record<string, AnalysisBatch>;
  analysisError: string | null;
}>();

function analysesForAgent(
  analysesByAgentId: Record<string, AnalysisBatch>,
  agentId: string,
): TranscriptAnalysis[] {
  return analysesByAgentId[agentId]?.analyses ?? [];
}

function patternsForAgent(
  analysesByAgentId: Record<string, AnalysisBatch>,
  agentId: string,
): PerformancePattern[] {
  return analysesByAgentId[agentId]?.patterns ?? [];
}

function averageScore(analysesByAgentId: Record<string, AnalysisBatch>, agentId: string): number {
  const analyses = analysesForAgent(analysesByAgentId, agentId);

  if (analyses.length === 0) {
    return 0;
  }

  return Math.round(
    analyses.reduce((total, analysis) => total + analysis.score, 0) / analyses.length,
  );
}

function failureCount(analysesByAgentId: Record<string, AnalysisBatch>, agentId: string): number {
  return analysesForAgent(analysesByAgentId, agentId).filter(
    (analysis) => analysis.outcome === 'failure',
  ).length;
}

function patternLabel(pattern: PerformancePattern): string {
  return pattern.category.replaceAll('_', ' ');
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
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
            <p class="text-sm font-medium text-(--muted)">
              {{ analysesForAgent(analysesByAgentId, agent.id).length }} analyzed calls
            </p>
          </div>

          <div v-if="analysesByAgentId[agent.id]" class="mt-5 space-y-5">
            <dl class="grid gap-3 text-sm sm:grid-cols-3">
              <div class="rounded-md bg-(--surface) p-3">
                <dt class="text-(--muted)">Average score</dt>
                <dd class="mt-1 text-xl font-semibold">
                  {{ averageScore(analysesByAgentId, agent.id) }}
                </dd>
              </div>
              <div class="rounded-md bg-(--surface) p-3">
                <dt class="text-(--muted)">Failures</dt>
                <dd class="mt-1 text-xl font-semibold">
                  {{ failureCount(analysesByAgentId, agent.id) }}
                </dd>
              </div>
              <div class="rounded-md bg-(--surface) p-3">
                <dt class="text-(--muted)">Recurring patterns</dt>
                <dd class="mt-1 text-xl font-semibold">
                  {{ patternsForAgent(analysesByAgentId, agent.id).length }}
                </dd>
              </div>
            </dl>

            <div
              v-if="patternsForAgent(analysesByAgentId, agent.id).length > 0"
              class="rounded-md bg-(--warning-bg) p-4"
            >
              <h4 class="text-sm font-semibold text-(--warning-ink)">Recurring issues</h4>
              <ul class="mt-3 space-y-2 text-sm text-(--warning-ink)">
                <li
                  v-for="pattern in patternsForAgent(analysesByAgentId, agent.id)"
                  :key="`${pattern.category}-${pattern.exampleEvidence}`"
                >
                  <span class="font-semibold">{{ patternLabel(pattern) }}</span>
                  <span class="text-(--muted)">
                    · {{ pattern.count }} calls · {{ pattern.severity }}
                  </span>
                </li>
              </ul>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <article
                v-for="analysis in analysesForAgent(analysesByAgentId, agent.id)"
                :key="analysis.transcriptId"
                class="rounded-md border border-(--border) p-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <p class="font-mono text-xs text-(--muted)">
                    {{ analysis.transcriptId }}
                  </p>
                  <span
                    class="rounded-md px-2 py-1 text-xs font-semibold"
                    :class="
                      analysis.outcome === 'success'
                        ? 'bg-(--success-bg) text-(--success-ink)'
                        : 'bg-(--danger-bg) text-(--danger)'
                    "
                  >
                    {{ analysis.outcome }} · {{ analysis.score }}
                  </span>
                </div>
                <p class="mt-3 text-sm leading-6">{{ analysis.summary }}</p>

                <div v-if="analysis.missedCriteria.length > 0" class="mt-4">
                  <h5 class="text-xs font-semibold uppercase text-(--muted)">
                    Missed criteria
                  </h5>
                  <ul class="mt-2 space-y-2 text-sm">
                    <li
                      v-for="criterion in analysis.missedCriteria"
                      :key="criterion.key"
                      class="rounded-md bg-(--surface) px-3 py-2"
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
</template>
