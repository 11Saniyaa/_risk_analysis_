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
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-slate-700 bg-surface-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">
            {initial ? 'Edit risk' : 'New risk'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-1 flex-col overflow-y-auto p-4">
          <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-950/40 p-3 text-sm">
            <div className="font-medium text-blue-200">Live preview</div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              <span className="text-blue-300/90">P×I</span> drives the matrix and
              priority band. <span className="text-emerald-300/90">RPN</span> is
              independent (FMEA scale).
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-slate-300">
              <div>
                <span className="text-slate-500">P×I score</span>{' '}
                <span className="font-mono text-white">
                  {liveScore ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">RPN</span>{' '}
                <span className="font-mono text-emerald-300">
                  {liveRpn ?? '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Priority</span>{' '}
                <span className="font-semibold text-amber-200">{livePri}</span>
              </div>
            </div>
          </div>

          <label className="mb-2 block text-xs text-slate-400">
            Risk ID
            <input
              required
              value={f.riskId}
              onChange={set('riskId')}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="mb-2 block text-xs text-slate-400">
            Description
            <textarea
              required
              rows={2}
              value={f.description}
              onChange={set('description')}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">
              Category
              <select
                value={f.category}
                onChange={set('category')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-2 py-2 text-sm text-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-400">
              Owner
              <input
                value={f.owner}
                onChange={set('owner')}
                placeholder="Team / person"
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>
          <label className="mb-2 block text-xs text-slate-400">
            Cause
            <textarea
              rows={2}
              value={f.cause}
              onChange={set('cause')}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="mb-2 block text-xs text-slate-400">
            Impact description
            <textarea
              rows={2}
              value={f.impactDescription}
              onChange={set('impactDescription')}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
            />
          </label>

          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Matrix (1–5)
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">
              Probability
              <input
                type="number"
                min={1}
                max={5}
                value={f.probability}
                onChange={set('probability')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-xs text-slate-400">
              Impact
              <input
                type="number"
                min={1}
                max={5}
                value={f.impact}
                onChange={set('impact')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>

          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            FMEA (1–10) — RPN = S×O×D
          </p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            <label className="text-xs text-slate-400">
              Severity
              <input
                type="number"
                min={1}
                max={10}
                value={f.severity}
                onChange={set('severity')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-xs text-slate-400">
              Occurrence
              <input
                type="number"
                min={1}
                max={10}
                value={f.occurrence}
                onChange={set('occurrence')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="text-xs text-slate-400">
              Detection
              <input
                type="number"
                min={1}
                max={10}
                value={f.detection}
                onChange={set('detection')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
              />
            </label>
          </div>

          <label className="mb-2 block text-xs text-slate-400">
            Mitigation
            <textarea
              rows={3}
              value={f.mitigation}
              onChange={set('mitigation')}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white"
            />
          </label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">
              Treatment
              <select
                value={f.treatment}
                onChange={set('treatment')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-2 py-2 text-sm text-white"
              >
                <option>Unassigned</option>
                <option>Avoid</option>
                <option>Reduce</option>
                <option>Transfer</option>
                <option>Accept</option>
              </select>
            </label>
            <label className="text-xs text-slate-400">
              Status
              <select
                value={f.status}
                onChange={set('status')}
                className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-2 py-2 text-sm text-white"
              >
                <option>Open</option>
                <option>Closed</option>
              </select>
            </label>
          </div>
          <div className="mt-auto flex gap-2 border-t border-slate-700 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-600 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
