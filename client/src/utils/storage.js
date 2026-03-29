const KEY = 'rms_risk_register_v2';

export function loadRisks() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRisks(risks) {
  localStorage.setItem(KEY, JSON.stringify(risks));
}

export function clearRisks() {
  localStorage.removeItem(KEY);
}
