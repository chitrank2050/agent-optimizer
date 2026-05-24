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
