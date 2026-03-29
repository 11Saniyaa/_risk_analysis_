import { computeRiskScore } from '../utils/riskMath';

function cellBand(score) {
  if (score == null) return 'bg-slate-700/50';
  if (score >= 15) return 'bg-red-500/85';
  if (score >= 8) return 'bg-amber-400/90 text-slate-900';
  return 'bg-emerald-500/85';
}

export default function RiskMatrix({ risks }) {
  const cells = [];
  for (let p = 5; p >= 1; p--) {
    for (let i = 1; i <= 5; i++) {
      const score = p * i;
      const inCell = risks.filter((r) => {
        const rs = r.riskScore ?? computeRiskScore(r.probability, r.impact);
        return (
          r.probability === p && r.impact === i && rs != null
        );
      });
      cells.push(
        <div
          key={`${p}-${i}`}
          className={`flex min-h-[72px] flex-col items-center justify-center gap-0.5 rounded-md border border-slate-900/40 p-1 text-center text-[10px] font-semibold ${cellBand(
            score
          )}`}
          title={`P=${p}, I=${i}, score=${score}`}
        >
          <span className="text-[11px] opacity-90">{score}</span>
          <div className="flex max-w-full flex-wrap justify-center gap-0.5">
            {inCell.map((r) => (
              <span
                key={r.id}
                className="truncate rounded bg-black/25 px-1 py-px text-[9px] font-medium text-white"
              >
                {r.riskId}
              </span>
            ))}
          </div>
        </div>
      );
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/80 bg-surface-850 p-4 shadow-card">
      <h3 className="mb-1 text-sm font-semibold text-slate-200">
        Probability × Impact matrix
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        Uses <strong className="text-slate-400">P×I only</strong> (same basis as the blue
        chart). FMEA RPN is separate.
      </p>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between py-6 text-[10px] text-slate-500">
          <span>P↑</span>
          <span className="rotate-180 [writing-mode:vertical-rl]">5→1</span>
        </div>
        <div className="grid flex-1 grid-cols-5 gap-1">{cells}</div>
      </div>
      <div className="mt-2 flex justify-center gap-4 text-[10px] text-slate-500">
        <span>Impact → 1–5</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <i className="h-3 w-3 rounded bg-emerald-500/85" /> Low (1–7)
        </span>
        <span className="flex items-center gap-1">
          <i className="h-3 w-3 rounded bg-amber-400/90" /> Medium (8–14)
        </span>
        <span className="flex items-center gap-1">
          <i className="h-3 w-3 rounded bg-red-500/85" /> High (15–25)
        </span>
      </div>
    </div>
  );
}
