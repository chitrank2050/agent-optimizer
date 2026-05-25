import { Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AnalysisBatch } from '@agent-optimizer/contracts';

import { AnalysisService } from './analysis.service';
import { AnalysisBatchResponseDto } from './dto/analysis.dto';

@ApiTags('Transcript Analysis')
@Controller('analysis/agents')
export class AnalysisController {
  constructor(@Inject(AnalysisService) private readonly analysisService: AnalysisService) {}

  @ApiOperation({ summary: 'Run analysis for all stored transcripts belonging to an agent' })
  @ApiResponse({ status: 201, type: AnalysisBatchResponseDto })
  @Post(':agentId/run')
  async run(@Param('agentId') agentId: string): Promise<AnalysisBatch> {
    return this.analysisService.analyzeAgent(agentId);
  }

  @ApiOperation({ summary: 'Read persisted transcript analyses for an agent' })
  @ApiResponse({ status: 200, type: AnalysisBatchResponseDto })
  @Get(':agentId')
  async get(@Param('agentId') agentId: string): Promise<AnalysisBatch> {
    return this.analysisService.getAgentAnalyses(agentId);
  }
}
