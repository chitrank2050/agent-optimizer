import { Module } from '@nestjs/common';

import { HighLevelClientService } from './highlevel-client.service';

@Module({
  providers: [HighLevelClientService],
  exports: [HighLevelClientService],
})
export class HighLevelModule {}
