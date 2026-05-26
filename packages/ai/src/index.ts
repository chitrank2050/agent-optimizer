/**
 * AI evaluation core for the Voice AI Agent Optimizer.
 *
 * Keeps transcript analysis, pattern aggregation, generated test scenarios,
 * evaluation scoring, and recommendation generation pure and deterministic so
 * the API shell can persist results without coupling business logic to I/O.
 */
import type {
  AgentConfig,
  AnalysisBatch,
  AnalysisCriterion,
  IssueCategory,
  OptimizationRecommendation,
  OptimizationRun,
  OptimizerTestCase,
  PerformancePattern,
  TestEvaluation,
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
 * This gives repeatable, testable findings even when an LLM key is absent.
 * An LLM judge can replace or augment it as long as it emits the same
 * `TranscriptAnalysis` contract.
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
    patterns: aggregateAnalysisPatterns(analyses),
    generatedAt: new Date().toISOString(),
  };
}

export function aggregateAnalysisPatterns(
  analyses: TranscriptAnalysis[],
): AnalysisBatch['patterns'] {
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

/**
 * Builds realistic test scenarios from the agent prompt and observed failure patterns.
 *
 * Generation stays deterministic so reviewers can inspect the harness and rerun it
 * without LLM variance. An LLM provider can enrich the copy while preserving the
 * same structured `OptimizerTestCase` contract.
 */
export function generateTestCases(
  agent: AgentConfig,
  analysis: Pick<AnalysisBatch, 'patterns'>,
): OptimizerTestCase[] {
  const baseCases: OptimizerTestCase[] = [
    {
      id: stableId(agent.agentId, 'happy-booking'),
      title: 'Qualified caller books a standard appointment',
      scenario:
        'Caller asks for a covered service, provides name, phone, ZIP, preferred time, budget, and SMS consent.',
      pathType: 'happy_path',
      successCriteria: [
        criteria.collect_contact_info.label,
        criteria.capture_service.label,
        criteria.capture_zip.label,
        criteria.capture_preferred_time.label,
        criteria.ask_budget.label,
        criteria.ask_sms_consent.label,
        criteria.follow_booking_flow.label,
        criteria.stay_polite.label,
      ],
    },
    {
      id: stableId(agent.agentId, 'urgent-earliest-slot'),
      title: 'Urgent caller needs earliest available slot',
      scenario:
        'Caller says the issue is urgent and asks for help today, but only later appointment slots are available.',
      pathType: 'edge_case',
      sourcePattern: 'objection_handling',
      successCriteria: [
        criteria.handle_urgency.label,
        criteria.follow_booking_flow.label,
        'Must clearly state earliest available slot and forward details for faster follow-up',
      ],
    },
    {
      id: stableId(agent.agentId, 'unsupported-pricing'),
      title: 'Caller pushes for exact pricing or a guarantee',
      scenario:
        'Caller asks for an exact price and a guaranteed outcome before the appointment is booked.',
      pathType: 'edge_case',
      sourcePattern: 'policy',
      successCriteria: [
        criteria.avoid_unsupported_claims.label,
        'Must offer the approved pricing boundary or callback instead of inventing a quote',
      ],
    },
  ];

  const patternCases = analysis.patterns.map((pattern) => patternToTestCase(agent, pattern));
  const unique = new Map<string, OptimizerTestCase>();

  for (const testCase of [...baseCases, ...patternCases]) {
    unique.set(testCase.id, testCase);
  }

  return [...unique.values()];
}

export function evaluateTestCases(
  agent: AgentConfig,
  testCases: OptimizerTestCase[],
): TestEvaluation[] {
  return testCases.map((testCase) => evaluateTestCase(agent, testCase));
}

export function recommendOptimizations(
  agent: AgentConfig,
  analysis: Pick<AnalysisBatch, 'analyses' | 'patterns'>,
  evaluations: TestEvaluation[],
): OptimizationRecommendation[] {
  const recommendations = new Map<string, OptimizationRecommendation>();

  for (const pattern of analysis.patterns) {
    const recommendation = recommendationForPattern(agent, pattern, analysis.analyses);
    recommendations.set(recommendation.id, recommendation);
  }

  const failedCriteria = new Set(evaluations.flatMap((evaluation) => evaluation.failedCriteria));

  if (failedCriteria.has(criteria.ask_budget.label)) {
    const recommendation = promptRecommendation(
      agent,
      'prompt-budget-required',
      'Make budget capture a hard gate before closing',
      'Budget capture is currently missing or too easy for the agent to skip.',
      `${agent.prompt}\n\nBefore closing or booking, ask one concise budget question and confirm the answer in the final recap.`,
      'Generated tests show the current prompt can pass through a booking path without an explicit budget capture gate.',
      ['ask_budget'],
    );
    recommendations.set(recommendation.id, recommendation);
  }

  if (failedCriteria.has(criteria.ask_sms_consent.label)) {
    const recommendation = promptRecommendation(
      agent,
      'prompt-sms-consent-required',
      'Require explicit SMS consent before sending confirmations',
      'SMS consent is not strongly enforced in the current prompt.',
      `${agent.prompt}\n\nOnly send or promise SMS after asking for explicit consent using the configured consent phrase.`,
      'Generated follow-up tests require consent before confirmation messaging.',
      ['ask_sms_consent'],
    );
    recommendations.set(recommendation.id, recommendation);
  }

  if (agent.temperature > 0.7) {
    recommendations.set(stableId(agent.agentId, 'temperature-lower'), {
      id: stableId(agent.agentId, 'temperature-lower'),
      target: 'temperature',
      title: 'Lower temperature for scripted booking compliance',
      before: String(agent.temperature),
      after: '0.4',
      reasoning:
        'Voice reception flows are procedural. A lower temperature reduces variation around qualification, consent, and booking steps.',
      evidenceIds: evaluations
        .filter((evaluation) => evaluation.status !== 'pass')
        .map((evaluation) => evaluation.testCaseId),
      status: 'proposed',
    });
  }

  return [...recommendations.values()];
}

export function runOptimizationLoop(agent: AgentConfig, analysis: AnalysisBatch): OptimizationRun {
  const testCases = generateTestCases(agent, analysis);
  const evaluations = evaluateTestCases(agent, testCases);
  const recommendations = recommendOptimizations(agent, analysis, evaluations);

  return {
    agentId: agent.agentId,
    testCases,
    evaluations,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

function patternToTestCase(agent: AgentConfig, pattern: PerformancePattern): OptimizerTestCase {
  switch (pattern.category) {
    case 'booking_flow':
      return {
        id: stableId(agent.agentId, 'pattern-booking-flow'),
        title: 'Booking flow recovery after a scheduling request',
        scenario:
          'Caller directly asks to schedule, gives availability, and expects the agent to offer or confirm an appointment slot.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [
          criteria.follow_booking_flow.label,
          'Must invoke or clearly describe the available-slot and booking flow',
        ],
      };
    case 'qualification':
      return {
        id: stableId(agent.agentId, 'pattern-qualification'),
        title: 'Complete qualification before close',
        scenario:
          'Caller is ready to book but answers in fragments, requiring the agent to collect missing service, ZIP, time, budget, and callback details one question at a time.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [
          criteria.collect_contact_info.label,
          criteria.capture_service.label,
          criteria.capture_zip.label,
          criteria.capture_preferred_time.label,
          criteria.ask_budget.label,
        ],
      };
    case 'follow_up':
      return {
        id: stableId(agent.agentId, 'pattern-follow-up'),
        title: 'SMS follow-up with consent',
        scenario:
          'Caller asks for a text confirmation after booking but has not yet granted SMS permission.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [
          criteria.ask_sms_consent.label,
          'Must avoid promising or sending SMS until consent is captured',
        ],
      };
    case 'policy':
      return {
        id: stableId(agent.agentId, 'pattern-policy'),
        title: 'Policy boundary under caller pressure',
        scenario:
          'Caller asks the agent to diagnose the issue and guarantee a fixed price before the appointment.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [criteria.avoid_unsupported_claims.label],
      };
    case 'tone':
      return {
        id: stableId(agent.agentId, 'pattern-tone'),
        title: 'Polite interruption handling',
        scenario:
          'Caller interrupts twice and changes details mid-call while the agent still needs to keep the conversation concise.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [criteria.stay_polite.label, 'Must ask one question at a time'],
      };
    case 'knowledge_gap':
      return {
        id: stableId(agent.agentId, 'pattern-knowledge-gap'),
        title: 'Missing custom value fallback',
        scenario:
          'Caller asks for business hours or covered services while the prompt still contains unresolved HighLevel variables.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [
          'Must avoid reading raw template variables aloud',
          'Must offer callback when configured business context is unavailable',
        ],
      };
    case 'objection_handling':
      return {
        id: stableId(agent.agentId, 'pattern-objection-handling'),
        title: 'Urgent caller objection handling',
        scenario:
          'Caller objects that the offered slot is too late for an urgent issue and asks what else can be done.',
        pathType: 'edge_case',
        sourcePattern: pattern.category,
        successCriteria: [criteria.handle_urgency.label],
      };
  }
}

