import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  computeRiskScore,
  computeRPN,
  priorityFromRiskScore,
} from '../utils/riskMath';
import { loadRisks, saveRisks } from '../utils/storage';
import {
  slugify,
  projectCodeFromName,
  loadActiveProject,
  saveActiveProject,
  nextRiskIdForProject,
  normalizeDescriptionKey,
} from '../utils/projectMeta';

function normalizeRisk(input) {
  const rs = computeRiskScore(input.probability, input.impact);
  const rpn = computeRPN(input.severity, input.occurrence, input.detection);
  return {
    ...input,
    riskScore: rs,
    rpn,
    priority: priorityFromRiskScore(rs),
  };
}

function migrateRisk(r) {
  const base = {
    ...r,
    id: r.id || crypto.randomUUID(),
  };
  if (!r.projectKey) {
    base.projectKey = 'legacy';
    base.projectName = 'Imported / other';
    base.projectCode = 'LEG';
  }
  if (!base.projectName) base.projectName = base.projectKey;
  if (!base.projectCode) base.projectCode = 'PRJ';
  return normalizeRisk(base);
}

const RiskContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const r = normalizeRisk(action.risk);
      return { risks: [...state.risks, r] };
    }
    case 'ADD_MANY': {
      const pk = action.projectKey || 'default';
      const existingKeys = new Set(
        state.risks
          .filter((r) => (r.projectKey || 'legacy') === pk)
          .map((r) => normalizeDescriptionKey(r.description))
      );
      const incoming = action.risks
        .map((x) => normalizeRisk(x))
        .filter((r) => {
          const k = normalizeDescriptionKey(r.description);
          if (!k || existingKeys.has(k)) return false;
          existingKeys.add(k);
          return true;
        });
      if (!incoming.length) return state;
      return { risks: [...state.risks, ...incoming] };
    }
    case 'UPDATE': {
      const risks = state.risks.map((r) =>
        r.id === action.id ? normalizeRisk({ ...r, ...action.patch }) : r
      );
      return { risks };
    }
    case 'DELETE': {
      return {
        risks: state.risks.filter((r) => r.id !== action.id),
      };
    }
    case 'REPLACE_ALL': {
      return { risks: action.risks.map((x) => normalizeRisk(migrateRisk(x))) };
    }
    default:
      return state;
  }
}

function initialState() {
  const raw = loadRisks();
  if (!raw.length) return { risks: [] };
  return {
    risks: raw.map(migrateRisk),
  };
}

