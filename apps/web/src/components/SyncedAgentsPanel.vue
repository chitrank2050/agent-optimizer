<!--
  SyncedAgentsPanel - Agent inventory and action controls.

  Lists synced Voice AI agents, prompt/action metadata, integration warnings,
  and the analysis/optimizer commands for each agent.
-->
<script setup lang="ts">
import { AlertTriangle, BarChart3, ClipboardCheck } from 'lucide-vue-next';

import type { HighLevelSyncResponse } from '@agent-optimizer/contracts';

defineProps<{
  integration: HighLevelSyncResponse;
  analyzingAgentId: string | null;
  optimizingAgentId: string | null;
}>();

defineEmits<{
  analyze: [agentId: string];
  optimize: [agentId: string];
}>();
</script>

<template>
  <section class="mx-auto grid max-w-7xl gap-6 px-6 pb-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
    <div class="rounded-md border border-(--border) bg-white p-6">
      <h2 class="text-lg font-semibold">Synced Agents</h2>
      <div class="mt-5 space-y-4">
        <article
          v-for="agent in integration.syncedAgents"
          :key="agent.id"
          class="rounded-md border border-(--border) p-4"
        >
          <h3 class="text-sm font-semibold">{{ agent.name }}</h3>
          <p class="mt-1 text-xs text-(--muted)">HighLevel ID: {{ agent.ghlAgentId }}</p>
          <dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt class="text-(--muted)">Actions</dt>
              <dd>{{ agent.actions.length }}</dd>
            </div>
            <div>
              <dt class="text-(--muted)">Prompt variables</dt>
              <dd>{{ agent.unresolvedVariables.length }}</dd>
            </div>
          </dl>

          <div class="mt-4 flex flex-wrap gap-2">
            <button
              class="inline-flex items-center gap-2 rounded-md border border-(--border) px-3 py-2 text-sm font-semibold text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="analyzingAgentId === agent.id"
              @click="$emit('analyze', agent.id)"
            >
              <BarChart3 class="h-4 w-4" aria-hidden="true" />
              {{ analyzingAgentId === agent.id ? 'Analyzing' : 'Run analysis' }}
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-md bg-(--accent) px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              :disabled="optimizingAgentId === agent.id"
              @click="$emit('optimize', agent.id)"
            >
              <ClipboardCheck class="h-4 w-4" aria-hidden="true" />
              {{ optimizingAgentId === agent.id ? 'Optimizing' : 'Run optimizer' }}
            </button>
          </div>
        </article>
      </div>
    </div>

    <div class="rounded-md border border-(--border) bg-white p-6">
      <div class="flex items-center gap-3">
        <AlertTriangle class="h-5 w-5 text-(--warning)" aria-hidden="true" />
        <h2 class="text-lg font-semibold">Integration Notes</h2>
      </div>
      <ul class="mt-5 space-y-3 text-sm">
        <li
          v-for="warning in integration.warnings"
          :key="warning"
          class="rounded-md bg-(--warning-bg) px-3 py-2 text-(--warning-ink)"
        >
          {{ warning }}
        </li>
      </ul>
    </div>
  </section>
</template>
