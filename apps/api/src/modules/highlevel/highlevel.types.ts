/**
 * Runtime schemas for HighLevel vendor payloads.
 *
 * HighLevel responses arrive as untrusted JSON; these Zod schemas validate the
 * subset the optimizer reads before data is mapped into local persistence.
 */
import { z } from 'zod';

export const highLevelLocationSchema = z.object({
  id: z.string().min(1),
  companyId: z.string().min(1),
  name: z.string().min(1),
});

export type HighLevelLocation = z.infer<typeof highLevelLocationSchema>;

export const highLevelActionSchema = z.object({
  id: z.string().min(1),
  actionType: z.string().min(1),
  name: z.string().min(1),
  actionParameters: z.record(z.string(), z.unknown()).default({}),
});

export type HighLevelAction = z.infer<typeof highLevelActionSchema>;

// The Voice AI agent response is intentionally narrower than the full API payload.
// We persist only the fields needed for optimization: script, actions, language,
// voice/runtime knobs, and account linkage.
export const highLevelAgentSchema = z.object({
  id: z.string().min(1),
  locationId: z.string().min(1),
  agentName: z.string().min(1),
  businessName: z.string().optional(),
  welcomeMessage: z.string().optional(),
  agentPrompt: z.string().min(1),
  voiceId: z.string().optional(),
  language: z.string().optional(),
  responsiveness: z.number().optional(),
  maxCallDuration: z.number().optional(),
  actions: z.array(highLevelActionSchema).default([]),
});

export type HighLevelAgent = z.infer<typeof highLevelAgentSchema>;

export const highLevelAgentsResponseSchema = z.object({
  agents: z.array(highLevelAgentSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  traceId: z.string().optional(),
});

// Call-log payload shape can expand once web calls produce transcript data. Keep
// raw call-log rows as unknown records and normalize only the stable fields.
export const highLevelCallLogsResponseSchema = z.object({
  callLogs: z.array(z.record(z.string(), z.unknown())),
  totalRecords: z.number().optional(),
  traceId: z.string().optional(),
});

export type HighLevelCallLogsResponse = z.infer<typeof highLevelCallLogsResponseSchema>;
