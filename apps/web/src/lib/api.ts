import {
  healthResponseSchema,
  highLevelSyncResponseSchema,
  type HealthResponse,
  type HighLevelSyncResponse,
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
