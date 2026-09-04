import type { Metadata } from "next";
import { allTags, problems } from "@/content/problems";
import { ProblemBrowser } from "@/components/problems/ProblemBrowser";
import type { ProblemSummary } from "@/components/problems/ProblemCard";

export const metadata: Metadata = {
  title: "Questions",
  description:
    "System design questions to practise on an interactive canvas, checked against a rubric.",
};

export default function ProblemsPage() {
  // Only the list fields cross to the client; rubrics stay out of this payload.
  const summaries: ProblemSummary[] = problems.map((problem) => ({
    slug: problem.slug,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    summary: problem.summary,
    checkCount: problem.rubric.length,
  }));

  return <ProblemBrowser problems={summaries} tags={allTags} />;
}
