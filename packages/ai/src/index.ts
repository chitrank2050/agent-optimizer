import type {
  AgentConfig,
  AnalysisBatch,
  AnalysisCriterion,
  IssueCategory,
  Transcript,
  TranscriptAnalysis,
  TranscriptFinding,
} from '@agent-optimizer/contracts';

type CriterionKey =
  | 'collect_contact_info'
  | 'capture_service'
  | 'capture_zip'
  | 'capture_preferred_time'
  | 'ask_budget'
  | 'ask_sms_consent'
  | 'follow_booking_flow'
  | 'handle_urgency'
  | 'avoid_unsupported_claims'
  | 'stay_polite';

const criteria: Record<CriterionKey, AnalysisCriterion> = {
  collect_contact_info: {
    key: 'collect_contact_info',
    label: 'Must collect required contact information',
  },
  capture_service: {
    key: 'capture_service',
    label: 'Must capture the requested service',
  },
  capture_zip: {
    key: 'capture_zip',
    label: 'Must capture ZIP or service area',
  },
  capture_preferred_time: {
    key: 'capture_preferred_time',
    label: 'Must capture preferred appointment time when provided',
  },
  ask_budget: {
    key: 'ask_budget',
    label: 'Must ask for budget before closing',
  },
  ask_sms_consent: {
    key: 'ask_sms_consent',
    label: 'Must ask SMS consent before texting',
  },
  follow_booking_flow: {
    key: 'follow_booking_flow',
    label: 'Must follow the appointment booking flow',
  },
  handle_urgency: {
    key: 'handle_urgency',
    label: 'Must handle urgent callers with escalation or earliest-slot language',
  },
  avoid_unsupported_claims: {
    key: 'avoid_unsupported_claims',
    label: 'Must avoid unsupported claims, guarantees, prices, or diagnoses',
  },
  stay_polite: {
    key: 'stay_polite',
    label: 'Must stay polite and on brand',
  },
};

/**
 * Deterministic transcript analyzer.
 *
 * This is the production fallback for Phase 3: it gives repeatable, testable
 * findings even when an LLM key is absent. Phase 4 can add an LLM judge that
 * emits the same `TranscriptAnalysis` contract.
 */
export function analyzeTranscript(agent: AgentConfig, transcript: Transcript): TranscriptAnalysis {
  const text = transcript.turns.map((turn) => turn.text).join('\n');
  const callerText = transcript.turns
    .filter((turn) => turn.speaker === 'caller')
    .map((turn) => turn.text)
    .join('\n');
  const agentText = transcript.turns
    .filter((turn) => turn.speaker === 'agent')
    .map((turn) => turn.text)
    .join('\n');
  const findings: TranscriptFinding[] = [];
  const passed = new Set<CriterionKey>();
  const missed = new Set<CriterionKey>();

  evaluateContactInfo(text, passed, missed, findings);
  evaluateQualification(callerText, agentText, passed, missed, findings);
  evaluateBookingFlow(callerText, agentText, passed, missed, findings);
  evaluateUrgency(callerText, agentText, passed, missed, findings);
  evaluatePolicy(agentText, passed, missed, findings);
  evaluateTone(agentText, passed, missed, findings);
  evaluatePromptConfiguration(agent.prompt, findings);

  const score = Math.max(
    0,
    100 - findings.reduce((total, finding) => total + severityPenalty(finding.severity), 0),
  );
  const outcome =
    findings.some((finding) => finding.severity === 'high') || score < 65
      ? 'failure'
      : findings.length > 0
        ? 'missed_opportunity'
        : 'success';

  return {
    transcriptId: transcript.id,
    agentId: transcript.agentId,
    outcome,
    score,
    summary: summarize(outcome, findings),
    passedCriteria: [...passed].map((key) => criteria[key]),
    missedCriteria: [...missed].map((key) => criteria[key]),
    findings,
    analyzedAt: new Date().toISOString(),
  };
}

export function analyzeTranscriptBatch(
  agent: AgentConfig,
  transcripts: Transcript[],
): AnalysisBatch {
  const analyses = transcripts.map((transcript) => analyzeTranscript(agent, transcript));

  return {
    agentId: agent.agentId,
    analyses,
    patterns: aggregatePatterns(analyses),
    generatedAt: new Date().toISOString(),
  };
}

function evaluateContactInfo(
  text: string,
  passed: Set<CriterionKey>,
  missed: Set<CriterionKey>,
  findings: TranscriptFinding[],
): void {
  const hasPhone = /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/.test(text);
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);

  if (hasPhone || hasEmail) {
    passed.add('collect_contact_info');
    return;
  }

  missed.add('collect_contact_info');
  findings.push({
    category: 'qualification',
    severity: 'high',
    evidence: 'The call did not capture a phone number or email address.',
    recommendationHint:
      'Prompt the agent to collect at least one reliable callback channel before ending the call.',
  });
}

function evaluateQualification(
  callerText: string,
  agentText: string,
  passed: Set<CriterionKey>,
  missed: Set<CriterionKey>,
  findings: TranscriptFinding[],
): void {
  has(callerText, /\b(plumbing|repair|service|appointment|cleaning|consultation|leak|heater)\b/i)
    ? passed.add('capture_service')
    : missed.add('capture_service');
  has(callerText, /\b\d{5}(?:-\d{4})?\b/) ? passed.add('capture_zip') : missed.add('capture_zip');
  has(callerText, /\b(today|tomorrow|morning|afternoon|evening|\d{1,2}\s?(?:am|pm))\b/i)
    ? passed.add('capture_preferred_time')
    : missed.add('capture_preferred_time');

  if (
    has(agentText, /\b(budget|price range|price expectation|how much were you looking to spend)\b/i)
  ) {
    passed.add('ask_budget');
  } else {
    missed.add('ask_budget');
    findings.push({
      category: 'qualification',
      severity: 'medium',
      evidence: 'The agent did not ask for budget before closing or booking.',
      recommendationHint:
        'Keep budget as a required qualification question before the final confirmation.',
    });
  }

  if (has(agentText, /\b(text|sms).*\b(consent|permission|okay|allowed)\b/i)) {
    passed.add('ask_sms_consent');
  } else {
    missed.add('ask_sms_consent');
    findings.push({
      category: 'follow_up',
      severity: 'medium',
      evidence: 'The call did not include explicit SMS consent language.',
      recommendationHint:
        'Ask for SMS consent using the configured consent phrase before sending confirmations.',
    });
  }
}

