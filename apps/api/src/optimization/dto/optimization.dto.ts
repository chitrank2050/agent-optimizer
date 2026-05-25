/**
 * DTOs for Phase 4 optimization loop endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';

export class GeneratedTestCaseResponseDto {
  @ApiProperty({ example: '6a8f4ed6-7e6c-4e51-a650-6077c6d76618' })
  id!: string;

  @ApiProperty({ example: 'Qualified caller books a standard appointment' })
  title!: string;

  @ApiProperty({
    example:
      'Caller asks for a covered service, provides name, phone, ZIP, preferred time, budget, and SMS consent.',
  })
  scenario!: string;

  @ApiProperty({ enum: ['happy_path', 'edge_case'], example: 'happy_path' })
  pathType!: string;

  @ApiProperty({
    type: [String],
    example: ['Must collect required contact information', 'Must follow the booking flow'],
  })
  successCriteria!: string[];

  @ApiProperty({ example: 'qualification', nullable: true, required: false })
  sourcePattern?: string;
}

export class TestEvaluationResponseDto {
  @ApiProperty({ example: '6a8f4ed6-7e6c-4e51-a650-6077c6d76618' })
  testCaseId!: string;

  @ApiProperty({ enum: ['pass', 'fail', 'risk'], example: 'risk' })
  status!: string;

  @ApiProperty({ example: 82, minimum: 0, maximum: 100 })
  score!: number;

  @ApiProperty({ type: [String], example: ['Must ask for budget before closing'] })
  failedCriteria!: string[];

  @ApiProperty({
    example: 'The current prompt/configuration misses 1 criterion for this scenario.',
  })
  reasoning!: string;
}

export class OptimizationRecommendationResponseDto {
  @ApiProperty({ example: 'c43bc6a8-ef96-4f27-92d5-9405ef44d924' })
  id!: string;

  @ApiProperty({
    enum: ['prompt', 'temperature', 'model', 'tool', 'action', 'knowledge_base', 'guardrail'],
    example: 'prompt',
  })
  target!: string;

  @ApiProperty({ example: 'Make budget capture a hard gate before closing' })
  title!: string;

  @ApiProperty({ example: 'Budget capture is currently missing or too easy to skip.' })
  before!: string;

  @ApiProperty({ example: 'Before closing or booking, ask one concise budget question.' })
  after!: string;

  @ApiProperty({
    example:
      'Generated tests show the current prompt can pass through a booking path without budget capture.',
  })
  reasoning!: string;

  @ApiProperty({ type: [String], example: ['7f090d7e-74ca-49be-84de-3d74b9163ebe'] })
  evidenceIds!: string[];

  @ApiProperty({ enum: ['proposed', 'approved', 'rejected', 'applied'], example: 'proposed' })
  status!: string;
}

export class OptimizationRunResponseDto {
  @ApiProperty({ example: '97a5522e-4b85-47d4-a328-62f1dc7128d6' })
  agentId!: string;

  @ApiProperty({ type: [GeneratedTestCaseResponseDto] })
  testCases!: GeneratedTestCaseResponseDto[];

  @ApiProperty({ type: [TestEvaluationResponseDto] })
  evaluations!: TestEvaluationResponseDto[];

  @ApiProperty({ type: [OptimizationRecommendationResponseDto] })
  recommendations!: OptimizationRecommendationResponseDto[];

  @ApiProperty({ example: '2026-05-25T05:00:00.000Z' })
  generatedAt!: string;
}