function evaluateTestCase(agent: AgentConfig, testCase: OptimizerTestCase): TestEvaluation {
  const prompt = agent.prompt.toLowerCase();
  const tools = new Set(agent.tools.map((tool) => tool.toLowerCase()));
  const failedCriteria = testCase.successCriteria.filter((criterion) => {
    const normalized = criterion.toLowerCase();

    if (normalized.includes('contact')) {
      return !/\b(name|phone|email|contact|callback)\b/i.test(prompt);
    }

    if (normalized.includes('service')) {
      return !/\b(service|requested|needs?)\b/i.test(prompt);
    }

    if (normalized.includes('zip') || normalized.includes('service area')) {
      return !/\b(zip|area|location)\b/i.test(prompt);
    }

    if (normalized.includes('preferred appointment time')) {
      return !/\b(preferred time|appointment time|availability|time)\b/i.test(prompt);
    }

    if (normalized.includes('budget')) {
      return !/\b(budget|price expectation|price range)\b/i.test(prompt);
    }

    if (normalized.includes('sms') || normalized.includes('consent')) {
      return !/\b(sms|text).{0,80}\b(consent|permission|allowed|okay)\b/i.test(prompt);
    }

    if (normalized.includes('booking') || normalized.includes('slot')) {
      return (
        !tools.has('appointment_booking') && !/\b(book|calendar|slot|appointment)\b/i.test(prompt)
      );
    }

    if (normalized.includes('urgent') || normalized.includes('earliest')) {
      return !/\b(urgent|emergency|earliest available|specialist team|sooner)\b/i.test(prompt);
    }

    if (
      normalized.includes('unsupported') ||
      normalized.includes('guarantee') ||
      normalized.includes('diagnose') ||
      normalized.includes('quote')
    ) {
      return !/\b(do not|don't|avoid|only).{0,80}\b(price|diagnos|guarantee|claim|policy)\b/i.test(
        prompt,
      );
    }

    if (normalized.includes('polite') || normalized.includes('one question')) {
      return !/\b(friendly|polite|one question|natural|concise)\b/i.test(prompt);
    }

    if (normalized.includes('raw template')) {
      return /\{\{\s*[^}]+?\s*\}\}/.test(agent.prompt);
    }

    return false;
  });

  const score = Math.max(0, 100 - failedCriteria.length * 18);
  const status = failedCriteria.length === 0 ? 'pass' : score < 70 ? 'fail' : 'risk';

  return {
    testCaseId: testCase.id,
    status,
    score,
    failedCriteria,
    reasoning:
      failedCriteria.length === 0
        ? 'The current prompt/configuration covers every success criterion for this generated scenario.'
        : `The current prompt/configuration misses ${failedCriteria.length} criterion/criteria for this scenario.`,
  };
}

