<script setup lang="ts">
import { Bot, RefreshCw } from 'lucide-vue-next';
import type { HealthResponse, HighLevelSyncResponse } from '@agent-optimizer/contracts';

defineProps<{
  health: HealthResponse | null;
  healthError: string | null;
  integration: HighLevelSyncResponse | null;
  integrationError: string | null;
  isSyncing: boolean;
  locationId: string;
}>();

defineEmits<{
  sync: [];
}>();
</script>

<template>
  <section class="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
    <div class="rounded-md border border-[var(--border)] bg-white p-6">
      <div class="flex items-center gap-3">
        <Bot class="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
        <h2 class="text-lg font-semibold">HighLevel Sync</h2>
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
        @click="$emit('sync')"
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
          <span class="font-mono text-xs">{{ health?.correlationId ?? 'not available' }}</span>
        </div>
        <div class="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <span class="text-[var(--muted)]">Database</span>
          <span>{{ health?.checks.database ?? 'checking' }}</span>
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
</template>
