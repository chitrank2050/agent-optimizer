/**
 * IntegrationsController - HTTP boundary for HighLevel synchronization.
 *
 * Provides the dashboard action that pulls current Voice AI agent configuration
 * and available call history from the sandbox account.
 */
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import type { HighLevelSyncResponse } from '@agent-optimizer/contracts';

import { HighLevelSyncRequestDto, HighLevelSyncResponseDto } from './dto/highlevel-sync.dto';
import { HighLevelSyncService } from './highlevel-sync.service';

@ApiTags('HighLevel Integrations')
@Controller({
  path: 'integrations/highlevel',
  version: '1',
})
export class IntegrationsController {
  constructor(@Inject(HighLevelSyncService) private readonly syncService: HighLevelSyncService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Synchronize HighLevel Voice AI agent config and call-log metadata',
  })
  @ApiBody({ type: HighLevelSyncRequestDto })
  @ApiResponse({ status: 201, type: HighLevelSyncResponseDto })
  async sync(@Body() body: HighLevelSyncRequestDto): Promise<HighLevelSyncResponse> {
    return this.syncService.sync(body);
  }
}
