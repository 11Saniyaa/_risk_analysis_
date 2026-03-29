/** URL-safe slug for storage keys */
export function slugify(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'default';
}

/**
 * Short code for risk IDs, e.g. "Hospital East Wing" → HEW
 */
export function projectCodeFromName(name) {
  const w = String(name).trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return 'PRJ';
  if (w.length === 1) {
    const letters = w[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
    return (letters.slice(0, 4) || 'PRJ').slice(0, 6);
  }
  const code = w
    .map((x) => x.replace(/[^a-zA-Z]/g, '')[0])
    .filter(Boolean)
    .join('')
    .toUpperCase();
  return (code.slice(0, 6) || 'PRJ').slice(0, 6);
}

const PROJECT_KEY = 'rms_active_project_v1';

export function loadActiveProject() {
  try {
    const raw = localStorage.getItem(PROJECT_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p.name === 'string') {
        if (!p.name.trim()) {
          return { name: '', key: '', code: '' };
        }
        return {
          name: p.name,
          key: p.key || slugify(p.name),
          code: p.code || projectCodeFromName(p.name),
        };
      }
    }
  } catch {}
  return { name: '', key: '', code: '' };
}

export function saveActiveProject(p) {
  localStorage.setItem(PROJECT_KEY, JSON.stringify(p));
}

/**
 * Next ID like HEW-001 within the same projectKey
 */
export function nextRiskIdForProject(risks, projectKey, projectCode) {
  const code = String(projectCode || 'PRJ')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'PRJ';
  const same = risks.filter((r) => (r.projectKey || 'legacy') === projectKey);
  const re = new RegExp(`^${code}-(\\d+)$`, 'i');
  let max = 0;
  for (const r of same) {
    const m = re.exec(String(r.riskId || ''));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${code}-${String(max + 1).padStart(3, '0')}`;
}

export function normalizeDescriptionKey(description) {
  return String(description || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}
