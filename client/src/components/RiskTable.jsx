import { useMemo, useState } from 'react';
import { CATEGORIES } from '../utils/riskMath';

const badge = (p) => {
  if (p === 'High')
    return 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30';
  if (p === 'Medium')
    return 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/28';
  if (p === 'Low')
    return 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/28';
  return 'bg-slate-600/30 text-slate-300 ring-1 ring-slate-500/25';
};

function rpnBadge(rpn) {
  if (rpn == null) return '—';
  if (rpn >= 500) return 'high';
  if (rpn >= 200) return 'med';
  return 'low';
}

const thBtn =
  'group inline-flex w-full items-center justify-start gap-0.5 text-left font-medium text-slate-400 transition hover:text-slate-200';

export default function RiskTable({
  risks,
  onEdit,
  onDelete,
  showProjectColumn = false,
}) {
  const [sort, setSort] = useState({ key: 'riskId', dir: 'asc' });
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (cat && r.category !== cat) return false;
      if (status && r.status !== status) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        String(r.riskId).toLowerCase().includes(s) ||
        String(r.description).toLowerCase().includes(s) ||
        String(r.owner || '').toLowerCase().includes(s)
      );
    });
  }, [risks, q, cat, status]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const { key, dir } = sort;
    arr.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'asc' ? va - vb : vb - va;
      }
      return dir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [filtered, sort]);

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const colMeta = [
    ['riskId', 'ID', false],
    ...(showProjectColumn ? [['projectName', 'Project', false]] : []),
    ['description', 'Description', false],
    ['category', 'Category', false],
    ['owner', 'Owner', false],
    ['probability', 'P', true],
    ['impact', 'I', true],
    ['riskScore', 'P×I', true],
    ['severity', 'S', true],
    ['occurrence', 'O', true],
    ['detection', 'D', true],
    ['rpn', 'RPN', true],
    ['priority', 'Priority', false],
    ['status', 'Status', false],
  ];

  return (
    <div className="app-card overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-slate-700/60 bg-surface-900/40 p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="app-input min-w-0 flex-1 sm:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="app-select w-full min-w-[160px] sm:w-auto"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="app-select w-full min-w-[140px] sm:w-auto"
          >
            <option value="">All statuses</option>
            <option>Open</option>
            <option>Closed</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-slate-700/70 bg-surface-900/90">
              {colMeta.map(([key, label, numeric]) => (
                <th
                  key={key}
                  className={`px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 ${
                    numeric ? 'text-right' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className={`${thBtn} ${numeric ? 'justify-end' : ''}`}
                  >
                    {label}
                    {sort.key === key ? (
                      <span className="text-sky-400" aria-hidden>
                        {sort.dir === 'asc' ? '↑' : '↓'}
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-40">↕</span>
                    )}
                  </button>
                </th>
              ))}
              <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                Mitigation
              </th>
              <th className="sticky right-0 z-10 border-l border-slate-800/80 bg-surface-900/95 px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 backdrop-blur-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sorted.map((r) => (
              <tr
                key={r.id}
                className="transition-colors hover:bg-surface-800/40"
              >
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[12px] font-medium text-sky-300/95">
                  {r.riskId}
                </td>
                {showProjectColumn && (
                  <td className="max-w-[140px] truncate px-3 py-2.5 text-[12px] text-slate-500">
                    {r.projectName || r.projectKey || '—'}
                  </td>
                )}
                <td className="max-w-[min(280px,28vw)] px-3 py-2.5 text-slate-200">
                  <span className="line-clamp-3">{r.description}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex rounded-md bg-slate-700/50 px-2 py-0.5 text-[11px] font-medium text-slate-200">
                    {r.category}
                  </span>
                </td>
                <td className="max-w-[120px] truncate px-3 py-2.5 text-slate-400">
                  {r.owner || '—'}
                </td>
                <td className="table-num px-3 py-2.5">{r.probability ?? '—'}</td>
                <td className="table-num px-3 py-2.5">{r.impact ?? '—'}</td>
                <td className="table-num px-3 py-2.5 font-medium text-slate-100">
                  {r.riskScore ?? '—'}
                </td>
                <td className="table-num px-3 py-2.5">{r.severity ?? '—'}</td>
                <td className="table-num px-3 py-2.5">{r.occurrence ?? '—'}</td>
                <td className="table-num px-3 py-2.5">{r.detection ?? '—'}</td>
                <td className="table-num px-3 py-2.5">
                  <span
                    className={
                      rpnBadge(r.rpn) === 'high'
                        ? 'font-semibold text-red-300'
                        : rpnBadge(r.rpn) === 'med'
                          ? 'font-medium text-amber-200'
                          : 'text-slate-300'
                    }
                  >
                    {r.rpn ?? '—'}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${badge(
                      r.priority
                    )}`}
                  >
                    {r.priority}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-400">{r.status}</td>
                <td className="max-w-[200px] truncate px-3 py-2.5 text-[12px] text-slate-500">
                  {r.mitigation || '—'}
                </td>
                <td className="sticky right-0 z-10 flex flex-wrap gap-1.5 border-l border-slate-800/60 bg-surface-850/95 px-3 py-2.5 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    className="rounded-md border border-slate-600/80 bg-slate-800/80 px-2.5 py-1 text-[12px] font-medium text-slate-100 transition hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="rounded-md border border-red-900/50 bg-red-950/40 px-2.5 py-1 text-[12px] font-medium text-red-200/90 transition hover:bg-red-900/50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && (
        <p className="px-6 py-8 text-center text-[13px] text-slate-500">
          No matching rows.
        </p>
      )}
    </div>
  );
}
