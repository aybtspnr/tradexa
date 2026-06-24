import React, { useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { comexToIso2 } from "./CountryFlag";

interface TreemapItem {
  name: string;
  size: number;
  codPais?: string;
  pricePerKg?: number;
  fob?: number;
  kg?: number;
}

interface Props {
  data: TreemapItem[];
  fmtUSD: (n: number) => string;
  fmtKg: (n: number) => string;
  flowType: "import" | "export";
  onCountryClick?: (codPais: string) => void;
}

/** Color based on price per kg: green=cheap, amber=medium, red=expensive */
function priceColor(ppk: number | undefined, avgPpk: number | undefined): string {
  if (!ppk || !avgPpk || avgPpk <= 0) return "#6366F1";
  const ratio = ppk / avgPpk;
  if (ratio < 0.7) return "#059669"; // much cheaper — green
  if (ratio < 0.9) return "#10B981";
  if (ratio < 1.1) return "#6366F1"; // near average — indigo
  if (ratio < 1.3) return "#F59E0B"; // somewhat expensive — amber
  return "#EF4444"; // expensive — red
}

/** Choose white or dark text based on background luminance */
function textColor(bg: string): string {
  const hex = bg.replace("#", "");
  if (hex.length < 6) return "#fff";
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Relative luminance formula (sRGB)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.45 ? "#1e293b" : "#ffffff";
}

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  name?: string;
  size?: number;
  codPais?: string;
  pricePerKg?: number;
  fob?: number;
  kg?: number;
  avgPpk?: number;
  onCountryClick?: (codPais: string) => void;
}

function CustomTreemapContent(props: CustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name, size, codPais, pricePerKg, avgPpk, onCountryClick } = props;

  if (width < 2 || height < 2) return null;
  const fill = priceColor(pricePerKg, avgPpk);
  const txt = textColor(fill);
  const isDark = txt === "#1e293b";
  const iso2 = codPais ? comexToIso2(codPais) : "";
  const flagUrl = iso2 && iso2 !== "xx" ? `https://flagcdn.com/w20/${iso2}.png` : "";
  const showFlag = width > 40 && height > 24;
  const showName = width > 45 && height > 28;
  const showValue = width > 50 && height > (showFlag ? 45 : 36);

  // Calculate safe text length based on cell width
  const nameFontSize = Math.min(11, Math.max(7, width / 10));
  const valFontSize = Math.min(9, Math.max(7, width / 12));
  const nameMaxChars = Math.floor((width - 8) / (nameFontSize * 0.6));
  const valMaxChars = Math.floor((width - 8) / (valFontSize * 0.6));
  const displayName = (name || "").length > nameMaxChars && nameMaxChars > 2
    ? (name || "").substring(0, nameMaxChars - 1) + "…"
    : (name || "").substring(0, Math.max(nameMaxChars, 1));

  let valueText = "";
  if (size !== undefined) {
    valueText = size >= 1e9 ? `$${(size / 1e9).toFixed(1)}B`
      : size >= 1e6 ? `$${(size / 1e6).toFixed(1)}M`
      : `$${(size / 1e3).toFixed(0)}K`;
    if (valueText.length > valMaxChars && valMaxChars > 2) {
      valueText = valueText.substring(0, valMaxChars - 1) + "…";
    }
  }

  return (
    <g
      onClick={() => codPais && onCountryClick?.(codPais)}
      style={{ cursor: codPais ? "pointer" : "default" }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.9}
        stroke="#fff"
        strokeWidth={2}
        rx={3}
      />
      {/* Flag */}
      {showFlag && flagUrl && (
        <image
          href={flagUrl}
          x={x + 4}
          y={y + 4}
          width={Math.min(18, Math.max(10, width * 0.22))}
          height={Math.min(12, Math.max(7, width * 0.14))}
          preserveAspectRatio="xMidYMid meet"
          clipPath="inset(0 round 2px)"
        />
      )}
      {/* Name text */}
      {showName && (
        <text
          x={x + (showFlag ? 26 : 4)}
          y={y + (showFlag ? 22 : 14)}
          fill={txt}
          stroke={txt === "#ffffff" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.2)"}
          strokeWidth={0.5}
          paintOrder="stroke fill"
          fontSize={nameFontSize}
          fontWeight="700"
        >
          {displayName}
        </text>
      )}
      {/* Value text */}
      {showValue && valueText && (
        <text
          x={x + (showFlag ? 26 : 4)}
          y={y + (showFlag ? 36 : 27)}
          fill={txt}
          fillOpacity={isDark ? 0.7 : 0.85}
          stroke={txt === "#ffffff" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)"}
          strokeWidth={0.3}
          paintOrder="stroke fill"
          fontSize={valFontSize}
          fontWeight="600"
        >
          {valueText}
        </text>
      )}
    </g>
  );
}

export const CountryTreemap: React.FC<Props> = ({
  data, fmtUSD, fmtKg, flowType, onCountryClick,
}) => {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!data.length) return null;

  const avgPpk = data.reduce((s, d) => s + (d.pricePerKg || 0), 0) / data.filter(d => d.pricePerKg).length || 0;

  const treemapData = [{
    name: flowType === "import" ? "Países de Origem" : "Países de Destino",
    children: data.map(d => ({
      ...d,
      avgPpk,
      onCountryClick,
    })),
  }];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
          <svg className="h-4 w-4 text-[#D80E16]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Distribuição por País
          <span className="text-sm font-normal text-slate-400">({data.length})</span>
        </h3>
        <p className="text-[10px] text-slate-400 mt-1">Tamanho = Volume FOB · Cor = Preço/kg (verde=barato, vermelho=caro) · Clique para detalhes</p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <Treemap
            data={treemapData}
            dataKey="size"
            stroke="#fff"
            content={<CustomTreemapContent avgPpk={avgPpk} onCountryClick={onCountryClick} />}
          >
            <Tooltip
              content={({ payload }) => {
                if (!payload || !payload.length) return null;
                const d = payload[0].payload as any;
                if (!d || !d.name) return null;
                return (
                  <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-3 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <strong className="text-slate-800">{d.name}</strong>
                    </div>
                    {d.fob !== undefined && <div className="text-slate-500">FOB: <span className="font-semibold text-slate-700">{fmtUSD(d.fob)}</span></div>}
                    {d.kg !== undefined && d.kg > 0 && <div className="text-slate-500">Peso: <span className="font-semibold text-slate-700">{fmtKg(d.kg)}</span></div>}
                    {d.pricePerKg !== undefined && d.pricePerKg > 0 && <div className="text-slate-500">Preço/kg: <span className="font-semibold text-purple-600">US$ {d.pricePerKg.toFixed(2)}</span></div>}
                  </div>
                );
              }}
            />
          </Treemap>
        </ResponsiveContainer>

        {/* Color legend */}
        <div className="flex items-center justify-center gap-2 mt-3 text-[9px] text-slate-400">
          <span>Barato</span>
          <div className="flex h-2 w-32 rounded-full overflow-hidden">
            <div className="flex-1" style={{ background: "#059669" }} />
            <div className="flex-1" style={{ background: "#10B981" }} />
            <div className="flex-1" style={{ background: "#6366F1" }} />
            <div className="flex-1" style={{ background: "#F59E0B" }} />
            <div className="flex-1" style={{ background: "#EF4444" }} />
          </div>
          <span>Caro</span>
          <span className="ml-2 text-slate-400">(vs média NCM)</span>
        </div>
      </div>
    </div>
  );
};

export default CountryTreemap;
