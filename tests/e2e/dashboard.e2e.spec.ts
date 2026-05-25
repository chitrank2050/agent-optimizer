import { expect, test } from '@playwright/test';

const healthResponse = {
  status: 'ok',
  service: 'agent-optimizer-api',
  timestamp: new Date().toISOString(),
  correlationId: 'browser-qa',
  checks: { api: 'ok', database: 'ok' },
};

const syncedAgent = {
  id: 'agent-local-1',
  ghlAgentId: '6a11325ebe639a4e74a317a6',
  locationId: 'AXncyxV2i0xcXXV06w3x',
  name: 'FrontDoor AI',
  businessName: 'Dellwing Online',
  language: 'en-US',
  voiceId: 'RPEIZnKMqlQiZyZd1Dae',
  responsiveness: 1,
  maxCallDuration: 600,
  prompt: 'FrontDoor AI prompt',
  actions: [
    {
      id: 'action-book',
      actionType: 'APPOINTMENT_BOOKING',
      name: 'Appointment Booking',
      actionParameters: { calendarId: 'calendar-1' },
    },
    { id: 'action-sms', actionType: 'SMS', name: 'Send SMS', actionParameters: {} },
  ],
  unresolvedVariables: ['custom_values.business_name', 'contact.call_intent'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const syncResponse = {
  locationId: 'AXncyxV2i0xcXXV06w3x',
  tenantId: 'tenant-1',
  syncedAgents: [syncedAgent],
  callLogs: [
    {
      id: 'call-1',
      agentId: syncedAgent.ghlAgentId,
      contactId: 'contact-1',
      status: 'completed',
      startedAt: new Date().toISOString(),
      durationSeconds: 148,
      summary: 'Caller requested plumbing repair.',
      transcriptAvailable: true,
    },
  ],
  transcriptImports: { imported: 1, skipped: 0, source: 'highlevel' },
  warnings: ['FrontDoor AI references 2 prompt variables that must exist in HighLevel.'],
};

const analysisResponse = {
  agentId: syncedAgent.id,
  analyses: [
    {
      transcriptId: 'call-1',
      agentId: syncedAgent.id,
      outcome: 'failure',
      score: 58,
      summary: 'The call missed budget capture and booking confirmation.',
      passedCriteria: [
        { key: 'collect_contact_info', label: 'Must collect required contact information' },
      ],
      missedCriteria: [
        { key: 'ask_budget', label: 'Must ask for budget before closing' },
        { key: 'follow_booking_flow', label: 'Must follow the appointment booking flow' },
      ],
      findings: [
        {
          category: 'qualification',
          severity: 'medium',
          evidence: 'The agent did not ask for budget.',
          recommendationHint: 'Make budget a required question.',
        },
      ],
      analyzedAt: new Date().toISOString(),
    },
  ],
  patterns: [
    {
      category: 'booking_flow',
      severity: 'high',
      count: 1,
      exampleEvidence: 'The agent did not confirm a slot.',
    },
  ],
  generatedAt: new Date().toISOString(),
};

const optimizationResponse = {
  agentId: syncedAgent.id,
  testCases: [
    {
      id: 'test-1',
      title: 'Qualified caller books a standard appointment',
      scenario: 'Caller provides phone, service, ZIP, preferred time, budget, and SMS consent.',
      pathType: 'happy_path',
      successCriteria: [
        'Must collect required contact information',
        'Must ask for budget before closing',
        'Must follow the booking flow',
      ],
    },
    {
      id: 'test-2',
      title: 'Urgent caller needs earliest available slot',
      scenario: 'Caller says the issue is urgent and asks for help today.',
      pathType: 'edge_case',
      sourcePattern: 'booking_flow',
      successCriteria: ['Must handle urgent callers with escalation or earliest-slot language'],
    },
  ],
  evaluations: [
    {
      testCaseId: 'test-1',
      status: 'fail',
      score: 64,
      failedCriteria: ['Must ask for budget before closing'],
      reasoning: 'The current prompt misses one required qualification criterion.',
    },
    {
      testCaseId: 'test-2',
      status: 'risk',
      score: 82,
      failedCriteria: [],
      reasoning: 'Urgency handling is partially covered but should be tightened.',
    },
  ],
  recommendations: [
    {
      id: 'rec-1',
      target: 'prompt',
      title: 'Make budget capture a hard gate before closing',
      before: 'Budget capture is currently missing or too easy for the agent to skip.',
      after:
        'Before closing or booking, ask one concise budget question and confirm the answer in the final recap.',
      reasoning:
        'Generated tests show the current prompt can pass through a booking path without explicit budget capture.',
      evidenceIds: ['call-1', 'test-1'],
      status: 'proposed',
    },
  ],
  generatedAt: new Date().toISOString(),
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/health', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(healthResponse),
    }),
  );
  await page.route('**/api/v1/integrations/highlevel/sync', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(syncResponse),
    }),
  );
  await page.route('**/api/v1/analysis/agents/*/run', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(analysisResponse),
    }),
  );
  await page.route('**/api/v1/optimization/agents/*/run', (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify(optimizationResponse),
    }),
  );
});

test('dashboard completes the sync, analysis, and optimizer flow without layout overflow', async ({
  page,
}, testInfo) => {
  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  await page.goto('/');
  await page.getByRole('button', { name: /sync highlevel/i }).click();
  await page.getByText('FrontDoor AI').first().waitFor({ state: 'visible' });

  await page.getByRole('button', { name: /run analysis/i }).click();
  await page
    .getByText('The call missed budget capture and booking confirmation.')
    .waitFor({ state: 'visible' });

  await page.getByRole('button', { name: /run optimizer/i }).click();
  await page.getByText('Make budget capture a hard gate before closing').waitFor({
    state: 'visible',
  });

  const metrics = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const zeroSizeButtons = [...document.querySelectorAll('button')].filter((button) => {
      const rect = button.getBoundingClientRect();

      return rect.width === 0 || rect.height === 0;
    });

    return {
      clientWidth: documentElement.clientWidth,
      scrollWidth: documentElement.scrollWidth,
      zeroSizeButtonCount: zeroSizeButtons.length,
    };
  });

  await page.screenshot({
    path: `/tmp/agent-optimizer-${testInfo.project.name}.png`,
    fullPage: true,
  });

  expect(browserErrors).toEqual([]);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
  expect(metrics.zeroSizeButtonCount).toBe(0);
});
