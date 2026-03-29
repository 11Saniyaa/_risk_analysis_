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
        return r.probability === p && r.impact === i && rs != null;
      });
      cells.push(
        <div
          key={`${p}-${i}`}
          className={`flex min-h-[76px] flex-col items-center justify-center gap-0.5 rounded-lg border border-slate-900/50 p-1.5 text-center text-[10px] font-semibold shadow-inner ${cellBand(
            score
          )}`}
          title={`Probability ${p}, Impact ${i} → score ${score}`}
        >
          <span className="text-[11px] opacity-95">{score}</span>
          <div className="flex max-w-full flex-wrap justify-center gap-0.5">
            {inCell.map((r) => (
              <span
                key={r.id}
                className="truncate rounded bg-black/30 px-1 py-px text-[9px] font-medium text-white"
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
    <section className="app-card p-4 sm:p-5">
      <h2 className="mb-3 text-[15px] font-semibold text-slate-100">P×I matrix</h2>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="flex w-8 shrink-0 flex-col justify-center text-[10px] font-medium text-slate-500 sm:w-10">
          <span className="mb-1">P</span>
          <span
            className="flex-1 rotate-180 text-center [writing-mode:vertical-rl]"
            title="Probability from 5 (top) to 1 (bottom)"
          >
            High → low
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 grid grid-cols-5 gap-1 pl-0 sm:pl-0">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="text-center text-[10px] font-semibold tabular-nums text-slate-500"
              >
                I {n}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1">{cells}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 border-t border-slate-800/80 pt-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/85" /> 1–7
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/90" /> 8–14
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500/85" /> 15–25
        </span>
      </div>
    </section>
  );
}
