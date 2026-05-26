<!--
  App.vue - Dashboard composition root.

  Keeps layout orchestration thin by delegating state to useOptimizerDashboard
  and rendering focused dashboard section components.
-->
<script setup lang="ts">
import AnalysisPanel from './components/AnalysisPanel.vue';
import DashboardHero from './components/DashboardHero.vue';
import HighLevelSyncPanel from './components/HighLevelSyncPanel.vue';
import OptimizationPanel from './components/OptimizationPanel.vue';
import SyncedAgentsPanel from './components/SyncedAgentsPanel.vue';
import { useOptimizerDashboard } from './composables/useOptimizerDashboard';

const {
  health,
  healthError,
  integration,
  integrationError,
  analysesByAgentId,
  optimizationsByAgentId,
  analysisError,
  optimizationError,
  analyzingAgentId,
  optimizingAgentId,
  isSyncing,
  locationId,
  runSync,
  analyzeAgent,
  optimizeAgent,
} = useOptimizerDashboard();
</script>

<template>
  <main class="min-h-screen bg-(--surface) text-(--ink)">
    <DashboardHero :health="health" :health-error="healthError" />

    <HighLevelSyncPanel
      :health="health"
      :health-error="healthError"
      :integration="integration"
      :integration-error="integrationError"
      :is-syncing="isSyncing"
      :location-id="locationId"
      @sync="runSync"
    />

    <template v-if="integration">
      <SyncedAgentsPanel
        :integration="integration"
        :analyzing-agent-id="analyzingAgentId"
        :optimizing-agent-id="optimizingAgentId"
        @analyze="analyzeAgent"
        @optimize="optimizeAgent"
      />

      <AnalysisPanel
        :integration="integration"
        :analyses-by-agent-id="analysesByAgentId"
        :analysis-error="analysisError"
      />

      <OptimizationPanel
        :integration="integration"
        :optimizations-by-agent-id="optimizationsByAgentId"
        :optimization-error="optimizationError"
      />
    </template>
  </main>
</template>
