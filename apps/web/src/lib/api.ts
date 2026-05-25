import {
  analysisBatchSchema,
  healthResponseSchema,
  highLevelSyncResponseSchema,
  optimizationRunSchema,
  type AnalysisBatch,
  type HealthResponse,
  type HighLevelSyncResponse,
  type OptimizationRun,
} from '@agent-optimizer/contracts';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiBaseUrl}/health`, {
    headers: {
      'x-correlation-id': crypto.randomUUID(),
    },
  });

  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}`);
  }

  return healthResponseSchema.parse(await response.json());
}

export async function syncHighLevel(locationId: string): Promise<HighLevelSyncResponse> {
  const response = await fetch(`${apiBaseUrl}/integrations/highlevel/sync`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': crypto.randomUUID(),
    },
    body: JSON.stringify({ locationId }),
  });

  if (!response.ok) {
    throw new Error(`HighLevel sync failed with status ${response.status}`);
  }

  return highLevelSyncResponseSchema.parse(await response.json());
}

export async function runAgentAnalysis(agentId: string): Promise<AnalysisBatch> {
  const response = await fetch(`${apiBaseUrl}/analysis/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'x-correlation-id': crypto.randomUUID(),
    },
  });

  if (!response.ok) {
    throw new Error(`Analysis failed with status ${response.status}`);
  }

  return analysisBatchSchema.parse(await response.json());
}

export async function runOptimization(agentId: string): Promise<OptimizationRun> {
  const response = await fetch(`${apiBaseUrl}/optimization/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'x-correlation-id': crypto.randomUUID(),
    },
  });

  if (!response.ok) {
    throw new Error(`Optimization failed with status ${response.status}`);
  }

  return optimizationRunSchema.parse(await response.json());
}