export function RiskProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const [activeProject, setActiveProjectState] = useState(loadActiveProject);
  const saveFirst = useRef(true);

  useEffect(() => {
    saveActiveProject(activeProject);
  }, [activeProject]);

  useEffect(() => {
    if (saveFirst.current) {
      saveFirst.current = false;
      return;
    }
    saveRisks(state.risks);
  }, [state.risks]);

  const setActiveProjectByName = (name) => {
    const n = String(name).trim();
    if (!n) {
      setActiveProjectState({ name: '', key: '', code: '' });
      return;
    }
    setActiveProjectState({
      name: n,
      key: slugify(n),
      code: projectCodeFromName(n),
    });
  };

  const value = useMemo(() => {
    const ap = activeProject;
    const focused = String(ap.name || '').trim().length > 0;
    const pk = focused ? ap.key || slugify(ap.name) : 'default';

    const addRisk = (partial) => {
      const id = crypto.randomUUID();
      const riskId =
        partial.riskId ||
        nextRiskIdForProject(state.risks, pk, ap.code || 'DEF');
      const createdAt = new Date().toISOString();
      dispatch({
        type: 'ADD',
        risk: {
          id,
          riskId,
          description: partial.description || '',
          category: partial.category || 'Operational',
          owner: partial.owner || '',
          cause: partial.cause || '',
          impactDescription: partial.impactDescription || '',
          probability: partial.probability ?? null,
          impact: partial.impact ?? null,
          severity: partial.severity ?? null,
          occurrence: partial.occurrence ?? null,
          detection: partial.detection ?? null,
          mitigation: partial.mitigation || '',
          treatment: partial.treatment || 'Unassigned',
          status: partial.status || 'Open',
          projectKey: partial.projectKey || pk,
          projectName: partial.projectName || ap.name || 'Unnamed project',
          projectCode: partial.projectCode || ap.code || 'DEF',
          createdAt,
        },
      });
    };

    const addMany = (list) => {
      let temp = [...state.risks];
      const batchProjectKey = list[0]?.projectKey || pk;
      const batchCode = list[0]?.projectCode || ap.code || 'DEF';
      const batchName = list[0]?.projectName || ap.name || 'Unnamed project';

      const withIds = list.map((partial) => {
        const id = crypto.randomUUID();
        const riskId =
          partial.riskId ||
          nextRiskIdForProject(temp, batchProjectKey, batchCode);
        const row = {
          id,
          riskId,
          description: partial.description || '',
          category: partial.category || 'Operational',
          owner: partial.owner || '',
          cause: partial.cause || '',
          impactDescription: partial.impactDescription || '',
          probability: partial.probability ?? null,
          impact: partial.impact ?? null,
          severity: partial.severity ?? null,
          occurrence: partial.occurrence ?? null,
          detection: partial.detection ?? null,
          mitigation: partial.mitigation || '',
          treatment: partial.treatment || 'Unassigned',
          status: partial.status || 'Open',
          projectKey: partial.projectKey || batchProjectKey,
          projectName: partial.projectName || batchName,
          projectCode: partial.projectCode || batchCode,
          createdAt: new Date().toISOString(),
        };
        temp = [...temp, row];
        return row;
      });

      dispatch({
        type: 'ADD_MANY',
        risks: withIds,
        projectKey: batchProjectKey,
      });
    };

    const updateRisk = (id, patch) =>
      dispatch({ type: 'UPDATE', id, patch });

    const deleteRisk = (id) => dispatch({ type: 'DELETE', id });

    const replaceAll = (risks) =>
      dispatch({ type: 'REPLACE_ALL', risks });

    const projectOptions = (() => {
      const m = new Map();
      state.risks.forEach((r) => {
        const key = r.projectKey || 'legacy';
        if (!m.has(key)) {
          m.set(key, {
            key,
            name: r.projectName || key,
            code: r.projectCode || '—',
          });
        }
      });
      return Array.from(m.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    })();

    const showAllProjects = !focused;
    const risksForActiveProject = showAllProjects
      ? state.risks
      : state.risks.filter(
          (r) => (r.projectKey || 'legacy') === pk
        );

    const selectProject = (projectKey) => {
      if (projectKey === 'legacy') {
        setActiveProjectState({
          key: 'legacy',
          name: 'Imported / other',
          code: 'LEG',
        });
        return;
      }
      const hit = state.risks.find(
        (r) => (r.projectKey || 'legacy') === projectKey
      );
      if (hit) {
        setActiveProjectState({
          key: projectKey,
          name: hit.projectName || projectKey,
          code: hit.projectCode || 'PRJ',
        });
      }
    };

    return {
      risks: state.risks,
      risksForActiveProject,
      showAllProjects,
      activeProject: ap,
      setActiveProjectByName,
      selectProject,
      projectOptions,
      addRisk,
      addMany,
      updateRisk,
      deleteRisk,
      replaceAll,
      nextRiskId: () =>
        nextRiskIdForProject(
          state.risks,
          focused ? pk : 'default',
          focused ? ap.code || 'DEF' : 'DEF'
        ),
    };
  }, [state.risks, activeProject]);

  return (
    <RiskContext.Provider value={value}>{children}</RiskContext.Provider>
  );
}

export function useRisks() {
  const ctx = useContext(RiskContext);
  if (!ctx) throw new Error('useRisks must be used within RiskProvider');
  return ctx;
}
