"use client";

import { Boxes, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Difficulty } from "@/content/problems/types";
import { useProgress } from "@/hooks/use-progress";
import { summarizeProgress, type ProblemStatus } from "@/lib/progress";
import { ProblemCard, type ProblemSummary } from "./ProblemCard";

const difficulties: (Difficulty | "all")[] = ["all", "easy", "medium", "hard"];
const statuses: (ProblemStatus | "all")[] = [
  "all",
  "unsolved",
  "attempted",
  "solved",
];

const chip = (active: boolean) =>
  `rounded-lg border px-2.5 py-1 text-[11px] font-medium capitalize transition ${
    active
      ? "border-sky-400/40 bg-sky-400/10 text-sky-200"
      : "border-white/[0.07] text-slate-500 hover:border-white/15 hover:text-slate-300"
  }`;

export function ProblemBrowser({
  problems,
  tags,
}: {
  problems: ProblemSummary[];
  tags: string[];
}) {
  const { progress, loaded, forProblem } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<ProblemStatus | "all">("all");
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const summary = useMemo(
    () =>
      summarizeProgress(
        progress,
        problems.map((problem) => problem.slug),
      ),
    [problems, progress],
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return problems.filter((problem) => {
      if (difficulty !== "all" && problem.difficulty !== difficulty)
        return false;
      if (tag && !problem.tags.includes(tag)) return false;
      if (status !== "all" && forProblem(problem.slug).status !== status)
        return false;
      if (
        term &&
        !problem.title.toLowerCase().includes(term) &&
        !problem.summary.toLowerCase().includes(term) &&
        !problem.tags.some((entry) => entry.includes(term))
      ) {
        return false;
      }
      return true;
    });
  }, [difficulty, forProblem, problems, query, status, tag]);

  const filtered =
    difficulty !== "all" || status !== "all" || tag !== null || query !== "";

  return (
    <main className="min-h-screen bg-[#070a0f] text-white">
      <header className="border-b border-white/10 bg-[#0b0f15]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-sky-400 text-slate-950">
              <Boxes className="size-4" strokeWidth={2.4} />
            </span>
            <span className="text-base font-semibold tracking-tight">
              SysCode
            </span>
          </Link>
          <Link
            href="/home"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Open sandbox
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Questions
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Read the brief, draw the architecture on the canvas, and get it
              checked against a rubric that explains what is missing.
            </p>
          </div>
          <div
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-right"
            aria-live="polite"
          >
            <p className="text-lg font-semibold text-slate-100">
              {loaded ? summary.solved : "—"}
              <span className="text-sm font-normal text-slate-600">
                {" "}
                / {summary.total}
              </span>
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-600">
              solved
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-600" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions"
              aria-label="Search questions"
              className="w-full rounded-xl border border-white/[0.07] bg-white/[0.02] py-2.5 pl-10 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus-visible:border-sky-400/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {difficulties.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setDifficulty(entry)}
                className={chip(difficulty === entry)}
              >
                {entry === "all" ? "All levels" : entry}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-white/10" />
            {statuses.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setStatus(entry)}
                className={chip(status === entry)}
              >
                {entry === "all" ? "Any status" : entry}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((entry) => (
              <button
                key={entry}
                type="button"
                onClick={() => setTag(tag === entry ? null : entry)}
                className={chip(tag === entry)}
              >
                {entry}
              </button>
            ))}
            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setDifficulty("all");
                  setStatus("all");
                  setTag(null);
                  setQuery("");
                }}
                className="ml-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-slate-500 transition hover:text-white"
              >
                <X className="size-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-2.5">
          {visible.map((problem) => {
            const entry = forProblem(problem.slug);
            return (
              <ProblemCard
                key={problem.slug}
                problem={problem}
                status={entry.status}
                bestScore={entry.bestScore}
              />
            );
          })}
          {!visible.length && (
            <p className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center text-sm text-slate-600">
              No question matches those filters.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
