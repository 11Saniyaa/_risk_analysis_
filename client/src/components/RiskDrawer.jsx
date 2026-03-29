import { useEffect, useState } from 'react';
import {
  computeRiskScore,
  computeRPN,
  priorityFromRiskScore,
  CATEGORIES,
} from '../utils/riskMath';

const empty = {
  riskId: '',
  description: '',
  category: 'Operational',
  owner: '',
  cause: '',
  impactDescription: '',
  probability: '',
  impact: '',
  severity: '',
  occurrence: '',
  detection: '',
  mitigation: '',
  treatment: 'Unassigned',
  status: 'Open',
};

export default function RiskDrawer({
  open,
  onClose,
  initial,
  onSave,
  newRiskIdHint,
}) {
  const [f, setF] = useState(empty);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setF({
        riskId: initial.riskId || '',
        description: initial.description || '',
        category: initial.category || 'Operational',
        owner: initial.owner || '',
        cause: initial.cause || '',
        impactDescription: initial.impactDescription || '',
        probability: initial.probability ?? '',
        impact: initial.impact ?? '',
        severity: initial.severity ?? '',
        occurrence: initial.occurrence ?? '',
        detection: initial.detection ?? '',
        mitigation: initial.mitigation || '',
        treatment: initial.treatment || 'Unassigned',
        status: initial.status || 'Open',
      });
    } else {
      setF({ ...empty, riskId: newRiskIdHint || '' });
    }
  }, [open, initial, newRiskIdHint]);

  const p = f.probability === '' ? null : Number(f.probability);
  const i = f.impact === '' ? null : Number(f.impact);
  const s = f.severity === '' ? null : Number(f.severity);
  const o = f.occurrence === '' ? null : Number(f.occurrence);
  const d = f.detection === '' ? null : Number(f.detection);

  const liveScore = computeRiskScore(p, i);
  const liveRpn = computeRPN(s, o, d);
  const livePri = priorityFromRiskScore(liveScore);

  const set = (k) => (e) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      riskId: f.riskId.trim(),
      description: f.description.trim(),
      category: f.category,
      owner: f.owner.trim(),
      cause: f.cause,
      impactDescription: f.impactDescription,
      probability: f.probability === '' ? null : Number(f.probability),
      impact: f.impact === '' ? null : Number(f.impact),
      severity: f.severity === '' ? null : Number(f.severity),
      occurrence: f.occurrence === '' ? null : Number(f.occurrence),
      detection: f.detection === '' ? null : Number(f.detection),
      mitigation: f.mitigation,
      treatment: f.treatment,
      status: f.status,
    };
    if (!payload.riskId || !payload.description) return;
    onSave(payload, initial?.id);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-700/90 bg-surface-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700/90 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            {initial ? 'Edit' : 'New risk'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost rounded-lg p-2 text-lg leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto px-5 pb-6 pt-4">
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg border border-slate-700/80 bg-surface-950/80 px-3 py-3 text-[12px]">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                P×I
              </span>
              <span className="font-mono text-[15px] text-white">
                {liveScore ?? '—'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                RPN
              </span>
              <span className="font-mono text-[15px] text-emerald-300/90">
                {liveRpn ?? '—'}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                Priority
              </span>
              <span className="text-[15px] font-semibold text-amber-200/90">
                {livePri}
              </span>
            </div>
          </div>

          <label className="mb-4 block">
            <span className="app-label">Risk ID</span>
            <input
              required
              value={f.riskId}
              onChange={set('riskId')}
              className="app-input font-mono"
            />
          </label>
          <label className="mb-4 block">
            <span className="app-label">Description</span>
            <textarea
              required
              rows={2}
              value={f.description}
              onChange={set('description')}
              className="app-input min-h-[72px]"
            />
          </label>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="app-label">Category</span>
              <select
                value={f.category}
                onChange={set('category')}
                className="app-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="app-label">Owner</span>
              <input
                value={f.owner}
                onChange={set('owner')}
                placeholder="Team or person"
                className="app-input"
              />
            </label>
          </div>
          <label className="mb-4 block">
            <span className="app-label">Cause</span>
            <textarea
              rows={2}
              value={f.cause}
              onChange={set('cause')}
              className="app-input min-h-[72px]"
            />
          </label>
          <label className="mb-4 block">
            <span className="app-label">Impact description</span>
            <textarea
              rows={2}
              value={f.impactDescription}
              onChange={set('impactDescription')}
              className="app-input min-h-[72px]"
            />
          </label>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Matrix ratings (1–5)
          </p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="app-label">Probability</span>
              <input
                type="number"
                min={1}
                max={5}
                value={f.probability}
                onChange={set('probability')}
                className="app-input tabular-nums"
              />
            </label>
            <label className="block">
              <span className="app-label">Impact</span>
              <input
                type="number"
                min={1}
                max={5}
                value={f.impact}
                onChange={set('impact')}
                className="app-input tabular-nums"
              />
            </label>
          </div>

          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            FMEA (1–10) · RPN = S×O×D
          </p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <label className="block">
              <span className="app-label">Severity</span>
              <input
                type="number"
                min={1}
                max={10}
                value={f.severity}
                onChange={set('severity')}
                className="app-input tabular-nums"
              />
            </label>
            <label className="block">
              <span className="app-label">Occurrence</span>
              <input
                type="number"
                min={1}
                max={10}
                value={f.occurrence}
                onChange={set('occurrence')}
                className="app-input tabular-nums"
              />
            </label>
            <label className="block">
              <span className="app-label">Detection</span>
              <input
                type="number"
                min={1}
                max={10}
                value={f.detection}
                onChange={set('detection')}
                className="app-input tabular-nums"
              />
            </label>
          </div>

          <label className="mb-4 block">
            <span className="app-label">Mitigation</span>
            <textarea
              rows={3}
              value={f.mitigation}
              onChange={set('mitigation')}
              className="app-input min-h-[88px]"
            />
          </label>
          <div className="mb-6 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="app-label">Treatment</span>
              <select
                value={f.treatment}
                onChange={set('treatment')}
                className="app-select"
              >
                <option>Unassigned</option>
                <option>Avoid</option>
                <option>Reduce</option>
                <option>Transfer</option>
                <option>Accept</option>
              </select>
            </label>
            <label className="block">
              <span className="app-label">Status</span>
              <select
                value={f.status}
                onChange={set('status')}
                className="app-select"
              >
                <option>Open</option>
                <option>Closed</option>
              </select>
            </label>
          </div>
          <div className="mt-auto flex gap-3 border-t border-slate-700/90 pt-5">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              Save risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
