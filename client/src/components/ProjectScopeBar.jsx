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
    <section className="app-card p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="min-w-0 flex-1 sm:min-w-[240px]">
          <span className="app-label">Project</span>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyName()}
            placeholder="Project name"
            className="app-input"
          />
        </label>
        <button
          type="button"
          onClick={applyName}
          className="btn-primary w-full shrink-0 sm:w-auto"
        >
          Apply
        </button>
        <label className="w-full sm:w-auto sm:min-w-[200px]">
          <span className="app-label">View</span>
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
            className="app-select"
          >
            <option value="__all__">All projects</option>
            {projectOptions.map((o) => (
              <option key={o.key} value={o.key}>
                {o.name} ({o.code})
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 border-t border-slate-800/80 pt-3 text-[12px] text-slate-500">
        {showAllProjects ? (
          <>All projects · combined view</>
        ) : (
          <>
            <span className="text-slate-400">{activeProject.name}</span>
            <span className="text-slate-600"> · </span>
            <span className="font-mono text-[11px] text-slate-500">
              {activeProject.code}-
            </span>
          </>
        )}
      </p>
    </section>
  );
}
