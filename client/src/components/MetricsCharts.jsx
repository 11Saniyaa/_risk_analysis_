import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`,
      },
    },
  },
};

function InherentRiskBarChart({ risks }) {
  const labels = risks.map((r) => r.riskId || r.id?.slice(0, 8));
  const data = {
    labels,
    datasets: [
      {
        label: 'Matrix score',
        data: risks.map((r) => r.riskScore ?? 0),
        backgroundColor: 'rgba(59, 130, 246, 0.75)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };
  const options = {
    ...chartOpts,
    plugins: {
      ...chartOpts.plugins,
      title: {
        display: true,
        text: 'Inherent risk on the 5×5 matrix',
        color: '#e2e8f0',
        font: { size: 13, weight: '600' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 45 },
        grid: { color: 'rgba(148,163,184,0.08)' },
      },
      y: {
        min: 0,
        max: 25,
        title: {
          display: true,
          text: 'Score = Probability × Impact (max 25)',
          color: '#93c5fd',
        },
        ticks: { color: '#94a3b8', stepSize: 5 },
        grid: { color: 'rgba(148,163,184,0.12)' },
      },
    },
  };

  if (!risks.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-slate-700/80 bg-surface-850 text-sm text-slate-500">
        Add risks to chart matrix scores
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl border border-blue-900/40 bg-slate-900/40 p-3">
      <Bar data={data} options={options} />
    </div>
  );
}

function FmeaRpnBarChart({ risks }) {
  const labels = risks.map((r) => r.riskId || r.id?.slice(0, 8));
  const data = {
    labels,
    datasets: [
      {
        label: 'RPN',
        data: risks.map((r) => r.rpn ?? 0),
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };
  const options = {
    ...chartOpts,
    plugins: {
      ...chartOpts.plugins,
      title: {
        display: true,
        text: 'FMEA priority (failure-mode view)',
        color: '#e2e8f0',
        font: { size: 13, weight: '600' },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 45 },
        grid: { color: 'rgba(148,163,184,0.08)' },
      },
      y: {
        min: 0,
        max: 1000,
        title: {
          display: true,
          text: 'RPN = Severity × Occurrence × Detection (max 1000)',
          color: '#6ee7b7',
        },
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148,163,184,0.12)' },
      },
    },
  };

  if (!risks.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-slate-700/80 bg-surface-850 text-sm text-slate-500">
        Add risks to chart RPN
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl border border-emerald-900/40 bg-slate-900/40 p-3">
      <Bar data={data} options={options} />
    </div>
  );
}

export function MetricsExplainer() {
  return (
    <div className="rounded-xl border border-slate-600/60 bg-slate-900/40 p-4 text-sm leading-relaxed text-slate-300">
      <h3 className="text-base font-semibold text-white">
        Why two numbers?
      </h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-blue-500/25 bg-blue-950/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
            Matrix score (P × I)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Answers: &ldquo;How likely is this, and how bad if it happens?&rdquo; You
            rate <strong>Probability</strong> and <strong>Impact</strong> each from
            1–5. Multiply them → <strong>1 to 25</strong>. This matches the coloured
            5×5 heat map and the priority band (Low / Medium / High).
          </p>
        </div>
        <div className="rounded-lg border border-emerald-500/25 bg-emerald-950/25 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
            RPN (S × O × D)
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Classic <strong>FMEA</strong>: how severe is the failure, how often could
            it occur, how well do we detect it before harm? Each is 1–10. Multiply
            all three → <strong>RPN up to 1000</strong>. Use it to rank which failure
            modes to fix first — it is <strong>not</strong> the same scale as the
            matrix score above.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MetricsCharts({ risks, compact = false }) {
  const charts = (
    <div className="grid gap-6 lg:grid-cols-2">
      <InherentRiskBarChart risks={risks} />
      <FmeaRpnBarChart risks={risks} />
    </div>
  );

  if (compact) {
    return charts;
  }

  return (
    <div className="space-y-4">
      <MetricsExplainer />
      {charts}
    </div>
  );
}
