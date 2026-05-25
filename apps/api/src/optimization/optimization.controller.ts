import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { OptimizationRun } from '@agent-optimizer/contracts';

import { OptimizationRunResponseDto } from './dto/optimization.dto';
import { OptimizationService } from './optimization.service';

@ApiTags('Optimization Loop')
@Controller('optimization/agents')
export class OptimizationController {
  constructor(
    @Inject(OptimizationService) private readonly optimizationService: OptimizationService,
  ) {}

  @ApiOperation({
    summary: 'Generate test cases, evaluate current config, and propose optimizations',
  })
  @ApiResponse({ status: 201, type: OptimizationRunResponseDto })
  @Post(':agentId/run')
  async run(@Param('agentId') agentId: string): Promise<OptimizationRun> {
    return this.optimizationService.run(agentId);
  }

  @ApiOperation({ summary: 'Read persisted generated tests and optimization recommendations' })
  @ApiResponse({ status: 200, type: OptimizationRunResponseDto })
  @Get(':agentId')
  async get(@Param('agentId') agentId: string): Promise<OptimizationRun> {
    return this.optimizationService.get(agentId);
  }
}
