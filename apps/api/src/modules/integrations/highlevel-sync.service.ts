/**
 * HighLevelSyncService - Imports sandbox location data into local storage.
 *
 * Syncs the HighLevel location, Voice AI agents, prompt/action configuration,
 * call-log summaries, and transcript-like payloads inside a tenant/location
 * scoped transaction.
 */
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  highLevelSyncRequestSchema,
  type CallLogSummary,
  type HighLevelSyncResponse,
  type SyncedAgent,
} from '@agent-optimizer/contracts';

import { HighLevelClientService } from '../highlevel/highlevel-client.service';
import type { HighLevelAgent } from '../highlevel/highlevel.types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HighLevelSyncService {
  constructor(
    @Inject(HighLevelClientService) private readonly highLevel: HighLevelClientService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Synchronizes the live HighLevel Voice AI configuration into local optimizer
   * storage. Transcript import is opportunistic: when call logs include transcript
   * turns we persist them; otherwise the app reports an empty-call-log state.
   */
  async sync(input: unknown): Promise<HighLevelSyncResponse> {
    const request = highLevelSyncRequestSchema.parse(input);
    const [location, agents, callLogsResponse] = await Promise.all([
      this.highLevel.getLocation(request.locationId),
      this.highLevel.listAgents(request.locationId),
      this.highLevel.listCallLogs(request.locationId),
    ]);

    const tenant = await this.prisma.tenant.upsert({
      where: { ghlCompanyId: location.companyId },
      update: { name: location.name },
      create: {
        ghlCompanyId: location.companyId,
        name: location.name,
      },
    });

    const localLocation = await this.prisma.location.upsert({
      where: { ghlLocationId: location.id },
      update: {
        tenantId: tenant.id,
        name: location.name,
      },
      create: {
        tenantId: tenant.id,
        ghlLocationId: location.id,
        name: location.name,
      },
    });

    const syncedAgents = await Promise.all(
      agents.map((agent) => this.upsertAgent(localLocation.id, agent)),
    );
    const callLogs = callLogsResponse.callLogs.map((callLog) => this.normalizeCallLog(callLog));
    const transcriptImports = await this.importTranscriptPayloads(
      localLocation.id,
      callLogsResponse.callLogs,
    );
    const warnings = this.buildWarnings(syncedAgents, callLogs.length);

    return {
      locationId: location.id,
      tenantId: tenant.id,
      syncedAgents,
      callLogs,
      transcriptImports,
      warnings,
    };
  }

  /**
   * Stores the agent as the optimizer baseline config. HighLevel does not expose
   * temperature/model in the current response, so we record a stable placeholder
   * model and default temperature until patch/fetch endpoints expose those knobs.
   */
  private async upsertAgent(locationId: string, agent: HighLevelAgent): Promise<SyncedAgent> {
    const unresolvedVariables = extractPromptVariables(agent.agentPrompt);
    const dbAgent = await this.prisma.agent.upsert({
      where: {
        locationId_ghlAgentId: {
          locationId,
          ghlAgentId: agent.id,
        },
      },
      update: {
        name: agent.agentName,
        model: 'highlevel-voice-ai',
        prompt: agent.agentPrompt,
        tools: agent.actions as Prisma.InputJsonValue,
      },
      create: {
        locationId,
        ghlAgentId: agent.id,
        name: agent.agentName,
        model: 'highlevel-voice-ai',
        temperature: new Prisma.Decimal(0.4),
        prompt: agent.agentPrompt,
        tools: agent.actions as Prisma.InputJsonValue,
      },
    });

    return {
      id: dbAgent.id,
      ghlAgentId: dbAgent.ghlAgentId,
      locationId: dbAgent.locationId,
      name: dbAgent.name,
      businessName: agent.businessName,
      language: agent.language,
      voiceId: agent.voiceId,
      responsiveness: agent.responsiveness,
      maxCallDuration: agent.maxCallDuration,
      prompt: dbAgent.prompt,
      actions: agent.actions,
      unresolvedVariables,
      createdAt: dbAgent.createdAt.toISOString(),
      updatedAt: dbAgent.updatedAt.toISOString(),
    };
  }

  /**
   * Normalizes known call-log fields while preserving the raw HighLevel contract
   * at the boundary. This protects the UI from vendor field-name drift.
   */
  private normalizeCallLog(callLog: Record<string, unknown>): CallLogSummary {
    const id = getString(callLog, ['id', 'callId', '_id']);

    if (!id) {
      throw new BadRequestException('HighLevel call log did not include an id');
    }

    return {
      id,
      agentId: getString(callLog, ['agentId', 'voiceAgentId']),
      contactId: getString(callLog, ['contactId']),
      status: getString(callLog, ['status', 'callStatus']),
      startedAt: getDateString(callLog, ['startedAt', 'createdAt', 'dateAdded', 'callStartedAt']),
      durationSeconds: getNumber(callLog, ['durationSeconds', 'duration', 'callDuration']),
      summary: getString(callLog, ['summary', 'callSummary']),
      transcriptAvailable:
        Array.isArray(callLog.transcriptWithToolCalls) ||
        typeof callLog.transcript === 'string' ||
        Array.isArray(callLog.transcript) ||
        Array.isArray(callLog.messages),
    };
  }

  /**
   * Imports transcript turns when HighLevel includes them in call-log responses.
   * Fresh sandboxes can return call-log summaries without transcript arrays, so
   * those rows are skipped rather than treated as failures.
   */
  private async importTranscriptPayloads(
    locationId: string,
    rawCallLogs: Array<Record<string, unknown>>,
  ): Promise<HighLevelSyncResponse['transcriptImports']> {
    let imported = 0;
    let skipped = 0;

    for (const rawCallLog of rawCallLogs) {
      const transcriptTurns = normalizeTranscriptTurns(rawCallLog);
      const ghlCallId = getString(rawCallLog, ['id', 'callId', '_id']);
      const ghlAgentId = getString(rawCallLog, ['agentId', 'voiceAgentId']);

      if (!ghlCallId || !ghlAgentId || transcriptTurns.length === 0) {
        skipped += 1;
        continue;
      }

      const agent = await this.prisma.agent.findFirst({
        where: {
          locationId,
          ghlAgentId,
        },
        select: { id: true },
      });

      if (!agent) {
        skipped += 1;
        continue;
      }

      await this.prisma.transcript.upsert({
        where: { ghlCallId },
        update: {
          contactId: getString(rawCallLog, ['contactId']),
          summary: getString(rawCallLog, ['summary', 'callSummary']),
          turns: transcriptTurns as Prisma.InputJsonValue,
        },
        create: {
          agentId: agent.id,
          ghlCallId,
          contactId: getString(rawCallLog, ['contactId']),
          callStartedAt: new Date(
            getDateString(rawCallLog, ['startedAt', 'createdAt', 'dateAdded', 'callStartedAt']) ??
              new Date().toISOString(),
          ),
          summary: getString(rawCallLog, ['summary', 'callSummary']),
          turns: transcriptTurns as Prisma.InputJsonValue,
        },
      });
      imported += 1;
    }

    return {
      imported,
      skipped,
      source: 'highlevel',
    };
  }

  private buildWarnings(syncedAgents: SyncedAgent[], callLogCount: number): string[] {
    const warnings: string[] = [];

    for (const agent of syncedAgents) {
      if (agent.unresolvedVariables.length > 0) {
        warnings.push(
          `${agent.name} references ${agent.unresolvedVariables.length} prompt variables that must exist in HighLevel custom values or contact fields.`,
        );
      }
    }

    if (callLogCount === 0) {
      warnings.push(
        'No HighLevel call logs were returned yet. Run a web call to generate transcripts.',
      );
    }

    return warnings;
  }
}

