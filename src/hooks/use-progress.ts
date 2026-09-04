"use client";

import { useCallback, useEffect, useState } from "react";
import type { DiagramSnapshot } from "@/lib/diagram-document";
import {
  emptyProgress,
  getProblemProgress,
  PROGRESS_STORAGE_KEY,
  parseProgress,
  readProgress,
  recordAttempt,
  writeProgress,
  type ProblemProgress,
  type ProgressMap,
} from "@/lib/progress";

/**
 * Progress lives entirely in localStorage. Reading happens after mount so the
 * server-rendered markup and the first client render agree.
 */
export const useProgress = () => {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(readProgress());
    setLoaded(true);
  }, []);

  // Keep other tabs in step.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PROGRESS_STORAGE_KEY) return;
      setProgress(event.newValue ? parseProgress(event.newValue) : {});
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback(
    (slug: string, next: (current: ProblemProgress) => ProblemProgress) => {
      setProgress((current) => {
        const updated = {
          ...current,
          [slug]: next(current[slug] ?? emptyProgress),
        };
        writeProgress(updated);
        return updated;
      });
    },
    [],
  );

  const submit = useCallback(
    (
      slug: string,
      result: { accepted: boolean; score: number; diagram: DiagramSnapshot },
    ) => update(slug, (current) => recordAttempt(current, result)),
    [update],
  );

  const revealHint = useCallback(
    (slug: string, total: number) =>
      update(slug, (current) => ({
        ...current,
        revealedHints: Math.min(current.revealedHints + 1, total),
      })),
    [update],
  );

  const resetProblem = useCallback(
    (slug: string) => update(slug, () => emptyProgress),
    [update],
  );

  return {
    progress,
    loaded,
    forProblem: (slug: string) => getProblemProgress(progress, slug),
    submit,
    revealHint,
    resetProblem,
  };
};