function recommendationForPattern(
  agent: AgentConfig,
  pattern: PerformancePattern,
  analyses: TranscriptAnalysis[],
): OptimizationRecommendation {
  const evidenceIds = analyses
    .filter((analysis) =>
      analysis.findings.some(
        (finding) => finding.category === pattern.category && finding.severity === pattern.severity,
      ),
    )
    .map((analysis) => analysis.transcriptId);

  switch (pattern.category) {
    case 'booking_flow':
      return promptRecommendation(
        agent,
        'prompt-booking-flow',
        'Tighten the appointment booking branch',
        'Booking flow guidance is present but not reliably followed.',
        `${agent.prompt}\n\nWhen a caller asks to book, reschedule, or qualifies with a high score, offer available slots and confirm the selected appointment before closing.`,
        'Recurring booking-flow findings show callers requested appointments without a clear slot offer or booking confirmation.',
        evidenceIds,
      );
    case 'qualification':
      return promptRecommendation(
        agent,
        'prompt-qualification-checklist',
        'Add a required qualification checklist',
        'Qualification fields are described but not enforced as a close gate.',
        `${agent.prompt}\n\nBefore ending the call, verify name, callback channel, requested service, ZIP, preferred time, budget, and SMS consent if texting is needed.`,
        'Transcript findings show repeated missed qualification questions.',
        evidenceIds,
      );
    case 'follow_up':
      return promptRecommendation(
        agent,
        'prompt-follow-up-consent',
        'Strengthen follow-up consent rules',
        'Follow-up messaging can happen without a strong consent checkpoint.',
        `${agent.prompt}\n\nDo not send or promise SMS until the caller explicitly agrees to receive text messages.`,
        'Follow-up findings show SMS consent was not captured before confirmation language.',
        evidenceIds,
      );
    case 'objection_handling':
      return promptRecommendation(
        agent,
        'prompt-urgency-objection',
        'Add urgent objection handling language',
        'Urgent callers need a clear branch for earliest-slot booking and specialist escalation.',
        `${agent.prompt}\n\nIf a caller says the matter is urgent and earlier slots are unavailable, book the earliest available slot and say their details are being forwarded for a faster callback attempt.`,
        'Urgency findings show callers were not escalated or given earliest-slot language.',
        evidenceIds,
      );
    case 'policy':
      return promptRecommendation(
        agent,
        'guardrail-policy-boundary',
        'Reinforce unsupported-claim guardrails',
        'The prompt boundary should be harder for pricing, diagnoses, guarantees, and policies.',
        `${agent.prompt}\n\nNever invent exact prices, diagnoses, guarantees, or policies. Use approved knowledge only and offer a callback when details are unavailable.`,
        'Policy findings show unsupported claims or weak boundary handling.',
        evidenceIds,
        'guardrail',
      );
    case 'knowledge_gap':
      return {
        id: stableId(agent.agentId, 'knowledge-base-config'),
        target: 'knowledge_base',
        title: 'Resolve missing HighLevel variables and FAQ context',
        before: 'Prompt references unresolved HighLevel variables or missing business context.',
        after:
          'Create the referenced custom values/contact fields and add business hours, service areas, pricing boundary, and booking FAQ to the knowledge base.',
        reasoning:
          'Unresolved variables can leak template syntax into live calls and weaken answers about hours, services, and service areas.',
        evidenceIds,
        status: 'proposed',
      };
    case 'tone':
      return promptRecommendation(
        agent,
        'prompt-tone-recovery',
        'Add interruption recovery language',
        'The prompt needs a concise recovery pattern for interrupted or frustrated callers.',
        `${agent.prompt}\n\nWhen interrupted, briefly acknowledge the correction, update the captured value, and ask only the next required question.`,
        'Tone findings show the agent needs stronger guidance for caller interruptions or frustration.',
        evidenceIds,
      );
  }
}

function promptRecommendation(
  agent: AgentConfig,
  key: string,
  title: string,
  before: string,
  after: string,
  reasoning: string,
  evidenceIds: string[],
  target: OptimizationRecommendation['target'] = 'prompt',
): OptimizationRecommendation {
  return {
    id: stableId(agent.agentId, key),
    target,
    title,
    before,
    after,
    reasoning,
    evidenceIds,
    status: 'proposed',
  };
}

function stableId(agentId: string, key: string): string {
  return `${agentId}:${key}`;
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
