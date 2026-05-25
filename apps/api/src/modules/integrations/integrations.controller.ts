/**
 * IntegrationsController - HTTP boundary for HighLevel synchronization.
 *
 * Provides the dashboard action that pulls current Voice AI agent configuration
 * and available call history from the sandbox account.
 */
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { HighLevelSyncResponse } from '@agent-optimizer/contracts';

import { HighLevelSyncService } from './highlevel-sync.service';
import { HighLevelSyncRequestDto, HighLevelSyncResponseDto } from './dto/highlevel-sync.dto';

@ApiTags('HighLevel Integrations')
@Controller('integrations/highlevel')
export class IntegrationsController {
  constructor(@Inject(HighLevelSyncService) private readonly syncService: HighLevelSyncService) {}

  @ApiOperation({
    summary: 'Synchronize HighLevel Voice AI agent config and call-log metadata',
  })
  @ApiBody({ type: HighLevelSyncRequestDto })
  @ApiResponse({ status: 201, type: HighLevelSyncResponseDto })
  @Post('sync')
  async sync(@Body() body: HighLevelSyncRequestDto): Promise<HighLevelSyncResponse> {
    return this.syncService.sync(body);
  }
}
