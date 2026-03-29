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
      <div className="flex h-56 items-center justify-center rounded-xl border border-slate-700/60 bg-surface-900/50 text-[13px] text-slate-500">
        Add risks to see P×I scores
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl border border-sky-900/35 bg-surface-900/40 p-4 shadow-inner">
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
      <div className="flex h-56 items-center justify-center rounded-xl border border-slate-700/60 bg-surface-900/50 text-[13px] text-slate-500">
        Add risks to see RPN values
      </div>
    );
  }

  return (
    <div className="h-64 rounded-xl border border-emerald-900/35 bg-surface-900/40 p-4 shadow-inner">
      <Bar data={data} options={options} />
    </div>
  );
}

export function MetricsExplainer() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-slate-800/80 pb-4 text-[12px] text-slate-500">
      <span>
        <span className="font-medium text-sky-400/90">P×I</span> matrix · 1–25
      </span>
      <span className="hidden sm:inline text-slate-700">|</span>
      <span>
        <span className="font-medium text-emerald-400/90">RPN</span> FMEA · ≤1000
      </span>
    </div>
  );
}

export default function MetricsCharts({ risks, compact = false }) {
  const charts = (
    <div className="grid gap-4 lg:grid-cols-2">
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

