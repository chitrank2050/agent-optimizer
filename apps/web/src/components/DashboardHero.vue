<script setup lang="ts">
import { Activity, ClipboardCheck, FileText, Lightbulb } from 'lucide-vue-next';
import type { Component } from 'vue';
import type { HealthResponse } from '@agent-optimizer/contracts';

defineProps<{
  health: HealthResponse | null;
  healthError: string | null;
}>();

const loopCards: Array<{ title: string; description: string; icon: Component }> = [
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
</template>
