/**
 * HighLevelModule - Provides the HighLevel API client.
 *
 * Exported for integration workflows that need to sync agents, call logs, and
 * transcript-like payloads from a sandbox location.
 */
import { Module } from '@nestjs/common';

import { HighLevelClientService } from './highlevel-client.service';

@Module({
  providers: [HighLevelClientService],
  exports: [HighLevelClientService],
})
export class HighLevelModule {}
