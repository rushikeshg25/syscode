"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { DragEvent, ReactNode, RefObject } from "react";
import { componentMap } from "@/lib/component-catalog";
import type { SystemNode, SystemNodeData } from "@/lib/diagram-document";
import { edgeOptions, type DiagramController } from "@/hooks/use-diagram";
import { nodeTypes } from "./SystemNode";

const minimapColor = (node: { data: unknown }) =>
  componentMap[(node.data as SystemNodeData).component]?.accent ?? "#64748b";

type SystemCanvasProps = {
  diagram: DiagramController;
  canvasRef: RefObject<HTMLDivElement | null>;
  /** Overlays rendered above the canvas, e.g. the empty state or a toggle. */
  children?: ReactNode;
  showMiniMap?: boolean;
};

export function SystemCanvas({
  diagram,
  canvasRef,
  children,
  showMiniMap = true,
}: SystemCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const component = event.dataTransfer.getData(
      "application/syscode-component",
    );
    if (!component || !(component in componentMap)) return;
    diagram.addComponent(
      component as keyof typeof componentMap,
      screenToFlowPosition({ x: event.clientX, y: event.clientY }),
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative min-h-0 flex-1"
      onDrop={onDrop}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
    >
      {children}
      <ReactFlow<SystemNode, Edge>
        nodes={diagram.nodes}
        edges={diagram.edges}
        nodeTypes={nodeTypes}
        onNodesChange={diagram.onNodesChange}
        onEdgesChange={diagram.onEdgesChange}
        onBeforeDelete={diagram.onBeforeDelete}
        onSelectionChange={diagram.onSelectionChange}
        onNodeDragStart={diagram.onNodeDragStart}
        onConnect={diagram.onConnect}
        defaultEdgeOptions={edgeOptions}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.22 }}
        minZoom={0.25}
        maxZoom={1.8}
        deleteKeyCode={["Backspace", "Delete"]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1}
          color="#263244"
        />
        <Controls
          position="bottom-right"
          showInteractive={false}
          className="!overflow-hidden !rounded-lg !border !border-white/10 !bg-[#111722] !shadow-xl [&>button]:!border-white/10 [&>button]:!bg-[#111722] [&>button]:!fill-slate-400 [&>button]:hover:!bg-[#18202d]"
        />
        {showMiniMap && (
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeColor={minimapColor}
            maskColor="rgba(8, 11, 16, .76)"
            className="!hidden !rounded-lg !border !border-white/10 !bg-[#111722] md:!block"
          />
        )}
      </ReactFlow>
    </div>
  );
}
