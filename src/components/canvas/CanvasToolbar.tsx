"use client";

import {
  Download,
  Redo2,
  RotateCcw,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { ChangeEvent, useRef } from "react";
import {
  parseDiagramDocument,
  serializeDiagramDocument,
  type DiagramDocument,
} from "@/lib/diagram-document";
import type { DiagramController } from "@/hooks/use-diagram";

const iconButton =
  "grid size-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30";

type CanvasToolbarProps = {
  diagram: DiagramController;
  onReset?: () => void;
  resetLabel?: string;
  showImportExport?: boolean;
};

export function CanvasToolbar({
  diagram,
  onReset,
  resetLabel = "Reset",
  showImportExport = true,
}: CanvasToolbarProps) {
  const importInputRef = useRef<HTMLInputElement>(null);
  const hasSelection =
    diagram.selection.nodes.length > 0 || diagram.selection.edges.length > 0;

  const exportDiagram = () => {
    const document_: DiagramDocument = diagram.document;
    const file = new Blob([serializeDiagramDocument(document_, true)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${
      document_.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-") || "syscode-diagram"
    }.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const importDiagram = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) {
      window.alert("That diagram is too large to import.");
      return;
    }

    let raw: string;
    try {
      raw = await file.text();
    } catch {
      window.alert("SysCode could not read that file.");
      return;
    }

    const parsed = parseDiagramDocument(raw);
    if (!parsed) {
      window.alert("This file is not a valid SysCode diagram.");
      return;
    }

    diagram.replaceDiagram(parsed, parsed.name);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={diagram.undo}
        disabled={!diagram.canUndo}
        title="Undo"
        aria-label="Undo"
        className={iconButton}
      >
        <Undo2 className="size-4" />
      </button>
      <button
        type="button"
        onClick={diagram.redo}
        disabled={!diagram.canRedo}
        title="Redo"
        aria-label="Redo"
        className={iconButton}
      >
        <Redo2 className="size-4" />
      </button>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          title={resetLabel}
          className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white sm:flex"
        >
          <RotateCcw className="size-3.5" />
          {resetLabel}
        </button>
      )}
      <button
        type="button"
        onClick={diagram.deleteSelection}
        disabled={!hasSelection}
        title="Delete selection"
        aria-label="Delete selection"
        className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Trash2 className="size-4" />
      </button>
      {showImportExport && (
        <>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            onChange={importDiagram}
          />
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            title="Import diagram"
            aria-label="Import diagram"
            className={iconButton}
          >
            <Upload className="size-4" />
          </button>
          <button
            type="button"
            onClick={exportDiagram}
            title="Export diagram"
            aria-label="Export diagram"
            className="flex h-9 items-center gap-2 rounded-lg bg-sky-400 px-3 text-xs font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </>
      )}
    </div>
  );
}
