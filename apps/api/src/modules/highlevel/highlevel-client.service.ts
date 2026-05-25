/**
 * HighLevelClientService - Typed LeadConnector API client.
 *
 * Centralizes HighLevel base URL, API version, private integration token,
 * timeout behavior, and runtime validation of vendor response payloads.
 */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { AppEnv } from '../config';
import {
  highLevelAgentsResponseSchema,
  highLevelCallLogsResponseSchema,
  highLevelLocationSchema,
  type HighLevelAgent,
  type HighLevelCallLogsResponse,
  type HighLevelLocation,
} from './highlevel.types';

@Injectable()
export class HighLevelClientService {
  private readonly baseUrl: string;
  private readonly version: string;
  private readonly token?: string;

  constructor(@Inject(ConfigService) config: ConfigService<AppEnv, true>) {
    this.baseUrl = config.get('GHL_API_BASE_URL', { infer: true });
    this.version = config.get('GHL_API_VERSION', { infer: true });
    this.token =
      config.get('LOCATION_PIT', { infer: true }) ??
      config.get('GHL_PRIVATE_INTEGRATION_TOKEN', { infer: true });
  }

  /**
   * Fetches the HighLevel location that anchors tenant/location scoping locally.
   * The sandbox spike confirmed location PITs can access this endpoint.
   */
  async getLocation(locationId: string): Promise<HighLevelLocation> {
    const payload = await this.request(`/locations/${encodeURIComponent(locationId)}`);

    return highLevelLocationSchema.parse(this.unwrap(payload, 'location'));
  }

  /**
   * Lists Voice AI agents for a sub-account. HighLevel rejects `limit`; the
   * verified pagination key is `pageSize`.
   */
  async listAgents(locationId: string): Promise<HighLevelAgent[]> {
    const params = new URLSearchParams({
      locationId,
      page: '1',
      pageSize: '100',
    });
    const payload = await this.request(`/voice-ai/agents?${params.toString()}`);

    return highLevelAgentsResponseSchema.parse(payload).agents;
  }

  /**
   * Lists Voice AI call logs. Empty results are valid for fresh sandboxes; web
   * calls or paid telephony are required before HighLevel returns call history.
   */
  async listCallLogs(locationId: string, pageSize = 20): Promise<HighLevelCallLogsResponse> {
    const params = new URLSearchParams({
      locationId,
      page: '1',
      pageSize: String(pageSize),
    });
    const payload = await this.request(`/voice-ai/dashboard/call-logs?${params.toString()}`);

    return highLevelCallLogsResponseSchema.parse(payload);
  }

  /**
   * Centralizes HighLevel auth/version headers and timeout behavior so downstream
   * services never handle vendor tokens directly.
   */
  private async request(path: string): Promise<unknown> {
    if (!this.token) {
      throw new UnauthorizedException('HighLevel token is not configured');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Version: this.version,
      },
      signal: AbortSignal.timeout(15_000),
    });

    const payload = (await response.json().catch(() => ({}))) as unknown;

    if (!response.ok) {
      throw new UnauthorizedException({
        message: 'HighLevel request failed',
        statusCode: response.status,
      });
    }

    return payload;
  }

  private unwrap(payload: unknown, key: string): unknown {
    if (typeof payload !== 'object' || payload === null || !(key in payload)) {
      return payload;
    }

    return (payload as Record<string, unknown>)[key];
  }
}
