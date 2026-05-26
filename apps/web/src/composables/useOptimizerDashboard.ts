/**
 * useOptimizerDashboard - Orchestrates dashboard API state.
 *
 * Owns health checks, HighLevel sync, transcript analysis, and optimization run
 * state so Vue components remain focused on rendering and events.
 */
import { onMounted, ref } from 'vue';
import type {
  AnalysisBatch,
  HealthResponse,
  HighLevelSyncResponse,
  OptimizationRun,
} from '@agent-optimizer/contracts';

import { getHealth, runAgentAnalysis, runOptimization, syncHighLevel } from '../lib/api';

/**
 * Owns dashboard orchestration state while keeping the view components presentational.
 */
export function useOptimizerDashboard() {
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
      analysesByAgentId.value = {};
      optimizationsByAgentId.value = {};
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

    // Clear optimization for this agent on the frontend since it is now out of date.
    const newOptimizations = { ...optimizationsByAgentId.value };
    delete newOptimizations[agentId];
    optimizationsByAgentId.value = newOptimizations;

    try {
      const result = await runAgentAnalysis(agentId);
      analysesByAgentId.value = {
        ...analysesByAgentId.value,
        [agentId]: result,
      };
    } catch (error) {
      analysisError.value =
        error instanceof Error ? error.message : 'Unable to analyze transcripts';
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

  return {
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
  };
}
