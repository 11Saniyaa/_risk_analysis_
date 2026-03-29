/** Probability & Impact (1–5) → inherent risk score for matrix */
export function computeRiskScore(probability, impact) {
  if (
    probability == null ||
    impact == null ||
    Number.isNaN(Number(probability)) ||
    Number.isNaN(Number(impact))
  ) {
    return null;
  }
  return Number(probability) * Number(impact);
}

/** FMEA: RPN = Severity × Occurrence × Detection (each 1–10) */
export function computeRPN(severity, occurrence, detection) {
  if (
    severity == null ||
    occurrence == null ||
    detection == null ||
    Number.isNaN(Number(severity)) ||
    Number.isNaN(Number(occurrence)) ||
    Number.isNaN(Number(detection))
  ) {
    return null;
  }
  return (
    Number(severity) * Number(occurrence) * Number(detection)
  );
}

/** 1–25 scale from P×I */
export function priorityFromRiskScore(riskScore) {
  if (riskScore == null || Number.isNaN(riskScore)) return 'Pending';
  if (riskScore >= 15) return 'High';
  if (riskScore >= 8) return 'Medium';
  return 'Low';
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export const CATEGORIES = [
  'Technical',
  'Financial',
  'Safety',
  'Environmental',
  'Operational',
  'Legal',
];
