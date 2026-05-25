/**
 * DTOs for the HighLevel integration sync endpoint.
 *
 * These classes describe the API contract we own. Vendor payload validation
 * remains in Zod schemas at the HighLevel boundary because HighLevel responses
 * arrive as untrusted runtime JSON.
 */
import { ApiProperty } from '@nestjs/swagger';

export class HighLevelSyncRequestDto {
  @ApiProperty({
    type: String,
    example: 'AXncyxV2i0xcXXV06w3x',
    description: 'HighLevel sub-account/location id to synchronize.',
  })
  locationId!: string;
}

export class HighLevelActionResponseDto {
  @ApiProperty({ type: String, example: '6a113261066e92b72b6c9a7d' })
  id!: string;

  @ApiProperty({ type: String, example: 'APPOINTMENT_BOOKING' })
  actionType!: string;

  @ApiProperty({ type: String, example: 'Appointment Booking Action' })
  name!: string;

  @ApiProperty({
    type: Object,
    example: { calendarId: 'OtIY24n7eQ6jT74w4Vak', slotsPerDay: 3 },
    description: 'Raw HighLevel action parameters preserved for later optimization checks.',
  })
  actionParameters!: Record<string, unknown>;
}

export class SyncedAgentResponseDto {
  @ApiProperty({ type: String, example: '6f2f67dc-5cc4-4015-8c7f-0249f8f1f4e4' })
  id!: string;

  @ApiProperty({ type: String, example: '6a11325ebe639a4e74a317a6' })
  ghlAgentId!: string;

  @ApiProperty({ type: String, example: 'd8d94f8d-a5ec-460a-b212-71a642323113' })
  locationId!: string;

  @ApiProperty({ type: String, example: 'FrontDoor AI' })
  name!: string;

  @ApiProperty({ type: String, example: 'Dellwing Online', required: false })
  businessName?: string;

  @ApiProperty({ type: String, example: 'en-US', required: false })
  language?: string;

  @ApiProperty({ type: String, example: 'RPEIZnKMqlQiZyZd1Dae', required: false })
  voiceId?: string;

  @ApiProperty({ type: Number, example: 1, required: false })
  responsiveness?: number;

  @ApiProperty({ type: Number, example: 600, required: false })
  maxCallDuration?: number;

  @ApiProperty({
    type: String,
    example: 'AGENT ROLE & OBJECTIVE...',
    description: 'Current Voice AI prompt/script pulled from HighLevel.',
  })
  prompt!: string;

  @ApiProperty({ type: [HighLevelActionResponseDto] })
  actions!: HighLevelActionResponseDto[];

  @ApiProperty({
    type: [String],
    example: ['custom_values.business_name', 'contact.call_intent'],
    description: 'Prompt variables referenced by the script and flagged for config review.',
  })
  unresolvedVariables!: string[];

  @ApiProperty({ type: String, example: '2026-05-24T05:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ type: String, example: '2026-05-24T05:00:00.000Z' })
  updatedAt!: string;
}

export class CallLogSummaryResponseDto {
  @ApiProperty({ type: String, example: 'call_123' })
  id!: string;

  @ApiProperty({ type: String, example: '6a11325ebe639a4e74a317a6', required: false })
  agentId?: string;

  @ApiProperty({ type: String, example: 'contact_123', required: false })
  contactId?: string;

  @ApiProperty({ type: String, example: 'completed', required: false })
  status?: string;

  @ApiProperty({ type: String, example: '2026-05-24T05:00:00.000Z', required: false })
  startedAt?: string;

  @ApiProperty({ type: Number, example: 124, required: false })
  durationSeconds?: number;

  @ApiProperty({ type: String, example: 'Caller requested plumbing repair.', required: false })
  summary?: string;

  @ApiProperty({ type: Boolean, example: false })
  transcriptAvailable!: boolean;
}

export class TranscriptImportSummaryResponseDto {
  @ApiProperty({ type: Number, example: 0 })
  imported!: number;

  @ApiProperty({ type: Number, example: 0 })
  skipped!: number;

  @ApiProperty({ type: String, enum: ['highlevel', 'seeded', 'manual'], example: 'highlevel' })
  source!: 'highlevel' | 'seeded' | 'manual';
}

export class HighLevelSyncResponseDto {
  @ApiProperty({ type: String, example: 'AXncyxV2i0xcXXV06w3x' })
  locationId!: string;

  @ApiProperty({ type: String, example: '1e9c67aa-1a16-42d4-9b73-e36f4e831f55' })
  tenantId!: string;

  @ApiProperty({ type: [SyncedAgentResponseDto] })
  syncedAgents!: SyncedAgentResponseDto[];

  @ApiProperty({ type: [CallLogSummaryResponseDto] })
  callLogs!: CallLogSummaryResponseDto[];

  @ApiProperty({ type: TranscriptImportSummaryResponseDto })
  transcriptImports!: TranscriptImportSummaryResponseDto;

  @ApiProperty({
    type: [String],
    example: ['FrontDoor AI references 12 prompt variables that must exist in HighLevel.'],
  })
  warnings!: string[];
}
