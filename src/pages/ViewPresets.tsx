"use client";

import { Globe, Anchor, Ship, TrendingUp } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   VIEW PRESETS — Quick-jump buttons (Osiris-style)
   ═══════════════════════════════════════════════════════════════ */

interface Preset {
  id: string; label: string; icon: any;
  center: [number, number]; zoom: number; pitch?: number; bearing?: number;
}

const PRESETS: Preset[] = [
  { id: "global", label: "Global", icon: Globe, center: [0, 0], zoom: 3 },
  { id: "brasil", label: "Brasil", icon: Globe, center: [-55, -12], zoom: 5.5 },
  { id: "asia", label: "Ásia-Pacífico", icon: Globe, center: [110, 15], zoom: 4.5 },
  { id: "europe", label: "Europa", icon: Globe, center: [8, 50], zoom: 5 },
  { id: "us", label: "EUA", icon: Globe, center: [-98, 37], zoom: 5 },
  { id: "middleeast", label: "Oriente Médio", icon: TrendingUp, center: [50, 25], zoom: 5.5 },
  { id: "africa", label: "África", icon: Globe, center: [20, 0], zoom: 4.5 },
  { id: "maritime", label: "Rotas Marítimas", icon: Ship, center: [-20, -15], zoom: 3, pitch: 45, bearing: 0 },
];

interface Props {
  onSelect: (presetId: string, center: [number, number], zoom: number, pitch?: number, bearing?: number) => void;
  active?: string;
}

export function ViewPresets({ onSelect, active }: Props) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-1">
      {PRESETS.map(p => {
        const Icon = p.icon;
        const isActive = active === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id, p.center, p.zoom, p.pitch, p.bearing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${
              isActive
                ? "bg-[#D80E16] text-white border-[#D80E16] shadow-sm"
                : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300 hover:text-slate-800"
            }`}
          >
            <Icon className="w-3 h-3" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
