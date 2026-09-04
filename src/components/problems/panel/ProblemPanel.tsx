"use client";

import type { Problem } from "@/content/problems/types";
import type { Evaluation } from "@/lib/evaluation";
import { EvaluationPanel } from "./EvaluationPanel";
import { HintList } from "./HintList";
import { ProblemBrief } from "./ProblemBrief";
import { SolutionPanel } from "./SolutionPanel";

const tabs = ["brief", "hints", "result", "solution"] as const;
export type PanelTab = (typeof tabs)[number];

const tabLabels: Record<PanelTab, string> = {
  brief: "Brief",
  hints: "Hints",
  result: "Result",
  solution: "Solution",
};

export function ProblemPanel({
  problem,
  evaluation,
  revealedHints,
  onRevealHint,
  attempts,
  onLoadSolution,
  activeTab,
  onTabChange,
}: {
  problem: Problem;
  evaluation: Evaluation | null;
  revealedHints: number;
  onRevealHint: () => void;
  attempts: number;
  onLoadSolution: () => void;
  activeTab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="tablist"
        aria-label="Question detail"
        className="flex shrink-0 gap-1 border-b border-white/[0.07] px-3 pt-3"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`relative rounded-t-lg px-3 py-2 text-xs font-medium transition ${
              activeTab === tab
                ? "bg-white/[0.04] text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tabLabels[tab]}
            {tab === "hints" && revealedHints > 0 && (
              <span className="ml-1.5 text-[10px] text-amber-400/80">
                {revealedHints}
              </span>
            )}
            {tab === "result" && evaluation && (
              <span
                className={`ml-1.5 text-[10px] ${evaluation.accepted ? "text-emerald-400/80" : "text-amber-400/80"}`}
              >
                {evaluation.score}%
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "brief" && <ProblemBrief problem={problem} />}
        {activeTab === "hints" && (
          <HintList
            hints={problem.hints}
            revealed={revealedHints}
            onReveal={onRevealHint}
          />
        )}
        {activeTab === "result" && (
          <EvaluationPanel
            evaluation={evaluation}
            checkCount={problem.rubric.length}
          />
        )}
        {activeTab === "solution" && (
          <SolutionPanel
            problem={problem}
            unlocked={attempts > 0}
            onLoadOntoCanvas={onLoadSolution}
          />
        )}
      </div>
    </div>
  );
}
