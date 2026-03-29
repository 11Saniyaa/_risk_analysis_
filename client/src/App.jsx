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
      alert('Select a project in Scope before adding a risk.');
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
      <header className="no-print sticky top-0 z-40 border-b border-slate-800/80 bg-surface-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Risk register
            </h1>
            <span className="hidden text-[13px] tabular-nums text-slate-500 sm:inline">
              {total} risks · {high} high
            </span>
          </div>
          <div className="flex flex-shrink-0 flex-col items-stretch gap-2.5 sm:items-end">
            <span className="text-[13px] tabular-nums text-slate-500 sm:hidden">
              {total} · {high} high
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={openNew} className="btn-primary">
                Add risk
              </button>
              <button
                type="button"
                onClick={() => downloadCsv(visible)}
                className="btn-secondary"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-secondary"
              >
                Print / PDF
              </button>
              <button
                type="button"
                onClick={() => setPresent(true)}
                className="btn-accent"
              >
                Present
              </button>
            </div>
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

        <div className="no-print space-y-5 print:break-inside-avoid">
          <MetricsCharts risks={visible} />
          <RiskMatrix risks={visible} />
        </div>

        <section className="print-root">
          <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-slate-200">
            Register
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

      <footer className="no-print border-t border-slate-800/60 py-5">
        <p className="mx-auto max-w-[1600px] px-4 text-center text-[11px] text-slate-600">
          Data saved in this browser only.
        </p>
      </footer>
    </div>
  );
}
