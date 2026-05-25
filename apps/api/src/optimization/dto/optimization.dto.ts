/**
 * DTOs for Phase 4 optimization loop endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';

export class GeneratedTestCaseResponseDto {
  @ApiProperty({ type: String, example: '6a8f4ed6-7e6c-4e51-a650-6077c6d76618' })
  id!: string;

  @ApiProperty({ type: String, example: 'Qualified caller books a standard appointment' })
  title!: string;

  @ApiProperty({
    type: String,
    example:
      'Caller asks for a covered service, provides name, phone, ZIP, preferred time, budget, and SMS consent.',
  })
  scenario!: string;

  @ApiProperty({ type: String, enum: ['happy_path', 'edge_case'], example: 'happy_path' })
  pathType!: string;

  @ApiProperty({
    type: [String],
    example: ['Must collect required contact information', 'Must follow the booking flow'],
  })
  successCriteria!: string[];

  @ApiProperty({ type: String, example: 'qualification', nullable: true, required: false })
  sourcePattern?: string;
}

export class TestEvaluationResponseDto {
  @ApiProperty({ type: String, example: '6a8f4ed6-7e6c-4e51-a650-6077c6d76618' })
  testCaseId!: string;

  @ApiProperty({ type: String, enum: ['pass', 'fail', 'risk'], example: 'risk' })
  status!: string;

  @ApiProperty({ type: Number, example: 82, minimum: 0, maximum: 100 })
  score!: number;

  @ApiProperty({ type: [String], example: ['Must ask for budget before closing'] })
  failedCriteria!: string[];

  @ApiProperty({
    type: String,
    example: 'The current prompt/configuration misses 1 criterion for this scenario.',
  })
  reasoning!: string;
}

export class OptimizationRecommendationResponseDto {
  @ApiProperty({ type: String, example: 'c43bc6a8-ef96-4f27-92d5-9405ef44d924' })
  id!: string;

  @ApiProperty({
    type: String,
    enum: ['prompt', 'temperature', 'model', 'tool', 'action', 'knowledge_base', 'guardrail'],
    example: 'prompt',
  })
  target!: string;

  @ApiProperty({ type: String, example: 'Make budget capture a hard gate before closing' })
  title!: string;

  @ApiProperty({
    type: String,
    example: 'Budget capture is currently missing or too easy to skip.',
  })
  before!: string;

  @ApiProperty({
    type: String,
    example: 'Before closing or booking, ask one concise budget question.',
  })
  after!: string;

  @ApiProperty({
    type: String,
    example:
      'Generated tests show the current prompt can pass through a booking path without budget capture.',
  })
  reasoning!: string;

  @ApiProperty({ type: [String], example: ['7f090d7e-74ca-49be-84de-3d74b9163ebe'] })
  evidenceIds!: string[];

  @ApiProperty({
    type: String,
    enum: ['proposed', 'approved', 'rejected', 'applied'],
    example: 'proposed',
  })
  status!: string;
}

export class OptimizationRunResponseDto {
  @ApiProperty({ type: String, example: '97a5522e-4b85-47d4-a328-62f1dc7128d6' })
  agentId!: string;

  @ApiProperty({ type: [GeneratedTestCaseResponseDto] })
  testCases!: GeneratedTestCaseResponseDto[];

  @ApiProperty({ type: [TestEvaluationResponseDto] })
  evaluations!: TestEvaluationResponseDto[];

  @ApiProperty({ type: [OptimizationRecommendationResponseDto] })
  recommendations!: OptimizationRecommendationResponseDto[];

  @ApiProperty({ type: String, example: '2026-05-25T05:00:00.000Z' })
  generatedAt!: string;
}