function evaluateBookingFlow(
  callerText: string,
  agentText: string,
  passed: Set<CriterionKey>,
  missed: Set<CriterionKey>,
  findings: TranscriptFinding[],
): void {
  const callerWantsBooking = has(callerText, /\b(book|appointment|schedule|available|slot)\b/i);
  const agentBooked = has(
    agentText,
    /\b(booked|scheduled|appointment is set|available slot|earliest available)\b/i,
  );

  if (!callerWantsBooking || agentBooked) {
    passed.add('follow_booking_flow');
    return;
  }

  missed.add('follow_booking_flow');
  findings.push({
    category: 'booking_flow',
    severity: 'high',
    evidence:
      'The caller requested an appointment, but the agent did not clearly offer or confirm booking slots.',
    recommendationHint:
      'Trigger get-slots/book-slot flow when the caller asks to schedule or has a qualified score.',
  });
}

function evaluateUrgency(
  callerText: string,
  agentText: string,
  passed: Set<CriterionKey>,
  missed: Set<CriterionKey>,
  findings: TranscriptFinding[],
): void {
  const urgentCaller = has(
    callerText,
    /\b(urgent|emergency|asap|leaking|breakdown|locked out|severe)\b/i,
  );
  const urgentHandled = has(
    agentText,
    /\b(earliest available|specialist team|try to contact you sooner|prompt callback|urgent)\b/i,
  );

  if (!urgentCaller || urgentHandled) {
    passed.add('handle_urgency');
    return;
  }

  missed.add('handle_urgency');
  findings.push({
    category: 'objection_handling',
    severity: 'high',
    evidence:
      'The caller described urgency, but the agent did not escalate or promise prompt follow-up.',
    recommendationHint:
      'Add an urgency branch that books the earliest slot and forwards details to the specialist team.',
  });
}

function evaluatePolicy(
  agentText: string,
  passed: Set<CriterionKey>,
  missed: Set<CriterionKey>,
  findings: TranscriptFinding[],
): void {
  if (!has(agentText, /\b(guarantee|diagnose|definitely|for sure|will cost exactly)\b/i)) {
    passed.add('avoid_unsupported_claims');
    return;
  }

  missed.add('avoid_unsupported_claims');
  findings.push({
    category: 'policy',
    severity: 'high',
    evidence: 'The agent made an unsupported guarantee, diagnosis, or exact-price claim.',
    recommendationHint:
      'Reinforce the guardrail against prices, diagnoses, policies, and service guarantees.',
  });
}

function evaluateTone(
  agentText: string,
  passed: Set<CriterionKey>,
  missed: Set<CriterionKey>,
  findings: TranscriptFinding[],
): void {
  if (!has(agentText, /\b(whatever|not my problem|calm down|you need to listen)\b/i)) {
    passed.add('stay_polite');
    return;
  }

  missed.add('stay_polite');
  findings.push({
    category: 'tone',
    severity: 'medium',
    evidence: 'The agent used language that may feel dismissive or off-brand.',
    recommendationHint: 'Strengthen tone guidance with concise apology and reassurance patterns.',
  });
}

function evaluatePromptConfiguration(prompt: string, findings: TranscriptFinding[]): void {
  if (!/\{\{\s*[^}]+?\s*\}\}/.test(prompt)) {
    return;
  }

  findings.push({
    category: 'knowledge_gap',
    severity: 'low',
    evidence:
      'The prompt references HighLevel variables that must exist in the location configuration.',
    recommendationHint: 'Audit custom values/contact fields before running live calls.',
  });
}

function aggregatePatterns(analyses: TranscriptAnalysis[]): AnalysisBatch['patterns'] {
  const grouped = new Map<
    string,
    {
      category: IssueCategory;
      severity: 'low' | 'medium' | 'high';
      count: number;
      exampleEvidence: string;
    }
  >();

  for (const analysis of analyses) {
    for (const finding of analysis.findings) {
      const key = `${finding.category}:${finding.severity}`;
      const existing = grouped.get(key);

      if (existing) {
        existing.count += 1;
        continue;
      }

      grouped.set(key, {
        category: finding.category,
        severity: finding.severity,
        count: 1,
        exampleEvidence: finding.evidence,
      });
    }
  }

  return [...grouped.values()].sort((left, right) => right.count - left.count);
}

function summarize(outcome: TranscriptAnalysis['outcome'], findings: TranscriptFinding[]): string {
  if (findings.length === 0) {
    return 'The call satisfied the configured qualification, booking, follow-up, tone, and policy checks.';
  }

  return `The call was classified as ${outcome} with ${findings.length} finding(s), led by ${findings[0]?.category ?? 'unknown'} risk.`;
}

function severityPenalty(severity: TranscriptFinding['severity']): number {
  switch (severity) {
    case 'high':
      return 25;
    case 'medium':
      return 14;
    case 'low':
      return 5;
  }
}

function has(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}
