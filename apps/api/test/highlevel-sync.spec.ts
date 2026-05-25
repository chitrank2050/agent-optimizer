import { describe, expect, it } from 'vitest';

import { extractPromptVariables } from '../src/modules/integrations/highlevel-sync.service';

describe('extractPromptVariables', () => {
  it('extracts unique HighLevel prompt variables with whitespace normalized', () => {
    const variables = extractPromptVariables(
      'Hi {{ custom_values.business_name }}. Save {{contact.call_intent}} and {{ contact.call_intent }}.',
    );

    expect(variables).toEqual(['contact.call_intent', 'custom_values.business_name']);
  });
});
