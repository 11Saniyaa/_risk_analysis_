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
      setMsg(
        'Set and apply an active project name first (not “All projects”). Then generate — risks stay under that project only.'
      );
      return;
    }
    const list = generateRisksFromContext(ctx, {
      projectKey: activeProject.key,
      projectName: activeProject.name,
      projectCode: activeProject.code,
    });
    onAddMany(list);
    setMsg(
      `Added up to 5 drafts for «${activeProject.name}». Duplicate descriptions in this project were skipped.`
    );
  };

  return (
    <div className="rounded-xl border border-slate-600/80 bg-surface-850 p-4 shadow-card">
      <h3 className="text-sm font-semibold text-white">
        Quick-fill for this project only
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        Describe what is unique about <strong className="text-slate-300">this</strong>{' '}
        project (go-live, site, constraints). The generator hashes{' '}
        <strong>project + your text</strong>, so another project with different text
        gets a different set — nothing is shared with other workstreams.
      </p>
      <textarea
        value={ctx}
        onChange={(e) => setCtx(e.target.value)}
        rows={3}
        placeholder="Detail for this project only: e.g. cutover weekend, single data centre, regulator deadline…"
        className="mt-2 w-full rounded-lg border border-slate-600 bg-surface-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600"
      />
      <button
        type="button"
        onClick={run}
        className="mt-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
      >
        Generate 5 risks (this project)
      </button>
      {msg && (
        <p className="mt-2 text-xs text-slate-400" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
