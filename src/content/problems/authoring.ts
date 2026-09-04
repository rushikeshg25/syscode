import type { Edge } from "@xyflow/react";
import type { ComponentKey, SystemNode } from "@/lib/diagram-document";
import { SYSTEM_NODE_SIZE } from "@/lib/diagram-document";

/** Compact helpers for writing reference solutions by hand. */
export const node = (
  id: string,
  component: ComponentKey,
  label: string,
  x: number,
  y: number,
): SystemNode => ({
  id,
  type: "system",
  position: { x, y },
  width: SYSTEM_NODE_SIZE.width,
  height: SYSTEM_NODE_SIZE.height,
  data: { component, label },
});

export const edge = (source: string, target: string): Edge => ({
  id: `${source}->${target}`,
  source,
  target,
});
