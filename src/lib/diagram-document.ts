import type { Edge, Node } from "@xyflow/react";

const componentKeys = [
  // edge
  "client",
  "mobile",
  "dns",
  "cdn",
  "load-balancer",
  // entry
  "gateway",
  "rate-limiter",
  "auth",
  // compute
  "service",
  "worker",
  "scheduler",
  "websocket",
  // data
  "database",
  "replica",
  "cache",
  "object-storage",
  "search-index",
  "timeseries-db",
  // async
  "queue",
  "event-stream",
  // platform
  "coordinator",
  "monitoring",
  "analytics",
  "notification",
  // external
  "third-party",
] as const;

export type ComponentKey = (typeof componentKeys)[number];

/**
 * Keys used before the palette expanded. Diagrams saved by earlier versions are
 * still sitting in localStorage, so map them forward instead of rejecting them.
 */
const legacyComponentKeys: Record<string, ComponentKey> = {
  storage: "object-storage",
  cloud: "third-party",
};

export type SystemNodeData = {
  label: string;
  component: ComponentKey;
};

export type SystemNode = Node<SystemNodeData, "system">;

export type DiagramSnapshot = {
  nodes: SystemNode[];
  edges: Edge[];
};

export type DiagramDocument = DiagramSnapshot & {
  name: string;
};

export const DIAGRAM_STORAGE_KEY = "syscode-diagram-v1";

export const problemStorageKey = (slug: string) => `syscode-problem-${slug}-v1`;
export const SYSTEM_NODE_SIZE = { width: 176, height: 60 } as const;

const componentKeySet = new Set<string>(componentKeys);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeNode = (value: unknown): SystemNode | null => {
  if (!isRecord(value) || !isRecord(value.data) || !isRecord(value.position)) {
    return null;
  }

  const { id, data, position } = value;
  if (
    typeof id !== "string" ||
    !id ||
    typeof data.label !== "string" ||
    !data.label.trim() ||
    typeof data.component !== "string" ||
    !isFiniteNumber(position.x) ||
    !isFiniteNumber(position.y)
  ) {
    return null;
  }

  const component = componentKeySet.has(data.component)
    ? (data.component as ComponentKey)
    : legacyComponentKeys[data.component];
  if (!component) return null;

  return {
    id,
    type: "system",
    position: { x: position.x, y: position.y },
    width: SYSTEM_NODE_SIZE.width,
    height: SYSTEM_NODE_SIZE.height,
    data: {
      component,
      label: data.label.trim().slice(0, 80),
    },
  };
};

const normalizeEdge = (value: unknown, nodeIds: Set<string>): Edge | null => {
  if (!isRecord(value)) return null;
  const { id, source, target } = value;
  if (
    typeof id !== "string" ||
    !id ||
    typeof source !== "string" ||
    typeof target !== "string" ||
    !nodeIds.has(source) ||
    !nodeIds.has(target)
  ) {
    return null;
  }

  return { id, source, target };
};

export const parseDiagramDocument = (raw: string): DiagramDocument | null => {
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      !Array.isArray(value.nodes) ||
      !Array.isArray(value.edges)
    ) {
      return null;
    }
    if (value.nodes.length > 500 || value.edges.length > 1000) return null;

    const nodes = value.nodes.map(normalizeNode);
    if (nodes.some((node) => node === null)) return null;
    const validNodes = nodes as SystemNode[];
    const nodeIds = new Set(validNodes.map((node) => node.id));
    if (nodeIds.size !== validNodes.length) return null;

    const edges = value.edges.map((edge) => normalizeEdge(edge, nodeIds));
    if (edges.some((edge) => edge === null)) return null;
    const validEdges = edges as Edge[];
    if (new Set(validEdges.map((edge) => edge.id)).size !== validEdges.length) {
      return null;
    }

    return {
      name:
        typeof value.name === "string" && value.name.trim()
          ? value.name.trim().slice(0, 80)
          : "Untitled design",
      nodes: validNodes,
      edges: validEdges,
    };
  } catch {
    return null;
  }
};

export const serializeDiagramDocument = (
  document: DiagramDocument,
  pretty = false,
) => JSON.stringify(document, null, pretty ? 2 : undefined);
