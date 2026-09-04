import type { Difficulty } from "@/content/problems/types";

const styles: Record<Difficulty, string> = {
  easy: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  medium: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  hard: "border-rose-400/20 bg-rose-400/10 text-rose-300",
};

export function DifficultyBadge({
  difficulty,
  className = "",
}: {
  difficulty: Difficulty;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${styles[difficulty]} ${className}`}
    >
      {difficulty}
    </span>
  );
}
