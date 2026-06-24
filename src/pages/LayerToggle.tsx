"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Layer {
  id: string;
  label: string;
  color: string;
}

interface Props {
  layers: Layer[];
  activeLayers: Set<string>;
  counts: Record<string, number>;
  onToggle: (id: string) => void;
}

export function LayerToggle({ layers, activeLayers, counts, onToggle }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-xl border border-black/[0.06] shadow-xl min-w-[180px] overflow-hidden">
      {/* Header with collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-black/[0.02] transition-colors"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#5E6278]">Camadas</p>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#5E6278] transition-transform duration-200 ${
            collapsed ? "-rotate-90" : "rotate-0"
          }`}
        />
      </button>

      {/* Collapsible layer list */}
      <div
        className={`transition-all duration-200 ease-in-out overflow-hidden ${
          collapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
        }`}
      >
        <div className="space-y-1 px-2 pb-2">
          {layers.map((layer) => {
            const active = activeLayers.has(layer.id);
            const count = counts[layer.id];
            return (
              <button
                key={layer.id}
                onClick={() => onToggle(layer.id)}
                className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all text-xs font-bold ${
                  active ? "bg-[#D80E16]/[0.06] text-[#0F111A]" : "text-[#5E6278] hover:bg-black/[0.03]"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? layer.color : "#d1d5db" }}
                />
                <span className="flex-1">{layer.label}</span>
                {count !== undefined && (
                  <span className={`text-[10px] font-bold ${active ? "text-[#D80E16]" : "text-[#5E6278]/50"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
