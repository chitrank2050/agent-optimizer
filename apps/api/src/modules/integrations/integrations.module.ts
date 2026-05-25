import { Module } from '@nestjs/common';

import { HighLevelModule } from '../highlevel/highlevel.module';
import { HighLevelSyncService } from './highlevel-sync.service';
import { IntegrationsController } from './integrations.controller';

@Module({
  imports: [HighLevelModule],
  controllers: [IntegrationsController],
  providers: [HighLevelSyncService],
})
export class IntegrationsModule {}
