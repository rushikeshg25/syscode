"use client";

import { Handle, NodeProps, Position } from "@xyflow/react";
import { componentMap } from "@/lib/component-catalog";
import type { SystemNode } from "@/lib/diagram-document";

export function SystemComponentNode({ data, selected }: NodeProps<SystemNode>) {
  const component = componentMap[data.component];
  const Icon = component.icon;

  return (
    <div
      className={`min-w-[176px] rounded-xl border bg-[#111823] px-3 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.28)] transition ${selected ? "ring-2 ring-sky-400/70" : ""}`}
      style={{
        borderColor: selected ? component.accent : `${component.accent}45`,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!size-2.5 !border-2 !border-[#111823] !bg-slate-400"
      />
      <div className="flex items-center gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: `${component.accent}14`,
            color: component.accent,
          }}
        >
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-100">
            {data.label}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">{component.label}</p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2.5 !border-2 !border-[#111823] !bg-sky-400"
      />
    </div>
  );
}

export const nodeTypes = { system: SystemComponentNode };
