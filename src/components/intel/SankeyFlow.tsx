import React, { useMemo, useRef, useState, useEffect } from "react";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
import { comexToIso2 } from "./CountryFlag";

/* ─── Constants (must match getCols) ─── */
const LP_DESK = 110;  // left padding for city labels (desktop) — room for ~9-10 chars
const RP_DESK = 90;  // right padding for country flags + labels (desktop)
const LP_MOB = 85;   // left padding (mobile)
const RP_MOB = 70;   // right padding (mobile)
const NW = 16; // node width

/* ─── Types ─── */
interface CityNode { name: string; uf: string; codMun: string; fob: number; }
interface PortNode { urf: string; urfName?: string; viaName: string; fob: number; countries?: { codPais: string; nomePais: string; fob: number }[]; }
interface CountryNode { codPais?: string; nomePais: string; fob: number; }
interface Props {
  cities: CityNode[];
  cityPortsMap?: Record<string, { urf: string; urfName?: string; viaName: string; fob: number }[]>;
  ports: PortNode[];
  countries: CountryNode[];
  flowType: "import" | "export";
  fmtUSD: (n: number) => string;
  onCityClick?: (codMun: string) => void;
  onCountryClick?: (codPais: string) => void;
}

const COL: Record<string, string> = { city: "#DC2626", port: "#0284C7", country: "#059669" };
const VIA: Record<string, { s: string; l: string }> = {
  maritimo: { s: "#0EA5E9", l: "Marítimo" }, aereo: { s: "#8B5CF6", l: "Aéreo" },
  rodoviario: { s: "#F59E0B", l: "Rodoviário" }, default: { s: "#6366F1", l: "Outros" },
};

function viaKey(v: string): string {
  const n = (v || "").toLowerCase();
  if (n.includes("mar")) return "maritimo"; if (n.includes("aer")) return "aereo";
  if (n.includes("rod")) return "rodoviario"; return "default";
}
function val(v: any): number {
  if (v == null || isNaN(v)) return 0; const n = Number(v); return isFinite(n) && n > 0 ? n : 0;
}

/* ─── Column positions (MUST match LP/RP constants) ─── */
function getCols(W: number, LP: number, RP: number): [number, number, number] {
  const mw = (W - LP - RP - NW * 3) / 2;
  return [
    LP + NW / 2,                       // cities center
    LP + NW + mw + NW / 2,             // ports center
    LP + (NW + mw) * 2 + NW / 2,       // countries center
  ];
}

