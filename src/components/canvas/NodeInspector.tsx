"use client";

import { useEffect, useState } from "react";
import {
  categoryLabels,
  categoryOrder,
  components,
  componentMap,
} from "@/lib/component-catalog";
import type {
  ComponentKey,
  SystemNode,
  SystemNodeData,
} from "@/lib/diagram-document";

type NodeInspectorProps = {
  node: SystemNode;
  onUpdate: (id: string, patch: Partial<SystemNodeData>) => void;
};

/**
 * Editing surface for a single selected node. Without this a node keeps the
 * generic label it was created with, so "Redis cache" was previously
 * impossible to express.
 */
export function NodeInspector({ node, onUpdate }: NodeInspectorProps) {
  const [label, setLabel] = useState(node.data.label);

  useEffect(() => {
    setLabel(node.data.label);
  }, [node.id, node.data.label]);

  const commitLabel = () => {
    const next = label.trim().slice(0, 80);
    if (!next || next === node.data.label) {
      setLabel(node.data.label);
      return;
    }
    onUpdate(node.id, { label: next });
  };

  const definition = componentMap[node.data.component];

  return (
    <div className="border-t border-white/[0.07] p-3">
      <h3 className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
        Selected component
      </h3>

      <label
        className="block px-1 text-[10px] text-slate-500"
        htmlFor="node-label"
      >
        Name
      </label>
      <input
        id="node-label"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        onBlur={commitLabel}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setLabel(node.data.label);
            event.currentTarget.blur();
          }
        }}
        maxLength={80}
        className="mt-1 w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-xs text-slate-200 outline-none focus-visible:border-sky-400/40 focus-visible:ring-1 focus-visible:ring-sky-400/40"
      />

      <label
        className="mt-3 block px-1 text-[10px] text-slate-500"
        htmlFor="node-type"
      >
        Type
      </label>
      <select
        id="node-type"
        value={node.data.component}
        onChange={(event) => {
          const nextComponent = event.target.value as ComponentKey;
          const wasDefaultLabel = node.data.label === definition.label;
          onUpdate(node.id, {
            component: nextComponent,
            // Keep a custom name, but move a still-default one to the new type.
            ...(wasDefaultLabel
              ? { label: componentMap[nextComponent].label }
              : {}),
          });
        }}
        className="mt-1 w-full rounded-lg border border-white/[0.07] bg-[#111823] px-2.5 py-2 text-xs text-slate-200 outline-none focus-visible:border-sky-400/40 focus-visible:ring-1 focus-visible:ring-sky-400/40"
      >
        {categoryOrder.map((category) => (
          <optgroup key={category} label={categoryLabels[category]}>
            {components
              .filter((item) => item.category === category)
              .map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>

      <p className="mt-2 px-1 text-[10px] leading-4 text-slate-600">
        {definition.description}
      </p>
    </div>
  );
}
