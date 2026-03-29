import { useState, useEffect } from 'react';

export default function ProjectScopeBar({
  activeProject,
  setActiveProjectByName,
  selectProject,
  projectOptions,
  showAllProjects,
}) {
  const [nameInput, setNameInput] = useState(activeProject.name || '');

  useEffect(() => {
    setNameInput(activeProject.name || '');
  }, [activeProject.name, activeProject.key]);

  const applyName = () => {
    setActiveProjectByName(nameInput);
  };

  return (
    <div className="rounded-xl border border-slate-600/70 bg-surface-900/80 p-4 shadow-card">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1 text-xs text-slate-400">
          Active project name
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyName()}
            placeholder="e.g. Hospital ERP rollout, Wind farm Phase 2…"
            className="mt-1 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />
        </label>
        <button
          type="button"
          onClick={applyName}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
        >
          Apply
        </button>
        <label className="text-xs text-slate-400">
          Switch project
          <select
            value={showAllProjects ? '__all__' : activeProject.key || '__all__'}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '__all__') {
                setActiveProjectByName('');
                return;
              }
              selectProject(v);
            }}
            className="mt-1 block w-full min-w-[180px] rounded-lg border border-slate-600 bg-surface-950 px-2 py-2 text-sm text-slate-100"
          >
            <option value="__all__">— All projects (overview) —</option>
            {projectOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.name} ({o.code})
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {showAllProjects ? (
          <>
            <strong className="text-slate-400">Overview</strong> — showing every
            risk across projects. Choose a project above or pick an existing one
            from the list to focus the register, charts, and exports only on that
            workstream.
          </>
        ) : (
          <>
            <strong className="text-slate-400">Focused</strong> — register and
            charts show only <strong className="text-slate-300">{activeProject.name}</strong>{' '}
            (IDs prefixed {activeProject.code}-). Quick-fill uses this project + your
            detail text so batches do not mix with other projects.
          </>
        )}
      </p>
    </div>
  );
}
