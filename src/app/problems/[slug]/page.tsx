import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProblem, problemIndex, problems } from "@/content/problems";
import { ProblemWorkspace } from "@/components/problems/ProblemWorkspace";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return problems.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) return { title: "Question not found" };
  return { title: problem.title, description: problem.summary };
}

export default async function ProblemPage({ params }: PageProps) {
  const { slug } = await params;
  const problem = getProblem(slug);
  if (!problem) notFound();

  const index = problemIndex(slug);
  const neighbour = (offset: number) => {
    const entry = problems[index + offset];
    return entry ? { slug: entry.slug, title: entry.title } : null;
  };

  return (
    <ProblemWorkspace
      problem={problem}
      previous={neighbour(-1)}
      next={neighbour(1)}
    />
  );
}
