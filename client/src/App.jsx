import { useState, useCallback } from 'react';
import { useRisks } from './context/RiskContext.jsx';
import { downloadCsv } from './utils/exportCsv';
import RiskTable from './components/RiskTable.jsx';
import RiskMatrix from './components/RiskMatrix.jsx';
import MetricsCharts from './components/MetricsCharts.jsx';
import RiskDrawer from './components/RiskDrawer.jsx';
import GeneratedRisksPanel from './components/GeneratedRisksPanel.jsx';
import ProjectScopeBar from './components/ProjectScopeBar.jsx';
import PresentationMode from './components/PresentationMode.jsx';

export default function App() {
  const {
    risksForActiveProject,
    showAllProjects,
    activeProject,
    setActiveProjectByName,
    selectProject,
    projectOptions,
    addRisk,
    addMany,
    updateRisk,
    deleteRisk,
    nextRiskId,
  } = useRisks();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRisk, setEditRisk] = useState(null);
  const [newIdHint, setNewIdHint] = useState('');
  const [present, setPresent] = useState(false);

  const visible = risksForActiveProject;

  const openNew = () => {
    if (showAllProjects) {
      alert(
        'Choose “All projects” only for overview. Apply a project name in the scope bar, then add risks so they stay in one workstream.'
      );
      return;
    }
    setEditRisk(null);
    setNewIdHint(nextRiskId());
    setDrawerOpen(true);
  };

  const openEdit = (r) => {
    setEditRisk(r);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditRisk(null);
  };

  const handleSave = useCallback(
    (payload, id) => {
      if (id) {
        updateRisk(id, payload);
      } else {
        addRisk(payload);
      }
    },
    [addRisk, updateRisk]
  );

  const onDelete = (id) => {
    if (confirm('Delete this risk?')) deleteRisk(id);
  };

  const total = visible.length;
  const high = visible.filter((x) => x.priority === 'High').length;

  return (
    <div className="min-h-screen bg-surface-950">
      <header className="no-print sticky top-0 z-40 border-b border-slate-800/80 bg-surface-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
              Portfolio · Enterprise UI
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
              Risk Command
            </h1>
            <p className="text-xs text-slate-500">
              Per-project register · FMEA RPN · P×I matrix
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hidden text-xs text-slate-500 sm:inline">
              {total} shown · {high} high
            </span>
            <button
              type="button"
              onClick={openNew}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              + Risk
            </button>
            <button
              type="button"
              onClick={() => downloadCsv(visible)}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Print / PDF
            </button>
            <button
              type="button"
              onClick={() => setPresent(true)}
              className="rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-100 hover:bg-amber-900/50"
            >
              Present
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 print:max-w-none print:px-2">
        <div className="no-print space-y-4">
          <ProjectScopeBar
            activeProject={activeProject}
            setActiveProjectByName={setActiveProjectByName}
            selectProject={selectProject}
            projectOptions={projectOptions}
            showAllProjects={showAllProjects}
          />
          <GeneratedRisksPanel
            onAddMany={addMany}
            activeProject={activeProject}
            showAllProjects={showAllProjects}
          />
        </div>

        <div className="no-print space-y-6 print:break-inside-avoid">
          <MetricsCharts risks={visible} />
          <RiskMatrix risks={visible} />
        </div>

        <section className="print-root">
          <h2 className="mb-2 text-lg font-semibold text-slate-200 print:text-black">
            Risk register
          </h2>
          <RiskTable
            risks={visible}
            onEdit={openEdit}
            onDelete={onDelete}
            showProjectColumn={showAllProjects}
          />
        </section>
      </main>

      <RiskDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        initial={editRisk}
        newRiskIdHint={newIdHint}
        onSave={handleSave}
      />

      {present && (
        <PresentationMode risks={visible} onClose={() => setPresent(false)} />
      )}

      <footer className="no-print border-t border-slate-800 py-6 text-center text-xs text-slate-600">
        Data in your browser (localStorage). Quick-fill is scoped to the active
        project — different project names get different risk sets.
      </footer>
    </div>
  );
}
