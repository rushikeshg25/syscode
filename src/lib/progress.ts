import type { DiagramSnapshot } from "./diagram-document";
import {
  parseDiagramDocument,
  serializeDiagramDocument,
} from "./diagram-document";

export const PROGRESS_STORAGE_KEY = "syscode-progress-v1";

export type ProblemStatus = "unsolved" | "attempted" | "solved";

export type ProblemProgress = {
  status: ProblemStatus;
  attempts: number;
  /** Best score achieved, 0-100. */
  bestScore: number;
  /** ISO timestamp of the first accepted submission. */
  solvedAt?: string;
  /** How many hints the learner has chosen to reveal. */
  revealedHints: number;
  /** The submitted design, restored when they come back to the question. */
  savedDiagram?: DiagramSnapshot;
};

export type ProgressMap = Record<string, ProblemProgress>;

export const emptyProgress: ProblemProgress = {
  status: "unsolved",
  attempts: 0,
  bestScore: 0,
  revealedHints: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const clampCount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.min(Math.floor(value), 10_000)
    : 0;

const normalizeEntry = (value: unknown): ProblemProgress | null => {
  if (!isRecord(value)) return null;

  const status =
    value.status === "solved" || value.status === "attempted"
      ? value.status
      : "unsolved";

  // The saved diagram goes through the same validation as any other stored
  // document, so a corrupt or hand-edited entry cannot reach the canvas.
  let savedDiagram: DiagramSnapshot | undefined;
  if (typeof value.savedDiagram === "string") {
    const parsed = parseDiagramDocument(value.savedDiagram);
    if (parsed) savedDiagram = { nodes: parsed.nodes, edges: parsed.edges };
  }

  return {
    status,
    attempts: clampCount(value.attempts),
    bestScore: Math.min(clampCount(value.bestScore), 100),
    revealedHints: clampCount(value.revealedHints),
    ...(typeof value.solvedAt === "string" ? { solvedAt: value.solvedAt } : {}),
    ...(savedDiagram ? { savedDiagram } : {}),
  };
};

export const parseProgress = (raw: string): ProgressMap => {
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return {};

    const entries: ProgressMap = {};
    for (const [slug, entry] of Object.entries(value)) {
      const normalized = normalizeEntry(entry);
      if (normalized) entries[slug] = normalized;
    }
    return entries;
  } catch {
    return {};
  }
};

export const readProgress = (): ProgressMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    return raw ? parseProgress(raw) : {};
  } catch {
    return {};
  }
};

export const writeProgress = (progress: ProgressMap) => {
  if (typeof window === "undefined") return false;
  try {
    // Diagrams are serialized through the document format so that reading them
    // back reuses parseDiagramDocument's validation.
    const serializable = Object.fromEntries(
      Object.entries(progress).map(([slug, entry]) => [
        slug,
        {
          ...entry,
          savedDiagram: entry.savedDiagram
            ? serializeDiagramDocument({ name: slug, ...entry.savedDiagram })
            : undefined,
        },
      ]),
    );
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify(serializable),
    );
    return true;
  } catch {
    return false;
  }
};

export const getProblemProgress = (
  progress: ProgressMap,
  slug: string,
): ProblemProgress => progress[slug] ?? emptyProgress;

/** Folds a submission into a question's progress entry. */
export const recordAttempt = (
  current: ProblemProgress,
  {
    accepted,
    score,
    diagram,
  }: { accepted: boolean; score: number; diagram: DiagramSnapshot },
): ProblemProgress => ({
  ...current,
  status: accepted
    ? "solved"
    : current.status === "solved"
      ? "solved"
      : "attempted",
  attempts: current.attempts + 1,
  bestScore: Math.max(current.bestScore, score),
  solvedAt:
    accepted && !current.solvedAt ? new Date().toISOString() : current.solvedAt,
  savedDiagram: diagram,
});

export const summarizeProgress = (progress: ProgressMap, slugs: string[]) => {
  let solved = 0;
  let attempted = 0;
  for (const slug of slugs) {
    const status = progress[slug]?.status;
    if (status === "solved") solved++;
    else if (status === "attempted") attempted++;
  }
  return { solved, attempted, total: slugs.length };
};
