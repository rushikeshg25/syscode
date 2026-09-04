"use client";

import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { ArrowLeft, Boxes, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  DIAGRAM_STORAGE_KEY,
  type DiagramSnapshot,
} from "@/lib/diagram-document";
import { createNode, useDiagram } from "@/hooks/use-diagram";
import { CanvasToolbar } from "./canvas/CanvasToolbar";
import { ComponentPalette } from "./canvas/ComponentPalette";
import { NodeInspector } from "./canvas/NodeInspector";
import { SystemCanvas } from "./canvas/SystemCanvas";

const starterDiagram: DiagramSnapshot = {
  nodes: [
    createNode("client-1", "client", 20, 150, "Web client"),
    createNode("gateway-1", "gateway", 250, 150),
    createNode("service-1", "service", 500, 70, "URL service"),
    createNode("service-2", "service", 500, 240, "Redirect service"),
    createNode("cache-1", "cache", 750, 55, "Redis cache"),
    createNode("database-1", "database", 750, 245, "Primary database"),
  ],
  edges: [
    { id: "client-gateway", source: "client-1", target: "gateway-1" },
    { id: "gateway-url", source: "gateway-1", target: "service-1" },
    { id: "gateway-redirect", source: "gateway-1", target: "service-2" },
    { id: "url-cache", source: "service-1", target: "cache-1" },
    { id: "url-db", source: "service-1", target: "database-1" },
    { id: "redirect-cache", source: "service-2", target: "cache-1" },
  ],
};

function SandboxWorkspace() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { fitView } = useReactFlow();
  const diagram = useDiagram({
    storageKey: DIAGRAM_STORAGE_KEY,
    initialDiagram: starterDiagram,
    initialName: "URL shortener",
    canvasRef,
  });

  const selectedNode =
    diagram.selection.nodes.length === 1
      ? diagram.nodes.find((node) => node.id === diagram.selection.nodes[0].id)
      : undefined;

  const reset = useCallback(() => {
    diagram.replaceDiagram(starterDiagram);
    window.setTimeout(() => fitView({ padding: 0.2, duration: 450 }), 0);
  }, [diagram, fitView]);

  return (
    <main className="flex h-[100dvh] min-h-[580px] flex-col overflow-hidden bg-[#080b10] text-white">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b0f15] px-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            aria-label="Back to home"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <span className="hidden size-8 place-items-center rounded-lg bg-sky-400 text-slate-950 sm:grid">
            <Boxes className="size-4" />
          </span>
          <div className="min-w-0">
            <input
              aria-label="Diagram name"
              value={diagram.name}
              onChange={(event) => diagram.setName(event.target.value)}
              className="w-20 truncate rounded px-1 text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-sky-400/70 sm:w-56"
              placeholder="Untitled design"
            />
            <p
              className={`hidden items-center gap-1.5 text-[10px] sm:flex ${diagram.saveStatus === "saved" ? "text-slate-600" : "text-rose-400"}`}
            >
              <span
                className={`size-1.5 rounded-full ${diagram.saveStatus === "saved" ? "bg-emerald-400" : "bg-rose-400"}`}
              />
              {diagram.saveStatus === "saved"
                ? "Saved locally"
                : "Could not save"}
            </p>
          </div>
        </div>
        <CanvasToolbar
          diagram={diagram}
          onReset={reset}
          resetLabel="Reset example"
        />
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          className={`${sidebarOpen ? "flex" : "hidden"} z-10 h-64 shrink-0 flex-col border-b border-white/10 bg-[#0b0f15] md:h-full md:w-64 md:border-b-0 md:border-r`}
        >
          <div className="hidden items-center justify-between border-b border-white/[0.07] px-4 py-4 md:flex">
            <div>
              <h2 className="text-xs font-semibold text-slate-200">
                Components
              </h2>
              <p className="mt-1 text-[10px] text-slate-600">
                Drag or click to add
              </p>
            </div>
          </div>
          <ComponentPalette
            onAdd={diagram.addComponent}
            onClear={diagram.clear}
            clearDisabled={!diagram.nodes.length && !diagram.edges.length}
          />
          {selectedNode && (
            <NodeInspector node={selectedNode} onUpdate={diagram.updateNode} />
          )}
        </aside>

        <SystemCanvas diagram={diagram} canvasRef={canvasRef}>
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            title={
              sidebarOpen ? "Hide component library" : "Show component library"
            }
            aria-label={
              sidebarOpen ? "Hide component library" : "Show component library"
            }
            className="absolute left-3 top-3 z-10 hidden size-9 place-items-center rounded-lg border border-white/10 bg-[#111722] text-slate-400 shadow-lg transition hover:text-white md:grid"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeftOpen className="size-4" />
            )}
          </button>
          {!diagram.nodes.length && (
            <div className="pointer-events-none absolute inset-0 z-[5] grid place-items-center p-6">
              <div className="max-w-xs rounded-2xl border border-white/10 bg-[#0d131c]/95 p-6 text-center shadow-2xl backdrop-blur">
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
                  <Boxes className="size-5" />
                </span>
                <h2 className="mt-4 text-sm font-semibold text-slate-100">
                  Your canvas is ready
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Choose any component from the library, or begin with a client.
                </p>
                <button
                  type="button"
                  onClick={() => diagram.addComponent("client")}
                  className="pointer-events-auto mt-5 rounded-lg bg-sky-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
                >
                  Add a client
                </button>
              </div>
            </div>
          )}
        </SystemCanvas>
      </div>
    </main>
  );
}

export const Editor = () => (
  <ReactFlowProvider>
    <SandboxWorkspace />
  </ReactFlowProvider>
);
