import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { HighLevelSyncRequestDto } from '../src/modules/integrations/dto/highlevel-sync.dto';
import { extractPromptVariables } from '../src/modules/integrations/highlevel-sync.service';

describe('extractPromptVariables', () => {
  it('extracts unique HighLevel prompt variables with whitespace normalized', () => {
    const variables = extractPromptVariables(
      'Hi {{ custom_values.business_name }}. Save {{contact.call_intent}} and {{ contact.call_intent }}.',
    );

    expect(variables).toEqual(['contact.call_intent', 'custom_values.business_name']);
  });
});

describe('HighLevelSyncRequestDto', () => {
  it('whitelists the locationId request body used by the dashboard sync action', () => {
    const dto = plainToInstance(HighLevelSyncRequestDto, {
      locationId: 'AXncyxV2i0xcXXV06w3x',
    });

    const errors = validateSync(dto, {
      forbidNonWhitelisted: true,
      whitelist: true,
    });

    expect(errors).toHaveLength(0);
  });
});