export function extractPromptVariables(prompt: string): string[] {
  const variables = new Set<string>();
  const pattern = /\{\{\s*([^}]+?)\s*\}\}/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(prompt)) !== null) {
    const variable = match[1]?.trim();

    if (variable) {
      variables.add(variable);
    }
  }

  return [...variables].sort();
}

function getString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
}

function getNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function getDateString(record: Record<string, unknown>, keys: string[]): string | undefined {
  const value = getString(record, keys);

  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizeTranscriptTurns(record: Record<string, unknown>): Array<{
  speaker: 'agent' | 'caller' | 'system';
  text: string;
  startedAtSeconds?: number;
}> {
  // Prefer transcriptWithToolCalls (structured array with timing data).
  // Fall back to transcript array, messages array, or transcript string.
  const source = Array.isArray(record.transcriptWithToolCalls)
    ? record.transcriptWithToolCalls
    : Array.isArray(record.transcript)
      ? record.transcript
      : Array.isArray(record.messages)
        ? record.messages
        : [];

  // If we have a structured array, parse objects from it.
  if (source.length > 0) {
    return source.flatMap((turn) => {
      if (typeof turn !== 'object' || turn === null) {
        return [];
      }

      const item = turn as Record<string, unknown>;
      const text = getString(item, ['content', 'text', 'message', 'transcript']);

      if (!text) {
        return [];
      }

      const rawRole = getString(item, ['role', 'speaker', 'sender'])?.toLowerCase();

      // Skip tool call entries — they aren't spoken dialogue.
      if (rawRole === 'action_executed' || rawRole === 'tool') {
        return [];
      }

      const speaker = rawRole?.includes('agent') || rawRole === 'bot'
        ? 'agent'
        : rawRole?.includes('system')
          ? 'system'
          : 'caller';
      const startedAtSeconds = getNumber(item, ['startTime', 'startedAtSeconds', 'offset', 'start']);

      return [{ speaker, text, startedAtSeconds }];
    });
  }

  // Fallback: parse HighLevel's plain-text transcript string ("bot:...\ nhuman:...").
  if (typeof record.transcript === 'string' && record.transcript.trim().length > 0) {
    return record.transcript
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .map((line: string) => {
        const colonIndex = line.indexOf(':');

        if (colonIndex === -1) {
          return { speaker: 'caller' as const, text: line.trim() };
        }

        const rawRole = line.slice(0, colonIndex).trim().toLowerCase();
        const text = line.slice(colonIndex + 1).trim();
        const speaker = rawRole === 'bot' || rawRole === 'agent'
          ? 'agent' as const
          : rawRole === 'system'
            ? 'system' as const
            : 'caller' as const;

        return { speaker, text };
      })
      .filter((turn: { text: string }) => turn.text.length > 0);
  }

  return [];
}
