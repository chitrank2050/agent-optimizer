/**
 * DTOs for transcript analysis endpoints.
 *
 * These classes document the owned API response shape for Swagger while shared
 * runtime contracts remain in `packages/contracts`.
 */
import { ApiProperty } from '@nestjs/swagger';

export class AnalysisCriterionResponseDto {
  @ApiProperty({ type: String, example: 'ask_budget' })
  key!: string;

  @ApiProperty({ type: String, example: 'Must ask for budget before closing' })
  label!: string;
}

export class AnalysisFindingResponseDto {
  @ApiProperty({
    type: String,
    enum: [
      'booking_flow',
      'qualification',
      'objection_handling',
      'tone',
      'follow_up',
      'policy',
      'knowledge_gap',
    ],
    example: 'qualification',
  })
  category!: string;

  @ApiProperty({ type: String, enum: ['low', 'medium', 'high'], example: 'medium' })
  severity!: string;

  @ApiProperty({
    type: String,
    example: 'The agent did not ask for budget before closing or booking.',
  })
  evidence!: string;

  @ApiProperty({ type: String, example: 'Keep budget as a required qualification question.' })
  recommendationHint!: string;
}

export class TranscriptAnalysisResponseDto {
  @ApiProperty({ type: String, example: '7f090d7e-74ca-49be-84de-3d74b9163ebe' })
  transcriptId!: string;

  @ApiProperty({ type: String, example: '97a5522e-4b85-47d4-a328-62f1dc7128d6' })
  agentId!: string;

  @ApiProperty({
    type: String,
    enum: ['success', 'failure', 'missed_opportunity'],
    example: 'failure',
  })
  outcome!: string;

  @ApiProperty({ type: Number, example: 56, minimum: 0, maximum: 100 })
  score!: number;

  @ApiProperty({ type: String, example: 'The call was classified as failure with 3 findings.' })
  summary!: string;

  @ApiProperty({ type: [AnalysisCriterionResponseDto] })
  passedCriteria!: AnalysisCriterionResponseDto[];

  @ApiProperty({ type: [AnalysisCriterionResponseDto] })
  missedCriteria!: AnalysisCriterionResponseDto[];

  @ApiProperty({ type: [AnalysisFindingResponseDto] })
  findings!: AnalysisFindingResponseDto[];

  @ApiProperty({ type: String, example: '2026-05-25T05:00:00.000Z' })
  analyzedAt!: string;
}

export class PerformancePatternResponseDto {
  @ApiProperty({ type: String, example: 'qualification' })
  category!: string;

  @ApiProperty({ type: String, enum: ['low', 'medium', 'high'], example: 'medium' })
  severity!: string;

  @ApiProperty({ type: Number, example: 4 })
  count!: number;

  @ApiProperty({
    type: String,
    example: 'The agent did not ask for budget before closing or booking.',
  })
  exampleEvidence!: string;
}

export class AnalysisBatchResponseDto {
  @ApiProperty({ type: String, example: '97a5522e-4b85-47d4-a328-62f1dc7128d6' })
  agentId!: string;

  @ApiProperty({ type: [TranscriptAnalysisResponseDto] })
  analyses!: TranscriptAnalysisResponseDto[];

  @ApiProperty({ type: [PerformancePatternResponseDto] })
  patterns!: PerformancePatternResponseDto[];

  @ApiProperty({ type: String, example: '2026-05-25T05:00:00.000Z' })
  generatedAt!: string;
}
