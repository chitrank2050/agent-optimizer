import { describe, expect, it } from 'vitest';
import type { AgentConfig, Transcript } from '@agent-optimizer/contracts';

import { analyzeTranscript, analyzeTranscriptBatch } from '../src/index.js';

const agent: AgentConfig = {
  agentId: 'agent-1',
  name: 'FrontDoor AI',
  prompt: 'Ask for {{custom_values.business_name}} budget and SMS consent before booking.',
  model: 'highlevel-voice-ai',
  temperature: 0.4,
  tools: ['APPOINTMENT_BOOKING'],
};

describe('analyzeTranscript', () => {
  it('flags missed booking and qualification requirements', () => {
    const transcript: Transcript = {
      id: 'call-1',
      agentId: 'agent-1',
      callStartedAt: new Date('2026-05-25T05:00:00.000Z').toISOString(),
      turns: [
        {
          speaker: 'caller',
          text: 'I need to book an appointment for plumbing repair in 94102 tomorrow morning. My phone is 415-555-0198.',
        },
        {
          speaker: 'agent',
          text: 'Thanks for calling. Someone will follow up later.',
        },
      ],
    };

    const analysis = analyzeTranscript(agent, transcript);

    expect(analysis.outcome).toBe('failure');
    expect(analysis.findings.map((finding) => finding.category)).toContain('booking_flow');
    expect(analysis.missedCriteria.map((criterion) => criterion.key)).toContain('ask_budget');
  });

  it('aggregates recurring finding patterns', () => {
    const transcripts: Transcript[] = [
      {
        id: 'call-1',
        agentId: 'agent-1',
        callStartedAt: new Date('2026-05-25T05:00:00.000Z').toISOString(),
        turns: [
          { speaker: 'caller', text: 'I need an appointment tomorrow in 94102. 415-555-0198.' },
          { speaker: 'agent', text: 'Someone will call you back.' },
        ],
      },
      {
        id: 'call-2',
        agentId: 'agent-1',
        callStartedAt: new Date('2026-05-25T06:00:00.000Z').toISOString(),
        turns: [
          { speaker: 'caller', text: 'Please schedule service today in 94102. 415-555-0111.' },
          { speaker: 'agent', text: 'Thanks, goodbye.' },
        ],
      },
    ];

    const batch = analyzeTranscriptBatch(agent, transcripts);

    expect(batch.patterns[0]?.count).toBeGreaterThan(1);
  });
});
