import MetricsCharts from './MetricsCharts';
import RiskMatrix from './RiskMatrix';

export default function PresentationMode({ risks, onClose }) {
  const total = risks.length;
  const high = risks.filter((r) => r.priority === 'High').length;
  const open = risks.filter((r) => r.status === 'Open').length;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-surface-950 text-white print:relative print:min-h-screen print:bg-white print:text-black">
      <header className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 bg-surface-950/95 px-6 py-4 shadow-header backdrop-blur-md">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
            Stakeholder view
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Risk &amp; FMEA overview
          </h1>
        </div>
        <button type="button" onClick={onClose} className="btn-secondary">
          Exit presentation
        </button>
      </header>

      <div className="print-root flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-700/80 bg-surface-850 p-6 shadow-card print:border-slate-300">
              <p className="text-sm text-slate-400 print:text-slate-600">
                Total risks
              </p>
              <p className="text-4xl font-bold text-white print:text-slate-900">
                {total}
              </p>
            </div>
            <div className="rounded-2xl border border-red-900/40 bg-red-950/30 p-6 print:border-red-200">
              <p className="text-sm text-red-200/80 print:text-red-800">
                High priority (matrix)
              </p>
              <p className="text-4xl font-bold text-red-300 print:text-red-700">
                {high}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-700/80 bg-surface-850 p-6 print:border-slate-300">
              <p className="text-sm text-slate-400 print:text-slate-600">Open</p>
              <p className="text-4xl font-bold text-white print:text-slate-900">
                {open}
              </p>
            </div>
          </div>

          <MetricsCharts risks={risks} compact />

          <RiskMatrix risks={risks} />

          <div className="rounded-xl border border-slate-700/80 bg-surface-850 p-4 print:border-slate-300">
            <h2 className="mb-3 text-lg font-semibold">Register snapshot</h2>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-slate-500 print:border-slate-300 print:text-slate-600">
                  <th className="py-2 pr-2">ID</th>
                  <th className="py-2 pr-2">Description</th>
                  <th className="py-2">P×I</th>
                  <th className="py-2">RPN</th>
                  <th className="py-2">Owner</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-800/80 print:border-slate-200"
                  >
                    <td className="py-2 font-mono text-xs text-blue-300 print:text-blue-900">
                      {r.riskId}
                    </td>
                    <td className="max-w-md py-2 text-slate-300 print:text-slate-800">
                      {r.description}
                    </td>
                    <td className="py-2">{r.riskScore ?? '—'}</td>
                    <td className="py-2">{r.rpn ?? '—'}</td>
                    <td className="py-2 text-slate-400 print:text-slate-700">
                      {r.owner || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
