<script setup lang="ts">
import { Activity, Bot, ClipboardCheck, FileText, Lightbulb } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';
import type { HealthResponse } from '@agent-optimizer/contracts';

import { getHealth } from './lib/api';

const health = ref<HealthResponse | null>(null);
const healthError = ref<string | null>(null);

onMounted(async () => {
  try {
    health.value = await getHealth();
  } catch (error) {
    healthError.value = error instanceof Error ? error.message : 'Unable to reach API';
  }
});

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
          <h2 class="text-lg font-semibold">Phase 1 Foundation</h2>
        </div>
        <dl class="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Frontend</dt>
            <dd class="mt-1 text-sm">Vue 3, Vite, Tailwind CSS</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Backend</dt>
            <dd class="mt-1 text-sm">NestJS, Prisma, PostgreSQL</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Contracts</dt>
            <dd class="mt-1 text-sm">Shared Zod schemas and typed DTOs</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-[var(--muted)]">Integration target</dt>
            <dd class="mt-1 text-sm">HighLevel Marketplace Custom Page</dd>
          </div>
        </dl>
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
  </main>
</template>
