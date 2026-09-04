import { CircleCheck, Circle, CircleDot } from "lucide-react";
import Link from "next/link";
import type { Difficulty } from "@/content/problems/types";
import type { ProblemStatus } from "@/lib/progress";
import { DifficultyBadge } from "./DifficultyBadge";

export type ProblemSummary = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  summary: string;
  checkCount: number;
};

const statusIcon = {
  solved: { Icon: CircleCheck, className: "text-emerald-400" },
  attempted: { Icon: CircleDot, className: "text-amber-400" },
  unsolved: { Icon: Circle, className: "text-slate-700" },
} satisfies Record<ProblemStatus, { Icon: typeof Circle; className: string }>;

export function ProblemCard({
  problem,
  status,
  bestScore,
}: {
  problem: ProblemSummary;
  status: ProblemStatus;
  bestScore: number;
}) {
  const { Icon, className } = statusIcon[status];

  return (
    <Link
      href={`/problems/${problem.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:border-sky-400/25 hover:bg-white/[0.04]"
    >
      <Icon className={`mt-0.5 size-5 shrink-0 ${className}`} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="text-sm font-semibold text-slate-100 group-hover:text-white">
            {problem.title}
          </h3>
          <DifficultyBadge difficulty={problem.difficulty} />
          {status !== "unsolved" && (
            <span className="text-[10px] font-medium text-slate-500">
              best {bestScore}%
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          {problem.summary}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/[0.07] px-1.5 py-0.5 text-[10px] text-slate-600"
            >
              {tag}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-slate-600">
            {problem.checkCount} checks
          </span>
        </div>
      </div>
    </Link>
  );
}
