import { z } from 'zod';

export const healthStatusSchema = z.enum(['ok', 'degraded', 'down']);

export const healthResponseSchema = z.object({
  status: healthStatusSchema,
  service: z.literal('agent-optimizer-api'),
  timestamp: z.string().datetime(),
  correlationId: z.string().min(1),
  checks: z.object({
    api: healthStatusSchema,
    database: healthStatusSchema.optional(),
  }),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const ghlContextSchema = z.object({
  userId: z.string().min(1),
  companyId: z.string().min(1),
  activeLocation: z.string().min(1).optional(),
  role: z.string().min(1),
  type: z.enum(['agency', 'location']).or(z.string().min(1)),
  userName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isAgencyOwner: z.boolean().optional(),
});

export type GhlContext = z.infer<typeof ghlContextSchema>;

export const agentConfigSchema = z.object({
  agentId: z.string().min(1),
  name: z.string().min(1),
  prompt: z.string().min(1),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  tools: z.array(z.string().min(1)).default([]),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;

export const transcriptTurnSchema = z.object({
  speaker: z.enum(['agent', 'caller', 'system']),
  text: z.string().min(1),
  startedAtSeconds: z.number().nonnegative().optional(),
});

export const transcriptSchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1),
  contactId: z.string().min(1).optional(),
  callStartedAt: z.string().datetime(),
  summary: z.string().optional(),
  turns: z.array(transcriptTurnSchema).min(1),
});

export type Transcript = z.infer<typeof transcriptSchema>;

export const issueCategorySchema = z.enum([
  'booking_flow',
  'qualification',
  'objection_handling',
  'tone',
  'follow_up',
  'policy',
  'knowledge_gap',
]);

export const transcriptFindingSchema = z.object({
  category: issueCategorySchema,
  severity: z.enum(['low', 'medium', 'high']),
  evidence: z.string().min(1),
  recommendationHint: z.string().min(1),
});

export type TranscriptFinding = z.infer<typeof transcriptFindingSchema>;

export const testCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  scenario: z.string().min(1),
  pathType: z.enum(['happy_path', 'edge_case']),
  successCriteria: z.array(z.string().min(1)).min(1),
});

export type OptimizerTestCase = z.infer<typeof testCaseSchema>;

export const recommendationSchema = z.object({
  id: z.string().min(1),
  target: z.enum([
    'prompt',
    'temperature',
    'model',
    'tool',
    'action',
    'knowledge_base',
    'guardrail',
  ]),
  title: z.string().min(1),
  before: z.string().min(1),
  after: z.string().min(1),
  reasoning: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).default([]),
});

export type OptimizationRecommendation = z.infer<typeof recommendationSchema>;

export const integrationSourceSchema = z.enum(['highlevel', 'seeded', 'manual']);

export type IntegrationSource = z.infer<typeof integrationSourceSchema>;

export const highLevelActionSchema = z.object({
  id: z.string().min(1),
  actionType: z.string().min(1),
  name: z.string().min(1),
  actionParameters: z.record(z.string(), z.unknown()).default({}),
});

export type HighLevelAction = z.infer<typeof highLevelActionSchema>;

export const syncedAgentSchema = z.object({
  id: z.string().min(1),
  ghlAgentId: z.string().min(1),
  locationId: z.string().min(1),
  name: z.string().min(1),
  businessName: z.string().optional(),
  language: z.string().optional(),
  voiceId: z.string().optional(),
  responsiveness: z.number().optional(),
  maxCallDuration: z.number().optional(),
  prompt: z.string().min(1),
  actions: z.array(highLevelActionSchema).default([]),
  unresolvedVariables: z.array(z.string().min(1)).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SyncedAgent = z.infer<typeof syncedAgentSchema>;

export const callLogSummarySchema = z.object({
  id: z.string().min(1),
  agentId: z.string().min(1).optional(),
  contactId: z.string().min(1).optional(),
  status: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  durationSeconds: z.number().nonnegative().optional(),
  summary: z.string().optional(),
  transcriptAvailable: z.boolean().default(false),
});

export type CallLogSummary = z.infer<typeof callLogSummarySchema>;

export const highLevelSyncRequestSchema = z.object({
  locationId: z.string().min(1),
});

export type HighLevelSyncRequest = z.infer<typeof highLevelSyncRequestSchema>;

export const highLevelSyncResponseSchema = z.object({
  locationId: z.string().min(1),
  tenantId: z.string().min(1),
  syncedAgents: z.array(syncedAgentSchema),
  callLogs: z.array(callLogSummarySchema),
  transcriptImports: z.object({
    imported: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    source: integrationSourceSchema,
  }),
  warnings: z.array(z.string().min(1)).default([]),
});

export type HighLevelSyncResponse = z.infer<typeof highLevelSyncResponseSchema>;

export const optimizerDashboardSchema = z.object({
  health: healthResponseSchema.optional(),
  integration: highLevelSyncResponseSchema.optional(),
});

export type OptimizerDashboard = z.infer<typeof optimizerDashboardSchema>;
