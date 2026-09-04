import type { Check, Endpoint } from "@/content/problems/types";
import type { ComponentKey, DiagramSnapshot } from "./diagram-document";

export type CheckResult = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  weight: number;
  /** Only set when the check failed. */
  feedback?: string;
};

export type Evaluation = {
  accepted: boolean;
  /** 0-100, weighted across every check. */
  score: number;
  passedCount: number;
  totalCount: number;
  results: CheckResult[];
};

type Graph = {
  /** Node id -> component type. */
  typeOf: Map<string, ComponentKey>;
  /** Component type -> node ids of that type. */
  idsByType: Map<ComponentKey, string[]>;
  /** Node id -> node ids reachable in one hop, following edge direction. */
  out: Map<string, Set<string>>;
  /** Same, ignoring direction. */
  undirected: Map<string, Set<string>>;
};

const buildGraph = (diagram: DiagramSnapshot): Graph => {
  const typeOf = new Map<string, ComponentKey>();
  const idsByType = new Map<ComponentKey, string[]>();
  const out = new Map<string, Set<string>>();
  const undirected = new Map<string, Set<string>>();

  for (const node of diagram.nodes) {
    typeOf.set(node.id, node.data.component);
    const bucket = idsByType.get(node.data.component) ?? [];
    bucket.push(node.id);
    idsByType.set(node.data.component, bucket);
    out.set(node.id, new Set());
    undirected.set(node.id, new Set());
  }

  for (const edge of diagram.edges) {
    if (!typeOf.has(edge.source) || !typeOf.has(edge.target)) continue;
    out.get(edge.source)?.add(edge.target);
    undirected.get(edge.source)?.add(edge.target);
    undirected.get(edge.target)?.add(edge.source);
  }

  return { typeOf, idsByType, out, undirected };
};

/** Node ids matching an endpoint, which may name several component types. */
const idsOf = (graph: Graph, endpoint: Endpoint) =>
  (Array.isArray(endpoint) ? endpoint : [endpoint]).flatMap(
    (component) => graph.idsByType.get(component) ?? [],
  );

/**
 * Every node reachable from `start`, optionally restricted to only travel
 * through nodes whose type is in `allowedIntermediates`. The start node and
 * the destination itself are never subject to that restriction.
 */
const reachableFrom = (
  graph: Graph,
  start: string,
  adjacency: Map<string, Set<string>>,
  allowedIntermediates?: Set<ComponentKey>,
) => {
  const seen = new Set<string>([start]);
  const queue = [start];
  const paths = new Map<string, string[]>([[start, [start]]]);

  while (queue.length) {
    const current = queue.shift()!;
    for (const next of adjacency.get(current) ?? []) {
      if (seen.has(next)) continue;
      seen.add(next);
      paths.set(next, [...(paths.get(current) ?? []), next]);

      const nextType = graph.typeOf.get(next);
      // A node we may not travel *through* can still be a destination, so it
      // is recorded as seen but never expanded.
      if (
        allowedIntermediates &&
        nextType &&
        !allowedIntermediates.has(nextType)
      ) {
        continue;
      }
      queue.push(next);
    }
  }

  return { seen, paths };
};

const evaluateCheck = (check: Check, graph: Graph): boolean => {
  switch (check.kind) {
    case "has-component":
      return idsOf(graph, check.component).length >= (check.min ?? 1);

    case "count-at-least":
      return idsOf(graph, check.component).length >= check.n;

    case "absent-edge": {
      const targets = new Set(idsOf(graph, check.to));
      return !idsOf(graph, check.from).some((sourceId) =>
        [...(graph.out.get(sourceId) ?? [])].some((id) => targets.has(id)),
      );
    }

    case "connects": {
      const adjacency = check.directed === false ? graph.undirected : graph.out;
      const allowed = check.via ? new Set(check.via) : undefined;
      const targets = new Set(idsOf(graph, check.to));
      if (!targets.size) return false;

      return idsOf(graph, check.from).some((sourceId) => {
        // Without `via` this is a direct-edge assertion.
        if (!allowed) {
          return [...(adjacency.get(sourceId) ?? [])].some((id) =>
            targets.has(id),
          );
        }
        const { seen } = reachableFrom(graph, sourceId, adjacency, allowed);
        return [...targets].some((id) => id !== sourceId && seen.has(id));
      });
    }

    case "path-exists": {
      const targets = new Set(idsOf(graph, check.to));
      if (!targets.size) return false;
      const required = new Set(check.through);

      return idsOf(graph, check.from).some((sourceId) => {
        const { paths } = reachableFrom(graph, sourceId, graph.out);
        return [...targets].some((targetId) => {
          const path = paths.get(targetId);
          if (!path || targetId === sourceId) return false;
          const typesOnPath = new Set(
            path.map((id) => graph.typeOf.get(id)).filter(Boolean),
          );
          return [...required].every((type) => typesOnPath.has(type));
        });
      });
    }
  }
};

export const evaluate = (
  rubric: Check[],
  diagram: DiagramSnapshot,
): Evaluation => {
  const graph = buildGraph(diagram);

  const results: CheckResult[] = rubric.map((check) => {
    const passed = evaluateCheck(check, graph);
    return {
      id: check.id,
      label: check.label,
      passed,
      required: check.required ?? true,
      weight: check.weight ?? 1,
      ...(passed ? {} : { feedback: check.feedback }),
    };
  });

  const totalWeight = results.reduce((sum, result) => sum + result.weight, 0);
  const earned = results.reduce(
    (sum, result) => sum + (result.passed ? result.weight : 0),
    0,
  );

  return {
    accepted:
      results.length > 0 &&
      results.every((result) => !result.required || result.passed),
    score: totalWeight ? Math.round((earned / totalWeight) * 100) : 0,
    passedCount: results.filter((result) => result.passed).length,
    totalCount: results.length,
    results,
  };
};
