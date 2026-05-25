/**
 * IntegrationsModule - Customer-facing integration workflows.
 *
 * Wires HighLevel sync orchestration with the lower-level HighLevel client
 * module while keeping vendor API details outside the controller.
 */
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
