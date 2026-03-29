import { useMemo, useState } from 'react';
import { CATEGORIES } from '../utils/riskMath';

const badge = (p) => {
  if (p === 'High')
    return 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40';
  if (p === 'Medium')
    return 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-500/35';
  if (p === 'Low')
    return 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-500/35';
  return 'bg-slate-600/40 text-slate-300 ring-1 ring-slate-500/30';
};

function rpnBadge(rpn) {
  if (rpn == null) return '—';
  if (rpn >= 500) return 'high';
  if (rpn >= 200) return 'med';
  return 'low';
}

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

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-surface-850 shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/80 p-3">
        <input
          type="search"
          placeholder="Search ID, description, owner…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-600 bg-surface-900 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-lg border border-slate-600 bg-surface-900 px-2 py-1.5 text-sm text-slate-200"
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
          className="rounded-lg border border-slate-600 bg-surface-900 px-2 py-1.5 text-sm text-slate-200"
        >
          <option value="">All statuses</option>
          <option>Open</option>
          <option>Closed</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700/80 bg-surface-900/80 text-xs uppercase tracking-wide text-slate-500">
              {[
                ['riskId', 'ID'],
                ...(showProjectColumn ? [['projectName', 'Project']] : []),
                ['description', 'Description'],
                ['category', 'Category'],
                ['owner', 'Owner'],
                ['probability', 'P'],
                ['impact', 'I'],
                ['riskScore', 'P×I'],
                ['severity', 'S'],
                ['occurrence', 'O'],
                ['detection', 'D'],
                ['rpn', 'RPN'],
                ['priority', 'Priority'],
                ['status', 'Status'],
              ].map(([key, label]) => (
                <th key={key} className="px-2 py-2 font-semibold">
                  <button
                    type="button"
                    onClick={() => toggleSort(key)}
                    className="hover:text-slate-300"
                  >
                    {label}
                    {sort.key === key ? (sort.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                </th>
              ))}
              <th className="px-2 py-2 font-semibold">Mitigation</th>
              <th className="sticky right-0 bg-surface-900/95 px-2 py-2 font-semibold backdrop-blur">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sorted.map((r) => (
              <tr key={r.id} className="hover:bg-surface-800/60">
                <td className="whitespace-nowrap px-2 py-2 font-mono text-xs text-blue-300">
                  {r.riskId}
                </td>
                {showProjectColumn && (
                  <td className="max-w-[140px] truncate px-2 py-2 text-xs text-slate-400">
                    {r.projectName || r.projectKey || '—'}
                  </td>
                )}
                <td className="max-w-[220px] px-2 py-2 text-slate-300">
                  {r.description}
                </td>
                <td className="px-2 py-2">
                  <span className="rounded-md bg-slate-700/80 px-2 py-0.5 text-xs text-slate-200">
                    {r.category}
                  </span>
                </td>
                <td className="px-2 py-2 text-slate-400">{r.owner || '—'}</td>
                <td className="px-2 py-2">{r.probability ?? '—'}</td>
                <td className="px-2 py-2">{r.impact ?? '—'}</td>
                <td className="px-2 py-2 font-medium">{r.riskScore ?? '—'}</td>
                <td className="px-2 py-2">{r.severity ?? '—'}</td>
                <td className="px-2 py-2">{r.occurrence ?? '—'}</td>
                <td className="px-2 py-2">{r.detection ?? '—'}</td>
                <td className="px-2 py-2">
                  <span
                    className={
                      rpnBadge(r.rpn) === 'high'
                        ? 'font-semibold text-red-300'
                        : rpnBadge(r.rpn) === 'med'
                          ? 'text-amber-200'
                          : 'text-slate-300'
                    }
                  >
                    {r.rpn ?? '—'}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${badge(
                      r.priority
                    )}`}
                  >
                    {r.priority}
                  </span>
                </td>
                <td className="px-2 py-2 text-slate-400">{r.status}</td>
                <td className="max-w-[200px] truncate px-2 py-2 text-xs text-slate-400">
                  {r.mitigation || '—'}
                </td>
                <td className="sticky right-0 flex flex-wrap gap-1 bg-surface-850/95 px-2 py-2 backdrop-blur">
                  <button
                    type="button"
                    onClick={() => onEdit(r)}
                    className="rounded bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id)}
                    className="rounded bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-800/60"
                  >
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sorted.length === 0 && (
        <p className="p-6 text-center text-slate-500">No risks match filters.</p>
      )}
    </div>
  );
}
