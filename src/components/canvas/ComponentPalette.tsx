"use client";

import { Eraser, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  categoryLabels,
  categoryOrder,
  components,
  searchComponents,
  type ComponentDefinition,
} from "@/lib/component-catalog";
import type { ComponentKey } from "@/lib/diagram-document";

type ComponentPaletteProps = {
  onAdd: (component: ComponentKey) => void;
  onClear?: () => void;
  clearDisabled?: boolean;
};

export function ComponentPalette({
  onAdd,
  onClear,
  clearDisabled,
}: ComponentPaletteProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const matches = searchComponents(query);
    return categoryOrder
      .map((category) => ({
        category,
        items: matches.filter((item) => item.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-white/[0.07] p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search components"
            aria-label="Search components"
            className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] py-2 pl-8 pr-8 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus-visible:border-sky-400/40 focus-visible:ring-1 focus-visible:ring-sky-400/40"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded text-slate-500 transition hover:text-white"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {grouped.length === 0 && (
          <p className="px-1 py-6 text-center text-[11px] text-slate-600">
            No component matches &ldquo;{query}&rdquo;.
          </p>
        )}
        {grouped.map(({ category, items }) => (
          <section key={category} className="mb-4 last:mb-0">
            <h3 className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              {categoryLabels[category]}
            </h3>
            <div className="grid gap-1.5">
              {items.map((item) => (
                <PaletteItem key={item.key} item={item} onAdd={onAdd} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {onClear && (
        <div className="border-t border-white/[0.07] p-3">
          <button
            type="button"
            onClick={onClear}
            disabled={clearDisabled}
            className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 text-left transition hover:border-rose-400/20 hover:bg-rose-400/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-rose-400/[0.07] text-rose-300">
              <Eraser className="size-3.5" />
            </span>
            <span className="text-xs font-medium text-slate-400 group-hover:text-white">
              Clear canvas
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

function PaletteItem({
  item,
  onAdd,
}: {
  item: ComponentDefinition;
  onAdd: (component: ComponentKey) => void;
}) {
  const { key, label, description, accent, icon: Icon } = item;
  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("application/syscode-component", key);
        event.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => onAdd(key)}
      title={`${label} — ${description}`}
      className="group flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.05]"
    >
      <span
        className="grid size-8 shrink-0 place-items-center rounded-lg"
        style={{ color: accent, backgroundColor: `${accent}12` }}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-slate-300 group-hover:text-white">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[10px] text-slate-600">
          {description}
        </span>
      </span>
    </button>
  );
}

export const paletteComponentCount = components.length;
