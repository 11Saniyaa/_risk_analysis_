import { computeRiskScore, computeRPN } from './riskMath';

const HEADERS = [
  'projectName',
  'projectKey',
  'riskId',
  'description',
  'category',
  'owner',
  'probability',
  'impact',
  'riskScore',
  'severity',
  'occurrence',
  'detection',
  'rpn',
  'priority',
  'status',
  'treatment',
  'cause',
  'impactDescription',
  'mitigation',
  'createdAt',
];

function escapeCell(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function risksToCsv(risks) {
  const lines = [HEADERS.join(',')];
  for (const r of risks) {
    const rs =
      r.riskScore ??
      computeRiskScore(r.probability, r.impact) ??
      '';
    const rpn = r.rpn ?? computeRPN(r.severity, r.occurrence, r.detection) ?? '';
    const row = [
      r.projectName || '',
      r.projectKey || '',
      r.riskId,
      r.description,
      r.category,
      r.owner,
      r.probability,
      r.impact,
      rs,
      r.severity,
      r.occurrence,
      r.detection,
      rpn,
      r.priority,
      r.status,
      r.treatment,
      r.cause,
      r.impactDescription,
      r.mitigation,
      r.createdAt,
    ].map(escapeCell);
    lines.push(row.join(','));
  }
  return lines.join('\r\n');
}

export function downloadCsv(risks, filename = 'risk-register.csv') {
  const blob = new Blob([risksToCsv(risks)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
