/**
 * Guards the question content:
 *  1. every reference solution passes its own rubric,
 *  2. reference solutions have no dangling edges or unknown components,
 *  3. the same nodes with every edge removed are REJECTED — this is what
 *     catches a rubric that only checks which parts are present and never
 *     checks how they are wired together.
 */
import { problems } from "@/content/problems";
import { evaluate } from "@/lib/evaluation";
import { componentMap } from "@/lib/component-catalog";

let failures = 0;
const fail = (slug: string, message: string) => {
  failures++;
  console.log(`     ${slug}: ${message}`);
};

for (const problem of problems) {
  const { referenceSolution: reference, rubric, slug } = problem;
  const before = failures;

  const nodeIds = new Set(reference.nodes.map((node) => node.id));
  for (const edge of reference.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      fail(slug, `edge "${edge.id}" points at a node that does not exist`);
    }
  }
  for (const node of reference.nodes) {
    if (!componentMap[node.data.component]) {
      fail(slug, `unknown component "${node.data.component}"`);
    }
  }
  if (new Set(rubric.map((check) => check.id)).size !== rubric.length) {
    fail(slug, "duplicate check ids in rubric");
  }
  if (!problem.hints.length) fail(slug, "no hints");
  if (rubric.length < 5) fail(slug, "rubric is too thin (want 5+ checks)");

  const solved = evaluate(rubric, reference);
  if (!solved.accepted) {
    fail(slug, "reference solution does not pass its own rubric");
    for (const result of solved.results.filter((r) => !r.passed)) {
      console.log(
        `       ${result.required ? "REQUIRED" : "optional"} miss: ${result.id}`,
      );
    }
  }

  // Same components, nothing wired together.
  const unwired = evaluate(rubric, { nodes: reference.nodes, edges: [] });
  if (unwired.accepted) {
    fail(
      slug,
      "rubric accepts unconnected nodes — it needs topology checks, not just has-component",
    );
  }

  const status = failures === before ? "OK  " : "FAIL";
  console.log(
    `${status} ${slug.padEnd(24)} ${solved.passedCount}/${solved.totalCount} checks` +
      `  ·  unwired scores ${unwired.score}`,
  );
}

console.log(
  `\n${problems.length} problems checked, ${failures} problem${failures === 1 ? "" : "s"} found`,
);
process.exit(failures ? 1 : 0);
