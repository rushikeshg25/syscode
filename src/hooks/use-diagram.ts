"use client";

import {
  addEdge,
  DefaultEdgeOptions,
  Edge,
  MarkerType,
  Node,
  OnConnect,
  OnSelectionChangeFunc,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { RefObject, useCallback, useEffect, useState } from "react";
import {
  ComponentKey,
  DiagramDocument,
  DiagramSnapshot,
  parseDiagramDocument,
  serializeDiagramDocument,
  SystemNode,
  SystemNodeData,
  SYSTEM_NODE_SIZE,
} from "@/lib/diagram-document";
import { componentMap } from "@/lib/component-catalog";

export const edgeOptions = {
  type: "smoothstep",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
  style: { stroke: "#64748b", strokeWidth: 1.5 },
} satisfies DefaultEdgeOptions;

const HISTORY_LIMIT = 40;

export const createNode = (
  id: string,
  component: ComponentKey,
  x: number,
  y: number,
  label?: string,
): SystemNode => ({
  id,
  type: "system",
  position: { x, y },
  width: SYSTEM_NODE_SIZE.width,
  height: SYSTEM_NODE_SIZE.height,
  data: { component, label: label ?? componentMap[component].label },
});

type UseDiagramOptions = {
  /** localStorage key this diagram autosaves to. */
  storageKey: string;
  /** Used when nothing is stored yet. */
  initialDiagram: DiagramSnapshot;
  initialName?: string;
  canvasRef?: RefObject<HTMLDivElement | null>;
};

export const useDiagram = ({
  storageKey,
  initialDiagram,
  initialName = "Untitled design",
  canvasRef,
}: UseDiagramOptions) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<SystemNode>(
    initialDiagram.nodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialDiagram.edges,
  );
  const [name, setName] = useState(initialName);
  const [saveStatus, setSaveStatus] = useState<"saved" | "error">("saved");
  const [hydrated, setHydrated] = useState(false);
  const [history, setHistory] = useState<DiagramDocument[]>([]);
  const [future, setFuture] = useState<DiagramDocument[]>([]);
  const [selection, setSelection] = useState<{
    nodes: Node[];
    edges: Edge[];
  }>({ nodes: [], edges: [] });

  const { screenToFlowPosition, fitView, deleteElements } = useReactFlow<
    SystemNode,
    Edge
  >();

  const commitHistory = useCallback(() => {
    setHistory((entries) => [
      ...entries.slice(-(HISTORY_LIMIT - 1)),
      { name, nodes, edges },
    ]);
    setFuture([]);
  }, [edges, name, nodes]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const diagram = parseDiagramDocument(stored);
        if (diagram) {
          setNodes(diagram.nodes);
          setEdges(diagram.edges);
          setName(diagram.name);
        } else {
          window.localStorage.removeItem(storageKey);
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // storage is unavailable; run without persistence
      }
    } finally {
      setHydrated(true);
    }
  }, [setEdges, setNodes, storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          storageKey,
          serializeDiagramDocument({ name, nodes, edges }),
        );
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [edges, hydrated, name, nodes, storageKey]);

  const addComponent = useCallback(
    (component: ComponentKey, position?: { x: number; y: number }) => {
      commitHistory();
      const bounds = canvasRef?.current?.getBoundingClientRect();
      const fallback = bounds
        ? screenToFlowPosition({
            x: bounds.left + bounds.width / 2,
            y: bounds.top + bounds.height / 2,
          })
        : { x: 320, y: 180 };
      const id = `${component}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
      setNodes((current) => [
        ...current,
        createNode(
          id,
          component,
          position?.x ?? fallback.x,
          position?.y ?? fallback.y,
        ),
      ]);
    },
    [canvasRef, commitHistory, screenToFlowPosition, setNodes],
  );

  const updateNode = useCallback(
    (id: string, patch: Partial<SystemNodeData>) => {
      commitHistory();
      setNodes((current) =>
        current.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...patch } } : node,
        ),
      );
    },
    [commitHistory, setNodes],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      commitHistory();
      setEdges((current) =>
        addEdge(
          {
            ...connection,
            id: `edge-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
            ...edgeOptions,
          },
          current,
        ),
      );
    },
    [commitHistory, setEdges],
  );

  const onSelectionChange = useCallback<OnSelectionChangeFunc>(
    (next) => setSelection(next),
    [],
  );

  const undo = useCallback(() => {
    const previous = history.at(-1);
    if (!previous) return;
    setFuture((entries) => [
      { name, nodes, edges },
      ...entries.slice(0, HISTORY_LIMIT - 1),
    ]);
    setHistory((entries) => entries.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setName(previous.name);
  }, [edges, history, name, nodes, setEdges, setNodes]);

  const redo = useCallback(() => {
    const next = future[0];
    if (!next) return;
    setHistory((entries) => [...entries, { name, nodes, edges }]);
    setFuture((entries) => entries.slice(1));
    setNodes(next.nodes);
    setEdges(next.edges);
    setName(next.name);
  }, [edges, future, name, nodes, setEdges, setNodes]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      if (!event.metaKey && !event.ctrlKey) return;

      if (event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      } else if (event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  const replaceDiagram = useCallback(
    (snapshot: DiagramSnapshot, nextName?: string) => {
      commitHistory();
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      if (nextName) setName(nextName);
      window.setTimeout(() => fitView({ padding: 0.2, duration: 450 }), 0);
    },
    [commitHistory, fitView, setEdges, setNodes],
  );

  const deleteSelection = useCallback(() => {
    if (!selection.nodes.length && !selection.edges.length) return;
    void deleteElements(selection);
  }, [deleteElements, selection]);

  const clear = useCallback(() => {
    if (!nodes.length && !edges.length) return;
    if (
      !window.confirm(
        "Clear every component and connection? You can undo this action.",
      )
    ) {
      return;
    }
    void deleteElements({ nodes, edges });
  }, [deleteElements, edges, nodes]);

  const onBeforeDelete = useCallback(async () => {
    commitHistory();
    return true;
  }, [commitHistory]);

  return {
    nodes,
    edges,
    name,
    setName,
    saveStatus,
    hydrated,
    selection,
    canUndo: history.length > 0,
    canRedo: future.length > 0,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onSelectionChange,
    onBeforeDelete,
    onNodeDragStart: commitHistory,
    addComponent,
    updateNode,
    undo,
    redo,
    replaceDiagram,
    deleteSelection,
    clear,
    snapshot: { nodes, edges } as DiagramSnapshot,
    document: { name, nodes, edges } as DiagramDocument,
  };
};

export type DiagramController = ReturnType<typeof useDiagram>;
