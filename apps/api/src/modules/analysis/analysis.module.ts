/**
 * AnalysisModule - Transcript analysis feature boundary.
 *
 * Wires the controller and service that convert stored transcripts into
 * normalized findings and aggregated performance patterns.
 */
import { Module } from '@nestjs/common';

import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
