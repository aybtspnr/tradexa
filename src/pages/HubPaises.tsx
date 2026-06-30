"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Globe, Search, Loader2, AlertTriangle, TrendingUp, TrendingDown,
  ArrowUpDown, ChevronDown, ChevronUp, DollarSign, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { comexstat } from "@/services/comexstat";
import { lookupCTSTariff, getCTSCountries } from "@/services/ctsTariffs";
import { getCountryByCode } from "@/services/restCountries";

/* ═══════════════════ TYPES ═══════════════════ */

interface CountryInfo {
  code: string;       // numeric comextat code
  iso2: string;       // e.g. "US", "CN"
  name: string;       // Portuguese name from API
}

interface TradeData {
  metricFOB: number;
  metricKG: number;
  country: string;
}

interface CountryCardData {
  iso2: string;
  name: string;
  flag: string;
  importVol: number;
  exportVol: number;
  totalVol: number;
  tariffAvg: number;
  hasTariff: boolean;
  growth: number;
  loadingTariff: boolean;
}

/* ═══════════════════ HELPERS ═══════════════════ */

function formatFOB(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(1)}K`;
  return `US$ ${n.toFixed(0)}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

const COUNTRY_NUM_TO_ISO2: Record<string, string> = {
  '249': 'US', '243': 'CN', '160': 'AR', '105': 'DE', '400': 'IT',
  '309': 'FR', '411': 'JP', '538': 'GB', '196': 'BE', '226': 'CA',
  '239': 'CL', '452': 'MX', '169': 'AU', '507': 'PE', '531': 'PT',
  '267': 'KR', '586': 'TW', '291': 'ES', '474': 'NO', '578': 'CH',
  '589': 'NL', '699': 'UY', '566': 'RU', '063': 'ZA', '548': 'DO',
  '358': 'HK', '280': 'DK', '305': 'FI', '063': 'ZA', '575': 'SE',
  '845': 'VE', '040': 'DZ', '072': 'BD', '037': 'SA', '042': 'AM',
};

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function HubPaises() {
  useSeo({
    title: "Países — Comparação Comercial TRADEXA",
    description: "Compare dados comerciais entre países: volumes de importação e exportação, tarifas, tendências de crescimento e bandeiras.",
    keywords: "países, comércio exterior, comparação, importação, exportação, tarifas, tradexa",
  });

  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "import" | "export" | "total" | "tariff" | "growth">("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [cards, setCards] = useState<CountryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // ── Fetch countries list ──
  useEffect(() => {
    let cancelled = false;
    const errs: string[] = [];

    comexstat.getCountries()
      .then((data: any) => {
        if (cancelled) return;
        // data is usually an array of {codigo, nome_pais} or {code, name}
        const list = Array.isArray(data)
          ? data.map((c: any) => ({
              code: String(c.codigo || c.code || ""),
              iso2: COUNTRY_NUM_TO_ISO2[String(c.codigo || c.code || "")] || "",
              name: c.nome_pais || c.name || "",
            }))
          : data?.data?.list
            ? data.data.list.map((c: any) => ({
                code: String(c.codigo || c.code || ""),
                iso2: COUNTRY_NUM_TO_ISO2[String(c.codigo || c.code || "")] || "",
                name: c.nome_pais || c.name || "",
              }))
            : [];
        setCountries(list.filter((c: CountryInfo) => c.code && c.name));
      })
      .catch(() => {
        if (!cancelled) {
          errs.push("Lista de países");
          // Fallback: use common countries
          setCountries([
            { code: "249", iso2: "US", name: "Estados Unidos" },
            { code: "243", iso2: "CN", name: "China" },
            { code: "105", iso2: "DE", name: "Alemanha" },
            { code: "160", iso2: "AR", name: "Argentina" },
            { code: "226", iso2: "CA", name: "Canadá" },
            { code: "452", iso2: "MX", name: "México" },
            { code: "267", iso2: "KR", name: "Coreia do Sul" },
            { code: "411", iso2: "JP", name: "Japão" },
            { code: "538", iso2: "GB", name: "Reino Unido" },
            { code: "589", iso2: "NL", name: "Países Baixos" },
          ]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          if (errs.length) setErrors(errs);
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ── Fetch trade data for top countries ──
  useEffect(() => {
    if (countries.length === 0) return;
    let cancelled = false;

    const topCodes = countries.slice(0, 20).map(c => c.code);

    Promise.all([
      comexstat.queryGeneral({
        flow: "import",
        monthDetail: false,
        period: { from: "2025-01", to: "2025-12" },
        filters: [{ filter: "country", values: topCodes }],
      }).catch(() => null),
      comexstat.queryGeneral({
        flow: "export",
        monthDetail: false,
        period: { from: "2025-01", to: "2025-12" },
        filters: [{ filter: "country", values: topCodes }],
      }).catch(() => null),
      comexstat.queryGeneral({
        flow: "import",
        monthDetail: false,
        period: { from: "2024-01", to: "2024-12" },
        filters: [{ filter: "country", values: topCodes }],
      }).catch(() => null),
    ]).then(([importData, exportData, prevData]) => {
      if (cancelled) return;

      // Build maps: code -> total
      const importMap: Record<string, number> = {};
      const exportMap: Record<string, number> = {};
      const prevImportMap: Record<string, number> = {};

      (importData?.data?.list || []).forEach((r: any) => {
        if (r.country) importMap[r.country] = (importMap[r.country] || 0) + (r.metricFOB || 0);
      });
      (exportData?.data?.list || []).forEach((r: any) => {
        if (r.country) exportMap[r.country] = (exportMap[r.country] || 0) + (r.metricFOB || 0);
      });
      (prevData?.data?.list || []).forEach((r: any) => {
        if (r.country) prevImportMap[r.country] = (prevImportMap[r.country] || 0) + (r.metricFOB || 0);
      });

      // Build card data
      const cardPromises = countries.slice(0, 20).map(async (c) => {
        const importVol = importMap[c.code] || 0;
        const exportVol = exportMap[c.code] || 0;
        const prevVol = prevImportMap[c.code] || 0;
        const growth = prevVol > 0 ? ((importVol - prevVol) / prevVol) * 100 : 0;

        // Fetch tariff + flag in parallel
        const [tariffResult, flagData] = await Promise.all([
          lookupCTSTariff(c.name, "00").catch(() => ({ rate: 0, hasData: false })),
          c.iso2 ? getCountryByCode(c.iso2).catch(() => null) : null,
        ]);

        return {
          iso2: c.iso2,
          name: c.name,
          flag: flagData?.flags?.svg || "",
          importVol,
          exportVol,
          totalVol: importVol + exportVol,
          tariffAvg: tariffResult.rate,
          hasTariff: tariffResult.hasData,
          growth,
          loadingTariff: false,
        };
      });

      Promise.all(cardPromises).then((results) => {
        if (!cancelled) {
          setCards(results);
          setLoading(false);
        }
      });
    }).catch(() => {
      if (!cancelled) {
        setLoading(false);
        setErrors(prev => [...prev, "Dados comerciais"]);
      }
    });

    return () => { cancelled = true; };
  }, [countries]);

  // ── Sort / filter logic ──
  const filteredCards = useMemo(() => {
    let result = [...cards];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "import": cmp = a.importVol - b.importVol; break;
        case "export": cmp = a.exportVol - b.exportVol; break;
        case "total": cmp = a.totalVol - b.totalVol; break;
        case "tariff": cmp = a.tariffAvg - b.tariffAvg; break;
        case "growth": cmp = a.growth - b.growth; break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return result;
  }, [cards, search, sortBy, sortDir]);

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  /* ── Render ── */

  if (loading && cards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#c9a84c] mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Carregando dados dos países...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* SEO Helmet is handled by useSeo above */}

      {/* Error banner */}
      {errors.length > 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Alguns dados não puderam ser carregados: {errors.join(", ")}.
            Mostrando dados disponíveis.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#c9a84c]" />
            Comparação por Países
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Volumes de comércio exterior por país de origem e destino
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Filtrar países..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white border-slate-200"
          />
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium mr-1">Ordenar por:</span>
        {(["total", "import", "export", "tariff", "growth", "name"] as const).map((field) => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={cn(
              "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors",
              sortBy === field
                ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c] font-bold"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            {field === "name" && "Nome"}
            {field === "total" && "Volume Total"}
            {field === "import" && "Importação"}
            {field === "export" && "Exportação"}
            {field === "tariff" && "Tarifa Média"}
            {field === "growth" && "Crescimento"}
            {sortBy === field && (
              sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
            )}
          </button>
        ))}
      </div>

      {/* Country Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.name}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Flag / Header */}
            <div className="h-20 bg-gradient-to-br from-slate-50 to-slate-100 relative flex items-center justify-center">
              {card.flag ? (
                <img
                  src={card.flag}
                  alt={card.name}
                  className="w-14 h-10 object-cover rounded shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Globe className="w-10 h-10 text-slate-300" />
              )}
              {card.growth !== 0 && (
                <div className={cn(
                  "absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5",
                  card.growth >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {card.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(card.growth).toFixed(1)}%
                </div>
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Country name */}
              <h3 className="font-bold text-slate-800 text-sm truncate">{card.name}</h3>

              {/* Stats */}
              <div className="space-y-2">
                {/* Import */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500">
                    <TrendingDown className="w-3 h-3 text-red-400" /> Importação
                  </span>
                  <span className="font-bold text-slate-700">{formatFOB(card.importVol)}</span>
                </div>
                {/* Export */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500">
                    <TrendingUp className="w-3 h-3 text-green-400" /> Exportação
                  </span>
                  <span className="font-bold text-slate-700">{formatFOB(card.exportVol)}</span>
                </div>
                {/* Total */}
                <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1 text-slate-500">
                    <Package className="w-3 h-3 text-blue-400" /> Total
                  </span>
                  <span className="font-bold text-slate-800">{formatFOB(card.totalVol)}</span>
                </div>
                {/* Tariff */}
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-500">
                    <DollarSign className="w-3 h-3 text-amber-400" /> Tarifa Média
                  </span>
                  <span className={cn(
                    "font-bold",
                    card.hasTariff ? "text-slate-700" : "text-slate-400"
                  )}>
                    {card.hasTariff ? `${card.tariffAvg.toFixed(1)}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500">
          <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">Nenhum país encontrado</p>
          <p className="text-xs mt-1">Tente ajustar o filtro de busca.</p>
        </div>
      )}
    </div>
  );
}
