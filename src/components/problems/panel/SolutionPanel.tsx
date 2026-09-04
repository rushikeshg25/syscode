"use client";

import { Lock, Sparkles } from "lucide-react";
import { DiagramPreview } from "@/components/canvas/DiagramPreview";
import type { Problem } from "@/content/problems/types";

export function SolutionPanel({
  problem,
  unlocked,
  onLoadOntoCanvas,
}: {
  problem: Problem;
  unlocked: boolean;
  onLoadOntoCanvas: () => void;
}) {
  if (!unlocked) {
    return (
      <div className="flex flex-col items-center px-8 py-14 text-center">
        <span className="grid size-11 place-items-center rounded-xl bg-white/[0.03] text-slate-600">
          <Lock className="size-5" />
        </span>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Reference solution is locked
        </p>
        <p className="mt-1.5 text-xs leading-5 text-slate-600">
          Submit an attempt first. Wrestling with it is most of the value —
          reading the answer first is not.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            One good answer
          </h3>
          <button
            type="button"
            onClick={onLoadOntoCanvas}
            className="text-[10px] font-medium text-sky-300 transition hover:text-sky-200"
          >
            Load onto canvas
          </button>
        </div>
        <DiagramPreview
          diagram={problem.referenceSolution}
          className="h-64 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0e14]"
        />
        <p className="mt-2 text-[10px] leading-4 text-slate-600">
          This is one shape that passes every check, not the only one. Your
          design can differ and still be accepted.
        </p>
      </div>

      <section>
        <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
          <Sparkles className="size-3" />
          Trade-offs
        </h3>
        <ul className="space-y-2.5">
          {problem.tradeoffs.map((tradeoff) => (
            <li
              key={tradeoff}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5 text-[11px] leading-5 text-slate-400"
            >
              {tradeoff}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
