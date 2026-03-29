import { useState } from 'react';
import { generateRisksFromContext } from '../utils/generateRisksFromContext';

export default function GeneratedRisksPanel({
  onAddMany,
  activeProject,
  showAllProjects,
}) {
  const [ctx, setCtx] = useState('');
  const [msg, setMsg] = useState(null);

  const run = () => {
    setMsg(null);
    if (showAllProjects || !String(activeProject.name || '').trim()) {
      setMsg('Apply a project name first.');
      return;
    }
    const list = generateRisksFromContext(ctx, {
      projectKey: activeProject.key,
      projectName: activeProject.name,
      projectCode: activeProject.code,
    });
    onAddMany(list);
    setMsg(`Added drafts · ${activeProject.name} (duplicates skipped)`);
  };

  return (
    <section className="app-card p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-100">Quick-fill</h2>
        <button type="button" onClick={run} className="btn-secondary text-[13px]">
          Generate 5
        </button>
      </div>
      <label className="block">
        <span className="app-label">Context (optional)</span>
        <textarea
          value={ctx}
          onChange={(e) => setCtx(e.target.value)}
          rows={2}
          placeholder="Scope, constraints, domain keywords…"
          className="app-input min-h-[72px] resize-y"
        />
      </label>
      {msg && (
        <p className="mt-2 text-[12px] text-slate-500" role="status">
          {msg}
        </p>
      )}
    </section>
  );
}
