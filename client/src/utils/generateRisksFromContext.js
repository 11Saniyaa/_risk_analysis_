/**
 * Deterministic risk drafts from project + detail text — no external AI.
 * Hash = f(projectKey, projectName, detailText) so different projects never
 * get the same five risks as another project for the same detail sentence.
 */

function hashString(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function slotHash(h, slot) {
  return (h + Math.imul(slot, 2654435761)) >>> 0;
}

/**
 * Hospital / patient-facing web & clinical IT — used when keywords match.
 */
const HEALTHCARE_WEB_POOL = [
  {
    category: 'Technical',
    description:
      'Patient portal or public website shows another patient’s record due to caching, deep-link, or session mix-up',
    cause: 'Insufficient cache isolation; shared device logout gaps',
    impactDescription: 'PHI disclosure; wrong clinical action',
    owner: 'Clinical IT / Security',
    p: 4,
    i: 5,
    s: 9,
    o: 4,
    d: 4,
  },
  {
    category: 'Legal',
    description:
      'Consent, privacy notice, or purpose-of-use not aligned with how the website collects or displays patient data',
    cause: 'Rapid feature release without privacy review',
    impactDescription: 'Regulatory findings; loss of trust',
    owner: 'Privacy / Compliance',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 5,
  },
  {
    category: 'Technical',
    description:
      'Incomplete or inconsistent patient demographics across scheduling site, registration, and EHR master patient index',
    cause: 'Weak validation rules; duplicate detection off',
    impactDescription: 'Duplicate records; wrong patient procedures',
    owner: 'Health informatics',
    p: 4,
    i: 5,
    s: 8,
    o: 5,
    d: 4,
  },
  {
    category: 'Operational',
    description:
      'Online appointment or triage workflow lacks required clinical flags (e.g. allergies, pregnancy) visible to downstream care',
    cause: 'Form design; integration gaps',
    impactDescription: 'Delayed or unsafe care',
    owner: 'Clinical ops',
    p: 3,
    i: 5,
    s: 8,
    o: 5,
    d: 5,
  },
  {
    category: 'Technical',
    description:
      'TLS, HSTS, or API authentication misconfiguration on patient-facing endpoints',
    cause: 'Infra drift; mixed HTTP/HTTPS content',
    impactDescription: 'Credential theft; PHI in transit exposure',
    owner: 'Security / DevOps',
    p: 3,
    i: 5,
    s: 8,
    o: 5,
    d: 3,
  },
  {
    category: 'Legal',
    description:
      'Third-party analytics or chat widgets on the patient site without a proper BAA and data-minimisation',
    cause: 'Marketing tooling added without review',
    impactDescription: 'HIPAA exposure; vendor breach liability',
    owner: 'Compliance',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 4,
  },
  {
    category: 'Technical',
    description:
      'Lab or imaging results released to the patient portal before clinician review policy allows',
    cause: 'Rules engine mis-tuned; time-zone errors',
    impactDescription: 'Patient distress; liability',
    owner: 'Clinical applications',
    p: 3,
    i: 4,
    s: 7,
    o: 4,
    d: 5,
  },
  {
    category: 'Safety',
    description:
      'Emergency department wait-time or capacity published on the website without safe escalation when thresholds breach',
    cause: 'One-way integration; stale data',
    impactDescription: 'Crowding; patient harm narrative',
    owner: 'ED leadership',
    p: 3,
    i: 4,
    s: 6,
    o: 5,
    d: 5,
  },
  {
    category: 'Operational',
    description:
      'Telehealth link or video visit entry point weak identity proofing (easy account takeover)',
    cause: 'Password-only; SMS OTP without rate limits',
    impactDescription: 'Virtual visit hijack; PHI access',
    owner: 'Digital health',
    p: 4,
    i: 4,
    s: 8,
    o: 5,
    d: 4,
  },
  {
    category: 'Technical',
    description:
      'FHIR or HL7 interfaces between website-adjacent services and EHR drop messages under peak load',
    cause: 'Queue sizing; retry storms',
    impactDescription: 'Missing orders; care delays',
    owner: 'Integration',
    p: 4,
    i: 4,
    s: 7,
    o: 6,
    d: 5,
  },
  {
    category: 'Financial',
    description:
      'Co-pay or estimate shown on the website inconsistent with billing system, confusing insured patients',
    cause: 'Multiple price sources; stale fee schedules',
    impactDescription: 'Revenue loss; complaints',
    owner: 'Patient financial services',
    p: 3,
    i: 3,
    s: 5,
    o: 5,
    d: 6,
  },
  {
    category: 'Technical',
    description:
      'Accessibility gaps (WCAG) on critical flows — booking, results, refill — blocking vulnerable patients',
    cause: 'Design debt; untested assistive tech',
    impactDescription: 'Legal exposure; care access inequity',
    owner: 'UX / Compliance',
    p: 3,
    i: 4,
    s: 6,
    o: 5,
    d: 5,
  },
  {
    category: 'Operational',
    description:
      'After-hours on-call routing from the website or IVR misdirects urgent oncology or OB calls',
    cause: 'Holiday schedule not updated in routing tables',
    impactDescription: 'Delayed urgent care',
    owner: 'Call centre ops',
    p: 2,
    i: 5,
    s: 9,
    o: 3,
    d: 5,
  },
  {
    category: 'Technical',
    description:
      'File upload on referral or intake forms accepts unsafe types or size, enabling malware or PHI exfiltration',
    cause: 'Missing content scanning; weak validation',
    impactDescription: 'Lateral movement in hospital network',
    owner: 'Security',
    p: 3,
    i: 5,
    s: 8,
    o: 4,
    d: 4,
  },
  {
    category: 'Legal',
    description:
      'Marketing landing pages reuse patient testimonials or outcomes without documented authorisation',
    cause: 'Campaign speed',
    impactDescription: 'Privacy complaints; OCR attention',
    owner: 'Legal / Marketing',
    p: 2,
    i: 4,
    s: 6,
    o: 4,
    d: 5,
  },
  {
    category: 'Technical',
    description:
      'Search on the patient site leaks other patients’ names or MRN fragments via autocomplete or error messages',
    cause: 'Broad search index; verbose errors',
    impactDescription: 'PHI enumeration',
    owner: 'Application security',
    p: 3,
    i: 5,
    s: 8,
    o: 4,
    d: 3,
  },
  {
    category: 'Operational',
    description:
      'Multilingual content on discharge or medication instructions out of sync with English source of truth',
    cause: 'Manual translation lag',
    impactDescription: 'Medication errors at home',
    owner: 'Clinical content',
    p: 3,
    i: 5,
    s: 8,
    o: 4,
    d: 5,
  },
  {
    category: 'Technical',
    description:
      'Rate limiting absent on password reset or OTP — enabling enumeration of valid patient accounts',
    cause: 'Customer-experience preference over abuse controls',
    impactDescription: 'Account takeover; harassment',
    owner: 'Security',
    p: 4,
    i: 4,
    s: 7,
    o: 6,
    d: 4,
  },
  {
    category: 'Environmental',
    description:
      'On-site kiosk or check-in tablets for patients not sanitised; infection control policy vs digital workflow conflict',
    cause: 'High throughput lobbies',
    impactDescription: 'Infection spread; reputational harm',
    owner: 'Facilities / IPC',
    p: 3,
    i: 3,
    s: 6,
    o: 5,
    d: 6,
  },
  {
    category: 'Technical',
    description:
      'Backup and disaster recovery for patient-facing stack not tested against RTO acceptable for critical results access',
    cause: 'Shared DR with non-clinical apps',
    impactDescription: 'Extended inability to view results',
    owner: 'IT operations',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 5,
  },
  {
    category: 'Operational',
    description:
      'Proxy or caregiver portal access to dependent records without durable consent or audit trail',
    cause: 'Feature shipped before policy sign-off',
    impactDescription: 'Unauthorized PHI view',
    owner: 'Privacy office',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 4,
  },
  {
    category: 'Technical',
    description:
      'Mobile responsive layout hides mandatory clinical warnings on small screens during e-prescribe or refill',
    cause: 'CSS breakpoints; vendor widget',
    impactDescription: 'Prescribing without full interaction checks',
    owner: 'Clinical apps',
    p: 3,
    i: 5,
    s: 8,
    o: 4,
    d: 4,
  },
];

const GENERAL_POOL = [
  {
    category: 'Technical',
    description: 'Single points of failure in critical infrastructure paths',
    cause: 'Architecture without redundant paths',
    impactDescription: 'Extended outage affecting core users',
    owner: 'Platform',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 4,
  },
  {
    category: 'Technical',
    description: 'Outdated dependencies with known CVE exposure',
    cause: 'Upgrade backlog',
    impactDescription: 'Exploit chain and data breach risk',
    owner: 'Security',
    p: 4,
    i: 5,
    s: 8,
    o: 6,
    d: 3,
  },
  {
    category: 'Financial',
    description: 'Budget overrun on major initiative',
    cause: 'Scope creep and supplier pricing',
    impactDescription: 'Delayed milestones and cuts elsewhere',
    owner: 'Finance',
    p: 3,
    i: 4,
    s: 6,
    o: 5,
    d: 5,
  },
  {
    category: 'Safety',
    description: 'Workplace ergonomics and fatigue during peak load',
    cause: 'High throughput periods',
    impactDescription: 'Injury and absenteeism',
    owner: 'HSE',
    p: 4,
    i: 3,
    s: 5,
    o: 6,
    d: 6,
  },
  {
    category: 'Environmental',
    description: 'Waste handling non-compliance at regional site',
    cause: 'Training gaps',
    impactDescription: 'Fines and permit risk',
    owner: 'Operations',
    p: 2,
    i: 4,
    s: 6,
    o: 4,
    d: 4,
  },
  {
    category: 'Operational',
    description: 'Key process knowledge concentrated in few people',
    cause: 'Documentation lag',
    impactDescription: 'Errors and slow recovery',
    owner: 'COO office',
    p: 3,
    i: 3,
    s: 5,
    o: 5,
    d: 5,
  },
  {
    category: 'Legal',
    description: 'Contract gaps with critical vendors',
    cause: 'Rapid procurement',
    impactDescription: 'Disputes and service disruption',
    owner: 'Legal',
    p: 2,
    i: 4,
    s: 7,
    o: 4,
    d: 4,
  },
  {
    category: 'Technical',
    description: 'Insufficient load testing before peak events',
    cause: 'Timeline pressure',
    impactDescription: 'Degraded experience and churn',
    owner: 'SRE',
    p: 4,
    i: 4,
    s: 6,
    o: 6,
    d: 5,
  },
  {
    category: 'Financial',
    description: 'Foreign exchange exposure on multi-currency contracts',
    cause: 'Volatile markets',
    impactDescription: 'Margin squeeze',
    owner: 'Treasury',
    p: 3,
    i: 3,
    s: 5,
    o: 5,
    d: 6,
  },
  {
    category: 'Safety',
    description: 'Emergency egress signage and drills not current',
    cause: 'Facility changes',
    impactDescription: 'Evacuation effectiveness in incident',
    owner: 'Facilities',
    p: 2,
    i: 5,
    s: 7,
    o: 3,
    d: 5,
  },
  {
    category: 'Operational',
    description: 'Supplier lead-time variability affecting commitments',
    cause: 'Logistics constraints',
    impactDescription: 'Customer penalties',
    owner: 'Supply chain',
    p: 4,
    i: 4,
    s: 6,
    o: 5,
    d: 5,
  },
  {
    category: 'Technical',
    description: 'Backup and restore drills not run to RTO targets',
    cause: 'Competing priorities',
    impactDescription: 'Failed recovery in real incident',
    owner: 'IT ops',
    p: 3,
    i: 5,
    s: 8,
    o: 5,
    d: 4,
  },
  {
    category: 'Legal',
    description: 'Emerging regulatory reporting obligations',
    cause: 'New legislation',
    impactDescription: 'Non-compliance penalties',
    owner: 'Compliance',
    p: 3,
    i: 4,
    s: 6,
    o: 4,
    d: 4,
  },
  {
    category: 'Environmental',
    description: 'Energy intensity rising vs sustainability targets',
    cause: 'Workload growth',
    impactDescription: 'Reputation and carbon costs',
    owner: 'Sustainability',
    p: 3,
    i: 3,
    s: 5,
    o: 5,
    d: 6,
  },
  {
    category: 'Financial',
    description: 'Accounts receivable concentration with few large customers',
    cause: 'Sales strategy',
    impactDescription: 'Cash flow shock if default',
    owner: 'Finance',
    p: 2,
    i: 4,
    s: 6,
    o: 4,
    d: 5,
  },
  {
    category: 'Technical',
    description: 'API rate limits and quotas misaligned with growth',
    cause: 'Usage forecast error',
    impactDescription: 'Throttling during campaigns',
    owner: 'Product',
    p: 4,
    i: 3,
    s: 5,
    o: 6,
    d: 5,
  },
  {
    category: 'Operational',
    description: 'On-call rotation burnout and coverage gaps',
    cause: 'Team size vs incident volume',
    impactDescription: 'Slow response and human error',
    owner: 'Engineering mgr',
    p: 4,
    i: 3,
    s: 5,
    o: 6,
    d: 5,
  },
  {
    category: 'Safety',
    description: 'Chemical storage inspection backlog',
    cause: 'Inspector capacity',
    impactDescription: 'Spill or exposure incident',
    owner: 'HSE',
    p: 2,
    i: 5,
    s: 8,
    o: 4,
    d: 3,
  },
  {
    category: 'Technical',
    description: 'Secrets rotation not automated for legacy services',
    cause: 'Tech debt',
    impactDescription: 'Credential leak window',
    owner: 'Security',
    p: 3,
    i: 5,
    s: 8,
    o: 5,
    d: 3,
  },
  {
    category: 'Legal',
    description: 'IP ownership ambiguity in contractor deliverables',
    cause: 'Contract templates',
    impactDescription: 'Disputes and blocked reuse',
    owner: 'Legal',
    p: 2,
    i: 4,
    s: 6,
    o: 4,
    d: 5,
  },
  {
    category: 'Environmental',
    description: 'Noise complaints from expanded operating hours',
    cause: 'Demand growth',
    impactDescription: 'Licence conditions and shutdown risk',
    owner: 'Operations',
    p: 3,
    i: 3,
    s: 5,
    o: 5,
    d: 6,
  },
  {
    category: 'Financial',
    description: 'Insurance coverage limits vs evolving asset base',
    cause: 'Asset growth',
    impactDescription: 'Uninsured loss gap',
    owner: 'Risk',
    p: 2,
    i: 4,
    s: 6,
    o: 4,
    d: 5,
  },
  {
    category: 'Operational',
    description: 'Manual handoffs between systems causing errors',
    cause: 'Integration backlog',
    impactDescription: 'Wrong decisions downstream',
    owner: 'Operations',
    p: 4,
    i: 4,
    s: 6,
    o: 6,
    d: 5,
  },
  {
    category: 'Technical',
    description: 'Observability gaps for new microservices',
    cause: 'Fast rollout',
    impactDescription: 'Blind spots during incidents',
    owner: 'SRE',
    p: 4,
    i: 4,
    s: 6,
    o: 5,
    d: 5,
  },
  {
    category: 'Safety',
    description: 'Lone-worker check-in not enforced uniformly',
    cause: 'Process variance by site',
    impactDescription: 'Delayed emergency response',
    owner: 'HSE',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 5,
  },
  {
    category: 'Technical',
    description: 'Data residency requirements vs current hosting regions',
    cause: 'Product expansion',
    impactDescription: 'Regulatory breach',
    owner: 'Infra',
    p: 3,
    i: 5,
    s: 7,
    o: 4,
    d: 4,
  },
  {
    category: 'Financial',
    description: 'Fraud monitoring rules not tuned for new payment rails',
    cause: 'Product launch',
    impactDescription: 'Losses and chargebacks',
    owner: 'Risk',
    p: 3,
    i: 4,
    s: 7,
    o: 5,
    d: 4,
  },
  {
    category: 'Operational',
    description: 'Business continuity plan not exercised this year',
    cause: 'Resource constraints',
    impactDescription: 'Chaotic response in crisis',
    owner: 'BCP owner',
    p: 3,
    i: 4,
    s: 6,
    o: 5,
    d: 5,
  },
  {
    category: 'Legal',
    description: 'Privacy impact assessments missing for new data uses',
    cause: 'Fast experimentation',
    impactDescription: 'Regulator findings',
    owner: 'DPO',
    p: 3,
    i: 4,
    s: 6,
    o: 5,
    d: 4,
  },
  {
    category: 'Environmental',
    description: 'Hazardous material inventory accuracy drift',
    cause: 'Infrequent cycle counts',
    impactDescription: 'Wrong response in spill',
    owner: 'EHS',
    p: 2,
    i: 4,
    s: 7,
    o: 4,
    d: 4,
  },
  {
    category: 'Technical',
    description: 'Mobile app signing keys custodianship on single laptop',
    cause: 'Informal process',
    impactDescription: 'Release block or compromise',
    owner: 'Mobile lead',
    p: 2,
    i: 4,
    s: 6,
    o: 4,
    d: 5,
  },
  {
    category: 'Financial',
    description: 'Grant or subsidy clawback if KPIs missed',
    cause: 'Ambitious targets',
    impactDescription: 'Sudden funding gap',
    owner: 'Finance',
    p: 3,
    i: 3,
    s: 6,
    o: 5,
    d: 5,
  },
];

/** Typo hints so "hosiptal" still matches healthcare */
function normalizeKeywordText(s) {
  return String(s || '')
    .replace(/\bhosiptal\b/gi, 'hospital')
    .replace(/\bspacific\b/gi, 'specific')
    .replace(/\bspecif\b/gi, 'specific');
}

function detectDomain(projectName, detailText) {
  const combined = normalizeKeywordText(
    `${projectName || ''} ${detailText || ''}`
  ).toLowerCase();
  const health =
    /\b(patient|patients|hospital|clinical|clinic|ehr|emr|epic|cerner|fhir|hl7|hipaa|phi|pii|medical|healthcare|physician|nurse|prescription|pharmacy|telehealth|telemedicine|icu|emergency|ward|triage|surgery|portal|mychart|admission|discharge|medication|allerg|oncology|radiology|pathology|baa|website|booking)\b|health\s*care|lab\s+result|patient\s+portal|web\s*site|online\s+booking/i;
  if (health.test(combined)) {
    return { pool: HEALTHCARE_WEB_POOL, id: 'healthcare_web' };
  }
  return { pool: GENERAL_POOL, id: 'general' };
}

function pickIndices(hash, count, poolLen) {
  const used = new Set();
  const out = [];
  let salt = hash;
  for (let i = 0; i < count; i++) {
    salt = (salt * 1103515245 + 12345 + i * 17) >>> 0;
    let idx = salt % poolLen;
    let guard = 0;
    while (used.has(idx) && guard < poolLen) {
      idx = (idx + 1) % poolLen;
      guard++;
    }
    used.add(idx);
    out.push(idx);
  }
  return out;
}

function perturb(h, slot, base, lo, hi, spread) {
  const sh = slotHash(h, slot);
  const delta = (sh % (spread * 2 + 1)) - spread;
  return clamp(base + delta, lo, hi);
}

/**
 * Keep Description column as a clean risk title; put your scenario in Cause.
 */
function buildCauseFromScenario(detailText, projectName, templateCause) {
  const d = String(detailText || '').trim();
  const pn = String(projectName || '').trim();
  const scenarioParts = [];
  if (d) scenarioParts.push(`Stakeholder note: ${d}`);
  if (pn && !d.toLowerCase().includes(pn.toLowerCase())) {
    scenarioParts.push(`Program: ${pn}`);
  }
  if (!scenarioParts.length) return templateCause;
  return `${scenarioParts.join(' · ')} · Underlying driver: ${templateCause}`;
}

/**
 * @param {string} detailText - free-text context for this project only
 * @param {{ projectKey: string, projectName: string, projectCode: string }} projectMeta
 */
export function generateRisksFromContext(detailText, projectMeta) {
  const pk = projectMeta.projectKey || 'default';
  const pname = projectMeta.projectName || '';
  const text = String(detailText || '');
  const { pool: activePool } = detectDomain(pname, text);
  const h = hashString(`${pk}\n${pname}\n${text}\n${activePool.length}`);
  const indices = pickIndices(h, 5, activePool.length);

  return indices.map((poolIdx, slot) => {
    const t = { ...activePool[poolIdx] };

    const p = perturb(h, slot, t.p, 1, 5, 1);
    const i = perturb(h, slot + 11, t.i, 1, 5, 1);
    const s = perturb(h, slot + 23, t.s, 1, 10, 2);
    const o = perturb(h, slot + 37, t.o, 1, 10, 2);
    const d = perturb(h, slot + 41, t.d, 1, 10, 2);

    return {
      description: t.description,
      category: t.category,
      owner: t.owner,
      cause: buildCauseFromScenario(text, pname, t.cause),
      impactDescription: t.impactDescription,
      probability: p,
      impact: i,
      severity: s,
      occurrence: o,
      detection: d,
      mitigation: '',
      treatment: 'Unassigned',
      status: 'Open',
      projectKey: pk,
      projectName: pname,
      projectCode: projectMeta.projectCode || 'PRJ',
    };
  });
}
