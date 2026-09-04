"use client";

import { Lightbulb, Lock } from "lucide-react";

export function HintList({
  hints,
  revealed,
  onReveal,
}: {
  hints: string[];
  revealed: number;
  onReveal: () => void;
}) {
  return (
    <div className="space-y-2.5 p-5">
      <p className="text-xs leading-5 text-slate-500">
        Hints are ordered. Each one gives away a little more, so take only what
        you need.
      </p>

      {hints.map((hint, index) =>
        index < revealed ? (
          <div
            key={hint}
            className="flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] p-3.5"
          >
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
            <p className="text-xs leading-5 text-slate-300">{hint}</p>
          </div>
        ) : (
          <div
            key={hint}
            className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
          >
            <Lock className="size-3.5 shrink-0 text-slate-700" />
            <p className="text-xs text-slate-600">Hint {index + 1}</p>
          </div>
        ),
      )}

      {revealed < hints.length && (
        <button
          type="button"
          onClick={onReveal}
          className="w-full rounded-xl border border-white/10 py-2.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          Reveal hint {revealed + 1} of {hints.length}
        </button>
      )}
    </div>
  );
}
