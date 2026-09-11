/**
 * Visited ticks and checklist state, persisted locally.
 * Nothing leaves the phone. localStorage can throw in private mode, so every
 * access is guarded — a storage failure must never blank the itinerary.
 */
import { useCallback, useEffect, useState } from 'react';

const KEY = 'gt-progress-v1';

type Progress = { visited: string[]; checked: string[] };

function read(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { visited: [], checked: [] };
    const p = JSON.parse(raw);
    return { visited: p.visited ?? [], checked: p.checked ?? [] };
  } catch {
    return { visited: [], checked: [] };
  }
}

export function useTripProgress() {
  const [progress, setProgress] = useState<Progress>(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch { /* private mode */ }
  }, [progress]);

  const toggleVisited = useCallback((id: string) => {
    setProgress(p => ({
      ...p,
      visited: p.visited.includes(id) ? p.visited.filter(x => x !== id) : [...p.visited, id],
    }));
  }, []);

  const toggleChecked = useCallback((key: string) => {
    setProgress(p => ({
      ...p,
      checked: p.checked.includes(key) ? p.checked.filter(x => x !== key) : [...p.checked, key],
    }));
  }, []);

  return {
    visited: new Set(progress.visited),
    checked: new Set(progress.checked),
    toggleVisited,
    toggleChecked,
  };
}
