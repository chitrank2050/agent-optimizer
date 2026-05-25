import { Module } from '@nestjs/common';

import { AnalysisModule } from '../analysis/analysis.module';
import { OptimizationController } from './optimization.controller';
import { OptimizationService } from './optimization.service';

@Module({
  imports: [AnalysisModule],
  controllers: [OptimizationController],
  providers: [OptimizationService],
})
export class OptimizationModule {}
