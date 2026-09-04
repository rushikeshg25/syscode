"use client";

import {
  Background,
  BackgroundVariant,
  Edge,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { edgeOptions } from "@/hooks/use-diagram";
import type { DiagramSnapshot, SystemNode } from "@/lib/diagram-document";
import { nodeTypes } from "./SystemNode";

/** Read-only rendering of a diagram, used for reference solutions. */
export function DiagramPreview({
  diagram,
  className = "",
}: {
  diagram: DiagramSnapshot;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactFlowProvider>
        <ReactFlow<SystemNode, Edge>
          nodes={diagram.nodes}
          edges={diagram.edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={edgeOptions}
          colorMode="dark"
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.2}
          maxZoom={1.5}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="#263244"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
