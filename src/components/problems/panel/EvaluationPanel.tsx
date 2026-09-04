"use client";

import { CircleCheck, CircleX, ClipboardList } from "lucide-react";
import type { Evaluation } from "@/lib/evaluation";

export function EvaluationPanel({
  evaluation,
  checkCount,
}: {
  evaluation: Evaluation | null;
  checkCount: number;
}) {
  if (!evaluation) {
    return (
      <div className="flex flex-col items-center px-8 py-14 text-center">
        <span className="grid size-11 place-items-center rounded-xl bg-white/[0.03] text-slate-600">
          <ClipboardList className="size-5" />
        </span>
        <p className="mt-4 text-xs font-medium text-slate-400">
          Nothing submitted yet
        </p>
        <p className="mt-1.5 text-xs leading-5 text-slate-600">
          Draw your architecture, then submit it to see how it scores against
          this question&rsquo;s {checkCount} checks.
        </p>
      </div>
    );
  }

  const failed = evaluation.results.filter((result) => !result.passed);
  const passed = evaluation.results.filter((result) => result.passed);

  return (
    <div className="space-y-5 p-5">
      <div
        className={`rounded-xl border p-4 ${
          evaluation.accepted
            ? "border-emerald-400/20 bg-emerald-400/[0.06]"
            : "border-amber-400/20 bg-amber-400/[0.05]"
        }`}
      >
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-semibold ${evaluation.accepted ? "text-emerald-300" : "text-amber-300"}`}
          >
            {evaluation.accepted ? "Accepted" : "Not there yet"}
          </p>
          <p className="text-sm font-semibold text-slate-200">
            {evaluation.score}%
          </p>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          {evaluation.passedCount} of {evaluation.totalCount} checks passing
        </p>
      </div>

      {failed.length > 0 && (
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            What is missing
          </h3>
          <ul className="space-y-2">
            {failed.map((result) => (
              <li
                key={result.id}
                className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5"
              >
                <div className="flex items-start gap-2.5">
                  <CircleX className="mt-0.5 size-3.5 shrink-0 text-rose-400" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-300">
                      {result.label}
                      {!result.required && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-600">
                          optional
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {result.feedback}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {passed.length > 0 && (
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            Passing
          </h3>
          <ul className="space-y-1.5">
            {passed.map((result) => (
              <li key={result.id} className="flex items-start gap-2.5">
                <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                <p className="text-xs leading-5 text-slate-400">
                  {result.label}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