/* ─── Component ─── */
export const SankeyFlow: React.FC<Props> = ({
  cities, cityPortsMap, ports, countries, flowType, fmtUSD,
  onCityClick, onCountryClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(820);
  const [hover, setHover] = useState<number | null>(null);
  const [expand, setExpand] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => { const w = e?.contentRect.width; if (w && w > 0) setCw(w); });
    ro.observe(ref.current); return () => ro.disconnect();
  }, []);

  const isMob = cw < 640;
  const N = expand ? 15 : isMob ? 6 : 8;
  // On mobile use full container width; on desktop cap at 820 but center
  const W = isMob ? Math.max(cw - 24, 320) : Math.min(cw - 48, 820);
  const H = expand ? 600 : isMob ? 420 : 540;
  const LP = isMob ? LP_MOB : LP_DESK;
  const RP = isMob ? RP_MOB : RP_DESK;
  const col = getCols(W, LP, RP);

  /* ─── Build graph ─── */
  const { graph, maxV } = useMemo(() => {
    const cc = cities.filter(c => val(c.fob) > 0).sort((a, b) => b.fob - a.fob).slice(0, N);
    const pp = ports.filter(p => val(p.fob) > 0).sort((a, b) => b.fob - a.fob).slice(0, N);
    const kk = countries.filter(c => val(c.fob) > 0).sort((a, b) => b.fob - a.fob).slice(0, N);
    if (!cc.length || !pp.length || !kk.length) return { graph: null, maxV: 0 };

    const nC = cc.length, nP = pp.length;

    // Port index by URF
    const pIdx = new Map<string, number>();
    pp.forEach((p, i) => pIdx.set(p.urf, nC + i));

    // Country index by codPais AND by name
    const kIdx = new Map<string, number>();
    kk.forEach((k, i) => {
      if (k.codPais) kIdx.set(String(k.codPais), nC + nP + i);
      kIdx.set(k.nomePais.toLowerCase().trim(), nC + nP + i);
    });

    const nodes: any[] = [
      ...cc.map(c => ({ name: `${c.name}/${c.uf}`, type: "city", uf: c.uf, codMun: c.codMun })),
      ...pp.map(p => ({ name: p.urfName || p.urf, type: "port", urf: p.urf })),
      ...kk.map(k => ({ name: k.nomePais, type: "country", codPais: k.codPais })),
    ];
    const links: { source: number; target: number; value: number; via: string }[] = [];

    // ── 1. City → Port links ──
    let c2p = 0;
    if (cityPortsMap && Object.keys(cityPortsMap).length) {
      cc.forEach((city, ci) => {
        const entries = cityPortsMap[city.codMun];
        if (!entries?.length) return;
        const fobs = new Map<string, number>();
        entries.forEach((e: any) => {
          const pi = pIdx.get(e.urf); if (pi === undefined) return;
          const vv = val(e.fob); if (vv > 0) fobs.set(e.urf, (fobs.get(e.urf) || 0) + vv);
        });
        fobs.forEach((vv, urf) => {
          const via = viaKey(entries.find(e => e.urf === urf)?.viaName || "");
          links.push({ source: ci, target: pIdx.get(urf)!, value: vv, via });
          c2p++;
        });
      });
    }
    if (!c2p) {
      const totalPf = pp.reduce((s, p) => s + p.fob, 0);
      cc.forEach((city, ci) => pp.forEach((port, pi) => {
        const share = totalPf > 0 ? port.fob / totalPf : 1 / pp.length;
        const vv = city.fob * share;
        if (vv > 1) { links.push({ source: ci, target: nC + pi, value: vv, via: viaKey(port.viaName) }); c2p++; }
      }));
    }

    // ── 2. Port → Country links ──
    let p2k = 0;
    pp.forEach((port, pi) => {
      (port.countries || []).filter(pc => val(pc.fob) > 0).forEach(pc => {
        let ki = pc.codPais ? kIdx.get(String(pc.codPais)) : undefined;
        if (ki === undefined) ki = kIdx.get(pc.nomePais?.toLowerCase().trim());
        if (ki !== undefined) {
          links.push({ source: nC + pi, target: ki, value: val(pc.fob), via: viaKey(port.viaName) });
          p2k++;
        }
      });
    });

    // ── 3. Fallback proportional Port → Country ──
    if (!p2k) {
      const totalPf = pp.reduce((s, p) => s + p.fob, 0);
      kk.forEach((country, ki) => pp.forEach((port, pi) => {
        const share = totalPf > 0 ? port.fob / totalPf : 1 / pp.length;
        const vv = country.fob * share;
        if (vv > 1) {
          links.push({ source: nC + pi, target: nC + nP + ki, value: vv, via: viaKey(port.viaName) });
          p2k++;
        }
      }));
    }

    // ── d3-sankey layout ──
    // extent LEFT must match LP so city labels have room
    const gen = sankey<any, any>()
      .nodeWidth(NW).nodePadding(isMob ? 4 : 7)
      .extent([[LP, 28], [W - RP, H - 12]])
      .nodeId((_d: any, i: number) => i).nodeAlign(sankeyLeft);
    const g = gen({ nodes: nodes.map(d => ({ ...d })), links: links.map(d => ({ ...d })) });
    g.nodes.forEach((n: any) => {
      const h = (n.y1 || 0) - (n.y0 || 0);
      if (h < 5) { const d = (5 - h) / 2; n.y0 = (n.y0 || 0) - d; n.y1 = (n.y1 || 0) + d; }
    });
    return {
      graph: g,
      maxV: Math.max(...g.nodes.map((n: any) => n.value || 0), 1),
    };
  }, [cities, cityPortsMap, ports, countries, N, isMob, W, H]);

  /* ─── RENDER ─── */
  if (!graph) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <Header flowType={flowType} />
        <div className="py-12 text-center text-slate-400 text-sm px-4">
          <p className="mb-1 font-medium">Dados insuficientes para o fluxo de comércio</p>
          <p className="text-xs text-slate-300">Selecione um NCM e período para visualizar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <Header flowType={flowType} />

      <div ref={ref} className="p-2 md:p-4 overflow-x-auto flex justify-center">
        <svg
          width={W}
          height={H}
          style={{ display: "block", overflow: "hidden" }}
          viewBox={`0 0 ${W} ${H}`}
        >
          <defs>
            <filter id="sh"><feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity={0.15} /></filter>
            <clipPath id="graphClip"><rect x="0" y="0" width={W} height={H} rx={6} /></clipPath>
          </defs>
          <rect width={W} height={H} fill="#F8FAFC" rx={6} />
          <g clipPath="url(#graphClip)">

          {/* Column separators */}
          {[col[0] + 12, col[1] + 12].map((x, i) => (
            <line key={`s${i}`} x1={x} y1={26} x2={x} y2={H - 8} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 3" />
          ))}

          {/* Column headers */}
          {["CIDADES", "PORTOS / VIAS", "PAÍSES"].map((l, i) => (
            <text key={`h${i}`} x={col[i]} y={25} textAnchor="middle" fontSize={8} fontWeight="800" fill="#94A3B8" letterSpacing="1.2">
              {l}
            </text>
          ))}

          {/* ─── LINKS ─── */}
          {graph.links.map((link: any, i: number) => {
            const vs = VIA[link.via] || VIA.default;
            const path = sankeyLinkHorizontal()(link);
            if (!path) return null;
            const fade = hover !== null && link.source.index !== hover && link.target.index !== hover;
            const op = fade ? 0.04 : 0.5 + (link.value / maxV) * 0.35;
            const sw = Math.max(4, Math.min(26, (link.value / maxV) * 18));
            return (
              <g key={`l${i}`} opacity={Math.min(op, 0.85)}>
                <path d={path} fill="none" stroke={vs.s} strokeWidth={sw} strokeLinecap="round" />
                <path d={path} fill="none" stroke="transparent" strokeWidth={Math.max(sw, 10)} style={{ cursor: "pointer" }}>
                  <title>{`${link.source.name} → ${link.target.name}: ${fmtUSD(link.value)}`}</title>
                </path>
              </g>
            );
          })}

          {/* ─── NODES ─── */}
          {graph.nodes.map((node: any, i: number) => {
            const type: string = node.type || "city";
            const fill = COL[type] || "#64748B";
            const x0 = node.x0 ?? LP, x1 = node.x1 ?? x0 + NW;
            const y0 = node.y0 ?? 0, y1 = node.y1 ?? y0 + 4;
            const nw = Math.max(4, x1 - x0), nh = Math.max(5, y1 - y0);
            const isCity = type === "city", isPort = type === "port", isCountry = type === "country";
            const cp = node.codPais, iso = cp ? comexToIso2(cp) : "", flag = iso && iso !== "xx" ? `https://flagcdn.com/w20/${iso}.png` : "";
            const fade = hover !== null && hover !== i;

            // Label position
            let lx: number, la: "start" | "end" | "middle";
            if (isCity) { lx = Math.max(4, x0 - 4); la = "end"; }
            else if (isPort) { lx = (x0 + x1) / 2; la = "middle"; }
            else { lx = Math.min(W - 4, x1 + 6); la = "start"; }
            const ly = y0 + nh / 2;
            const short = isCity
              ? (node.name.length > 10 ? node.name.slice(0, 9) + "…" : node.name)
              : (node.name.length > 14 ? node.name.slice(0, 13) + "…" : node.name);
            const clickable = (isCity && onCityClick) || (isCountry && onCountryClick);

            return (
              <g key={`n${i}`} opacity={fade ? 0.1 : 1}
                style={{ cursor: clickable ? "pointer" : "default", transition: "opacity 0.12s" }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                onClick={() => {
                  if (isCity && onCityClick && node.codMun) onCityClick(node.codMun);
                  else if (isCountry && onCountryClick && node.codPais) onCountryClick(node.codPais);
                }}>
                {/* Node bar */}
                <rect x={x0} y={y0} width={nw} height={nh} fill={fill} rx={2} opacity={0.92} filter="url(#sh)" />
                <rect x={x0 + 1} y={y0 + 1} width={nw - 2} height={Math.max(1.5, nh * 0.2)} fill="rgba(255,255,255,0.18)" rx={1} />
                <title>{`${node.name}: ${fmtUSD(node.value || 0)}`}</title>

                {/* Label */}
                {isCountry && flag ? (
                  <>
                    <image href={flag} x={lx} y={ly - 6} width={18} height={13} preserveAspectRatio="xMidYMid meet" />
                    <text x={lx + 22} y={ly} dy="0.35em" textAnchor="start" fontSize={isMob ? 9 : 10} fontWeight="700" fill="#1E293B">
                      {short}
                    </text>
                  </>
                ) : (
                  <text x={lx} y={ly} dy="0.35em" textAnchor={la} fontSize={isMob ? 9 : 10} fontWeight={isPort ? "600" : "700"} fill="#1E293B">
                    {short}
                  </text>
                )}
              </g>
            );
          })}
          </g>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] px-1">
          {(["city", "port", "country"] as const).map(t => (
            <span key={t} className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: COL[t] }} />
              <span className="text-slate-500 font-medium">{t === "city" ? "Cidades" : t === "port" ? "Portos" : "Países"}</span></span>
          ))}
          <span className="text-slate-300 mx-0.5">|</span>
          {Object.entries(VIA).filter(([k]) => k !== "default").map(([k, vs]) => (
            <span key={k} className="flex items-center gap-1.5"><span className="w-4 h-[3px] rounded" style={{ background: vs.s }} />
              <span className="text-slate-500">{vs.l}</span></span>
          ))}
        </div>

        {/* Toggle */}
        {!expand && (cities.length > N || ports.length > N || countries.length > N) && (
          <button onClick={() => setExpand(true)}
            className="mt-2 text-xs font-semibold text-[#D80E16] hover:text-[#B91C1C] bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors">
            + Mostrar mais (até 15)
          </button>
        )}
        {expand && (
          <button onClick={() => setExpand(false)}
            className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
            Mostrar apenas top {isMob ? 6 : 8}
          </button>
        )}
      </div>
    </div>
  );
};

/* ─── Header ─── */
function Header({ flowType }: { flowType: string }) {
  return (
    <div className="p-4 md:p-5 border-b border-slate-100">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
        <svg className="h-4 w-4 text-[#D80E16]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12h18M3 12l4-4M3 12l4 4M21 12l-4-4M21 12l-4 4"/>
        </svg>
        Fluxo de Comércio — Cidade → Porto → País
        <span className="text-sm font-normal text-slate-400">({flowType === "import" ? "Importação" : "Exportação"})</span>
      </h3>
    </div>
  );
}

export default SankeyFlow;
