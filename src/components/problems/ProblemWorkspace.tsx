"use client";

import { ReactFlowProvider } from "@xyflow/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";
import { ComponentPalette } from "@/components/canvas/ComponentPalette";
import { NodeInspector } from "@/components/canvas/NodeInspector";
import { SystemCanvas } from "@/components/canvas/SystemCanvas";
import type { Problem } from "@/content/problems/types";
import { useDiagram } from "@/hooks/use-diagram";
import { useProgress } from "@/hooks/use-progress";
import { problemStorageKey } from "@/lib/diagram-document";
import { evaluate, type Evaluation } from "@/lib/evaluation";
import { DifficultyBadge } from "./DifficultyBadge";
import { ProblemPanel, type PanelTab } from "./panel/ProblemPanel";

export type WorkspaceNeighbour = { slug: string; title: string } | null;

function Workspace({
  problem,
  previous,
  next,
}: {
  problem: Problem;
  previous: WorkspaceNeighbour;
  next: WorkspaceNeighbour;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [tab, setTab] = useState<PanelTab>("brief");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [restored, setRestored] = useState(false);

  const progress = useProgress();
  const entry = progress.forProblem(problem.slug);

  const diagram = useDiagram({
    storageKey: problemStorageKey(problem.slug),
    initialDiagram: { nodes: [], edges: [] },
    initialName: problem.title,
    canvasRef,
  });

  // A submitted design is restored only when there is no working draft, so an
  // in-progress attempt is never overwritten by an older submission.
  useEffect(() => {
    if (restored || !progress.loaded || !diagram.hydrated) return;
    setRestored(true);
    if (!diagram.nodes.length && entry.savedDiagram?.nodes.length) {
      diagram.replaceDiagram(entry.savedDiagram, problem.title);
    }
  }, [diagram, entry.savedDiagram, problem.title, progress.loaded, restored]);

  const selectedNode =
    diagram.selection.nodes.length === 1
      ? diagram.nodes.find((node) => node.id === diagram.selection.nodes[0].id)
      : undefined;

  const submit = useCallback(() => {
    const snapshot = { nodes: diagram.nodes, edges: diagram.edges };
    const result = evaluate(problem.rubric, snapshot);
    setEvaluation(result);
    setTab("result");
    setPanelOpen(true);
    progress.submit(problem.slug, {
      accepted: result.accepted,
      score: result.score,
      diagram: snapshot,
    });
  }, [diagram.edges, diagram.nodes, problem.rubric, problem.slug, progress]);

  const loadSolution = useCallback(() => {
    diagram.replaceDiagram(problem.referenceSolution, problem.title);
  }, [diagram, problem.referenceSolution, problem.title]);

  const canSubmit = diagram.nodes.length > 0;

  return (
    <main className="flex h-[100dvh] min-h-[580px] flex-col overflow-hidden bg-[#080b10] text-white">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#0b0f15] px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/problems"
            aria-label="Back to questions"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-slate-100">
                {problem.title}
              </h1>
              <DifficultyBadge difficulty={problem.difficulty} />
              {entry.status === "solved" && (
                <span className="hidden items-center gap-1 text-[10px] font-medium text-emerald-400 sm:flex">
                  <CircleCheck className="size-3" />
                  solved
                </span>
              )}
            </div>
            <p className="mt-0.5 hidden text-[10px] text-slate-600 sm:block">
              {diagram.saveStatus === "saved"
                ? "Draft saved locally"
                : "Could not save draft"}
              {entry.attempts > 0 &&
                ` · ${entry.attempts} attempt${entry.attempts === 1 ? "" : "s"} · best ${entry.bestScore}%`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <CanvasToolbar diagram={diagram} showImportExport={false} />
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="flex h-9 items-center gap-2 rounded-lg bg-sky-400 px-3.5 text-xs font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlayCircle className="size-3.5" />
            Submit
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className={`${panelOpen ? "flex" : "hidden"} z-10 h-72 shrink-0 flex-col border-b border-white/10 bg-[#0b0f15] lg:h-full lg:w-[380px] lg:border-b-0 lg:border-r`}
        >
          <ProblemPanel
            problem={problem}
            evaluation={evaluation}
            revealedHints={entry.revealedHints}
            onRevealHint={() =>
              progress.revealHint(problem.slug, problem.hints.length)
            }
            attempts={entry.attempts}
            onLoadSolution={loadSolution}
            activeTab={tab}
            onTabChange={setTab}
          />
          <nav className="flex shrink-0 items-center justify-between gap-2 border-t border-white/[0.07] p-3">
            <NeighbourLink neighbour={previous} direction="previous" />
            <NeighbourLink neighbour={next} direction="next" />
          </nav>
        </aside>

        <SystemCanvas diagram={diagram} canvasRef={canvasRef}>
          <button
            type="button"
            onClick={() => setPanelOpen((open) => !open)}
            aria-label={panelOpen ? "Hide question" : "Show question"}
            title={panelOpen ? "Hide question" : "Show question"}
            className="absolute left-3 top-3 z-10 hidden size-9 place-items-center rounded-lg border border-white/10 bg-[#111722] text-slate-400 shadow-lg transition hover:text-white lg:grid"
          >
            {panelOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
          {!diagram.nodes.length && (
            <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center p-6">
              <div className="max-w-xs rounded-2xl border border-white/10 bg-[#0d131c]/95 p-6 text-center shadow-2xl backdrop-blur">
                <h2 className="text-sm font-semibold text-slate-100">
                  Draw your answer
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Drag components from the library on the right, connect them
                  with their side handles, then submit.
                </p>
              </div>
            </div>
          )}
        </SystemCanvas>

        <aside className="z-10 flex h-56 shrink-0 flex-col border-t border-white/10 bg-[#0b0f15] lg:h-full lg:w-60 lg:border-l lg:border-t-0">
          <ComponentPalette
            onAdd={diagram.addComponent}
            onClear={diagram.clear}
            clearDisabled={!diagram.nodes.length && !diagram.edges.length}
          />
          {selectedNode && (
            <NodeInspector node={selectedNode} onUpdate={diagram.updateNode} />
          )}
        </aside>
      </div>
    </main>
  );
}

function NeighbourLink({
  neighbour,
  direction,
}: {
  neighbour: WorkspaceNeighbour;
  direction: "previous" | "next";
}) {
  if (!neighbour) return <span className="flex-1" />;
  const isNext = direction === "next";
  return (
    <Link
      href={`/problems/${neighbour.slug}`}
      className={`flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-slate-500 transition hover:bg-white/5 hover:text-white ${isNext ? "justify-end text-right" : ""}`}
    >
      {!isNext && <ChevronLeft className="size-3.5 shrink-0" />}
      <span className="truncate">{neighbour.title}</span>
      {isNext && <ChevronRight className="size-3.5 shrink-0" />}
    </Link>
  );
}

export function ProblemWorkspace(props: {
  problem: Problem;
  previous: WorkspaceNeighbour;
  next: WorkspaceNeighbour;
}) {
  return (
    <ReactFlowProvider>
      <Workspace {...props} />
    </ReactFlowProvider>
  );
}
