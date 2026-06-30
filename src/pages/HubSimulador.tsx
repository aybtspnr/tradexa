"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search, Loader2, DollarSign, TrendingUp, Globe, AlertTriangle,
  BarChart3, Calculator, Ship, FileSearch, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSeo } from "@/hooks/use-seo";
import { comexstat } from "@/services/comexstat";
import { lookupCTSTariff } from "@/services/ctsTariffs";

/* ═══════════════════ TYPES ═══════════════════ */

interface NcmSuggestion {
  code: string;
  description: string;
}

interface CountryOption {
  code: string; // numeric comexstat code
  name: string; // Portuguese name
}

interface SimulationResult {
  ncmCode: string;
  ncmDesc: string;
  countryName: string;
  monthlyVolumeKg: number;
  annualVolumeKg: number;

  // FOB from historical data
  avgPricePerKg: number; // US$/kg
  estimatedMonthlyFob: number;
  estimatedAnnualFob: number;

  // Tariff
  tariffRate: number;
  hasTariff: boolean;
  tariffCostMonthly: number;
  tariffCostAnnual: number;

  // Brazilian export duties / taxes
  exportTaxRate: number;
  exportTaxMonthly: number;

  // Totals
  totalImporterCostMonthly: number;
  totalImporterCostAnnual: number;

  // Annualized
  annualized: boolean;
}

/* ═══════════════════ CONSTANTS ═══════════════════ */

// Current year for data queries
const CURRENT_YEAR = "2026";

// Minimum 2 chars to trigger NCM search
const NCM_SEARCH_MIN = 2;

// Default country-to-CTS name mapping (Portuguese → English)
const COUNTRY_CTS_MAP: Record<string, string> = {
  "Estados Unidos": "United States",
  "Estados Unidos (Incl. Porto Rico)": "United States",
  "China": "China",
  "Alemanha": "European Union",
  "Argentina": "Argentina",
  "Canadá": "Canada",
  "México": "Mexico",
  "Japão": "Japan",
  "Coreia do Sul": "South Korea",
  "Reino Unido": "United Kingdom",
  "França": "European Union",
  "Itália": "European Union",
  "Espanha": "European Union",
  "Países Baixos": "European Union",
  "Holanda": "European Union",
  "Bélgica": "European Union",
  "Portugal": "European Union",
  "Suíça": "Switzerland",
  "Noruega": "Norway",
  "Austrália": "Australia",
  "Chile": "Chile",
  "Peru": "Peru",
  "Índia": "India",
  "Rússia": "Russia",
  "África do Sul": "South Africa",
  "Turquia": "Turkey",
  "Indonésia": "Indonesia",
  "Tailândia": "Thailand",
  "Colômbia": "Colombia",
  "Uruguai": "Uruguay",
  "Paraguai": "Paraguay",
  "Israel": "Israel",
  "Egito": "Egypt",
  "Arábia Saudita": "Saudi Arabia",
  "Emirados Árabes Unidos": "United Arab Emirates",
  "Singapura": "Singapore",
  "Taiwan": "Taiwan",
  "Hong Kong": "Hong Kong",
};

/* ═══════════════════ HELPERS ═══════════════════ */

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `US$ ${(n / 1_000_000_000).toFixed(2).replace(".", ",")} bi`;
  if (n >= 1_000_000) return `US$ ${(n / 1_000_000).toFixed(2).replace(".", ",")} mi`;
  if (n >= 1_000) return `US$ ${(n / 1_000).toFixed(2).replace(".", ",")} mil`;
  return `US$ ${n.toFixed(2).replace(".", ",")}`;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2).replace(".", ",") + " bi";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(".", ",") + " mi";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + " mil";
  return n.toLocaleString("pt-BR");
}

function getHS4Prefix(ncmCode: string): string {
  // NCM is 8 digits, first 4-6 digits are the HS subheading
  // Use first 6 for tariff lookup, falling back to 4
  const digits = ncmCode.replace(/\D/g, "");
  if (digits.length >= 6) return digits.substring(0, 6);
  if (digits.length >= 4) return digits.substring(0, 4);
  return digits.substring(0, 2).padEnd(2, "0");
}

function getCTSCountryName(comexstatName: string): string {
  return COUNTRY_CTS_MAP[comexstatName?.trim()] || comexstatName || "";
}

function getExportTaxRate(ncmCode: string): number {
  // Brazil's export taxes — most products are 0%.
  // Some specific items have export tax (e.g., leather hides, certain chemicals).
  const digits = ncmCode.replace(/\D/g, "");
  const chapter = digits.substring(0, 2);
  // Example: chapter 41 (raw hides/skins) has 9% export tax
  if (chapter === "41") return 9;
  // Chapter 44 (wood) — some items 20-50%
  if (chapter === "44") return 10;
  // Used/recycled products
  if (chapter === "72" && digits.startsWith("7204")) return 1;
  return 0;
}

/* ═══════════════════ COMPONENT ═══════════════════ */

export default function HubSimulador() {
  useSeo({
    title: "Simulador de Exportação — TRADEXA",
    description:
      "Simule cenários de exportação: calcule valores FOB estimados, tarifas de destino, tributos e custos totais com base em dados históricos do Comex Stat.",
    keywords:
      "simulador, exportação, fob, tarifas, ncm, comex stat, comércio exterior, tradexa",
  });

  /* ── Form State ── */

  const [ncmQuery, setNcmQuery] = useState("");
  const [ncmSuggestions, setNcmSuggestions] = useState<NcmSuggestion[]>([]);
  const [ncmSuggestOpen, setNcmSuggestOpen] = useState(false);
  const [selectedNcm, setSelectedNcm] = useState<NcmSuggestion | null>(null);
  const [searchingNcm, setSearchingNcm] = useState(false);
  const ncmRef = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [targetCountry, setTargetCountry] = useState("");
  const [targetCountryName, setTargetCountryName] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [volumeStr, setVolumeStr] = useState("");
  const [periodicity, setPeriodicity] = useState<"monthly" | "annual">("monthly");

  /* ── Simulation state ── */

  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  /* ── Load countries ── */

  useEffect(() => {
    let cancelled = false;
    setLoadingCountries(true);

    comexstat
      .getCountries()
      .then((data: any) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data.map((c: any) => ({
              code: String(c.codigo || c.code || ""),
              name: c.nome_pais || c.name || "",
            }))
          : data?.data?.list
            ? data.data.list.map((c: any) => ({
                code: String(c.codigo || c.code || ""),
                name: c.nome_pais || c.name || "",
              }))
            : [];

        const filtered = list.filter(
          (c: CountryOption) => c.code && c.name && c.code !== "097" // exclude "Não declarado"
        );
        // Sort alphabetically
        filtered.sort((a: CountryOption, b: CountryOption) =>
          a.name.localeCompare(b.name, "pt")
        );
        setCountries(filtered);
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback: top export destinations for Brazil
          setCountries([
            { code: "249", name: "Estados Unidos" },
            { code: "243", name: "China" },
            { code: "160", name: "Argentina" },
            { code: "589", name: "Países Baixos" },
            { code: "105", name: "Alemanha" },
            { code: "267", name: "Coreia do Sul" },
            { code: "452", name: "México" },
            { code: "226", name: "Canadá" },
            { code: "411", name: "Japão" },
            { code: "538", name: "Reino Unido" },
            { code: "579", name: "Espanha" },
            { code: "400", name: "Itália" },
            { code: "309", name: "França" },
            { code: "239", name: "Chile" },
            { code: "507", name: "Peru" },
            { code: "531", name: "Portugal" },
            { code: "578", name: "Suíça" },
            { code: "699", name: "Uruguai" },
            { code: "169", name: "Austrália" },
            { code: "574", name: "Índia" },
          ]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCountries(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── NCM autocomplete ── */

  useEffect(() => {
    if (selectedNcm) return; // Don't search when user already picked one

    const q = ncmQuery.trim();
    if (q.length < NCM_SEARCH_MIN) {
      setNcmSuggestions([]);
      setNcmSuggestOpen(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchingNcm(true);
      try {
        const data = await comexstat.searchNCM(q);
        if (cancelled) return;
        let suggestions: NcmSuggestion[] = [];
        if (Array.isArray(data)) {
          suggestions = data.map((item: any) => ({
            code: String(item.codigo || item.code || item.ncm || ""),
            description: item.descricao || item.description || item.desc || "",
          }));
        } else if (data?.data?.list) {
          suggestions = data.data.list.map((item: any) => ({
            code: String(item.codigo || item.code || item.ncm || ""),
            description: item.descricao || item.description || item.desc || "",
          }));
        } else if (data?.data) {
          suggestions = data.data.map((item: any) => ({
            code: String(item.codigo || item.code || item.ncm || ""),
            description: item.descricao || item.description || item.desc || "",
          }));
        }
        suggestions = suggestions.filter((s) => s.code && s.description);
        setNcmSuggestions(suggestions.slice(0, 15));
        setNcmSuggestOpen(suggestions.length > 0);
      } catch {
        if (!cancelled) {
          setNcmSuggestions([]);
          setNcmSuggestOpen(false);
        }
      } finally {
        if (!cancelled) setSearchingNcm(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ncmQuery, selectedNcm]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ncmRef.current && !ncmRef.current.contains(e.target as Node)) {
        setNcmSuggestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelectNcm = useCallback((item: NcmSuggestion) => {
    setSelectedNcm(item);
    setNcmQuery(`${item.code} — ${item.description}`);
    setNcmSuggestOpen(false);
    setResult(null);
  }, []);

  const handleNcmQueryChange = useCallback((val: string) => {
    setNcmQuery(val);
    if (selectedNcm && val !== `${selectedNcm.code} — ${selectedNcm.description}`) {
      setSelectedNcm(null);
      setResult(null);
    }
  }, [selectedNcm]);

  const handleClearNcm = useCallback(() => {
    setSelectedNcm(null);
    setNcmQuery("");
    setNcmSuggestions([]);
    setResult(null);
  }, []);

  /* ── Country change ── */

  const handleCountryChange = useCallback(
    (value: string) => {
      setTargetCountry(value);
      const found = countries.find((c) => c.code === value);
      setTargetCountryName(found?.name || "");
      setResult(null);
    },
    [countries]
  );

  /* ── Volume ── */

  const volumeKg = useMemo(() => {
    const parsed = parseFloat(volumeStr.replace(/\./g, "").replace(",", "."));
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }, [volumeStr]);

  /* ── Validate form ── */

  const formValid = useMemo(
    () => selectedNcm && targetCountry && volumeKg > 0,
    [selectedNcm, targetCountry, volumeKg]
  );

  /* ── Run simulation ── */

  const handleSimulate = useCallback(async () => {
    if (!formValid || !selectedNcm) return;

    setSimulating(true);
    setSimError(null);
    setResult(null);

    try {
      const ncmCode = selectedNcm.code.replace(/\D/g, "").substring(0, 8);
      const monthlyVol = periodicity === "monthly" ? volumeKg : volumeKg / 12;
      const annualVol = periodicity === "annual" ? volumeKg : volumeKg * 12;

      // 1. Fetch historical export data for this NCM
      let avgPricePerKg = 0;
      try {
        const tradeData = await comexstat.queryGeneral({
          flow: "export",
          monthDetail: false,
          period: { from: `${Number(CURRENT_YEAR) - 1}-01`, to: `${CURRENT_YEAR}-12` },
          filters: [
            { filter: "ncm", values: [ncmCode] },
            { filter: "country", values: [targetCountry] },
          ],
        });

        const list = tradeData?.data?.list || [];
        let totalFob = 0;
        let totalKg = 0;
        for (const row of list) {
          totalFob += row.metricFOB || 0;
          totalKg += row.metricKG || 0;
        }

        if (totalKg > 0) {
          avgPricePerKg = totalFob / totalKg;
        } else {
          // Fallback: try without country filter for global avg
          const globalData = await comexstat.queryGeneral({
            flow: "export",
            monthDetail: false,
            period: { from: `${Number(CURRENT_YEAR) - 1}-01`, to: `${CURRENT_YEAR}-12` },
            filters: [{ filter: "ncm", values: [ncmCode] }],
          });

          const globalList = globalData?.data?.list || [];
          let gFob = 0;
          let gKg = 0;
          for (const row of globalList) {
            gFob += row.metricFOB || 0;
            gKg += row.metricKG || 0;
          }
          if (gKg > 0) {
            avgPricePerKg = gFob / gKg;
          }
        }
      } catch {
        // If comexstat query fails, use a reasonable fallback price
        avgPricePerKg = 2.5; // Generic US$2.50/kg fallback
      }

      // 2. Lookup tariff at destination
      const hsPrefix = getHS4Prefix(ncmCode);
      const ctsCountry = getCTSCountryName(targetCountryName);
      const tariffResult = await lookupCTSTariff(ctsCountry, hsPrefix);

      // Also try with first 4 digits if 6 didn't work well
      let tariffRate = tariffResult.rate;
      let hasTariff = tariffResult.hasData;

      if (!hasTariff && hsPrefix.length >= 6) {
        const fallbackResult = await lookupCTSTariff(ctsCountry, hsPrefix.substring(0, 4));
        if (fallbackResult.hasData) {
          tariffRate = fallbackResult.rate;
          hasTariff = true;
        }
      }

      // If still no tariff, try "World" or the country name as-is
      if (!hasTariff) {
        const directResult = await lookupCTSTariff(targetCountryName, hsPrefix);
        if (directResult.hasData) {
          tariffRate = directResult.rate;
          hasTariff = true;
        } else {
          // Last resort: try "European Union" for EU countries not in map
          const euResult = await lookupCTSTariff("European Union", hsPrefix);
          if (euResult.hasData) {
            tariffRate = euResult.rate;
            hasTariff = true;
          }
        }
      }

      // 3. Calculate results
      const estimatedMonthlyFob = monthlyVol * avgPricePerKg;
      const estimatedAnnualFob = annualVol * avgPricePerKg;

      const tariffCostMonthly = estimatedMonthlyFob * (tariffRate / 100);
      const tariffCostAnnual = estimatedAnnualFob * (tariffRate / 100);

      const exportTaxRate = getExportTaxRate(ncmCode);
      const exportTaxMonthly = estimatedMonthlyFob * (exportTaxRate / 100);

      const totalImporterCostMonthly =
        estimatedMonthlyFob + tariffCostMonthly + exportTaxMonthly;
      const totalImporterCostAnnual = totalImporterCostMonthly * 12;

      setResult({
        ncmCode: ncmCode,
        ncmDesc: selectedNcm.description,
        countryName: targetCountryName,
        monthlyVolumeKg: monthlyVol,
        annualVolumeKg: annualVol,
        avgPricePerKg,
        estimatedMonthlyFob,
        estimatedAnnualFob,
        tariffRate,
        hasTariff,
        tariffCostMonthly,
        tariffCostAnnual,
        exportTaxRate,
        exportTaxMonthly,
        totalImporterCostMonthly,
        totalImporterCostAnnual,
        annualized: periodicity === "annual",
      });
    } catch (err: any) {
      setSimError(
        err?.message || "Erro ao executar simulação. Tente novamente."
      );
    } finally {
      setSimulating(false);
    }
  }, [formValid, selectedNcm, targetCountry, targetCountryName, volumeKg, periodicity]);

  /* ── Render helpers ── */

  function ResultCard({
    label,
    value,
    sub,
    icon: Icon,
    color,
    className,
  }: {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    color: string;
    className?: string;
  }) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md",
          className
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </span>
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              color
            )}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-xl font-black text-slate-800">{value}</p>
        {sub && (
          <p className="text-xs text-slate-400 mt-1">{sub}</p>
        )}
      </div>
    );
  }

  /* ── JSX ── */

  return (
    <div className="p-6 space-y-6">
      {/* ── Page header ── */}
      <div>
        <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#c9a84c]" />
          Simulador de Exportação
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Estime valores FOB, tarifas de destino e tributos com base em dados
          reais do Comex Stat
        </p>
      </div>

      {/* ── Form Card ── */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* NCM Input */}
            <div className="space-y-2" ref={ncmRef}>
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5 text-slate-400" />
                NCM (Produto)
              </Label>
              <div className="relative">
                <Input
                  placeholder="Buscar NCM por código ou descrição..."
                  value={ncmQuery}
                  onChange={(e) => handleNcmQueryChange(e.target.value)}
                  onFocus={() => {
                    if (ncmSuggestions.length > 0) setNcmSuggestOpen(true);
                  }}
                  className={cn(
                    "pr-8 bg-white border-slate-200",
                    selectedNcm && "border-emerald-300 bg-emerald-50/30"
                  )}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {selectedNcm && (
                    <button
                      onClick={handleClearNcm}
                      className="w-4 h-4 rounded-full bg-slate-300 hover:bg-slate-400 text-white text-[10px] flex items-center justify-center transition-colors"
                      title="Limpar"
                    >
                      ×
                    </button>
                  )}
                  {searchingNcm && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  )}
                </div>

                {/* Suggestions dropdown */}
                {ncmSuggestOpen && ncmSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                    {ncmSuggestions.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => handleSelectNcm(item)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 border-b border-slate-100 last:border-0 transition-colors"
                      >
                        <span className="font-mono font-bold text-emerald-600 text-xs">
                          {item.code}
                        </span>
                        <span className="text-slate-600 ml-2">
                          {item.description}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedNcm && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  {selectedNcm.code} selecionado
                </p>
              )}
            </div>

            {/* Target Country */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                País de Destino
              </Label>
              <Select
                value={targetCountry}
                onValueChange={handleCountryChange}
                disabled={loadingCountries}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white border-slate-200",
                    targetCountry && "border-emerald-300 bg-emerald-50/30"
                  )}
                >
                  <SelectValue
                    placeholder={
                      loadingCountries
                        ? "Carregando países..."
                        : "Selecionar país..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
                Volume Mensal (kg)
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Ex: 10.000"
                value={volumeStr}
                onChange={(e) => {
                  // Only allow digits, dots, and commas
                  const v = e.target.value.replace(/[^0-9.,]/g, "");
                  setVolumeStr(v);
                  setResult(null);
                }}
                className={cn(
                  "bg-white border-slate-200",
                  volumeKg > 0 && "border-emerald-300 bg-emerald-50/30"
                )}
              />
            </div>

            {/* Periodicity */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                Periodicidade
              </Label>
              <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setPeriodicity("monthly")}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-semibold transition-colors",
                    periodicity === "monthly"
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setPeriodicity("annual")}
                  className={cn(
                    "flex-1 py-2.5 text-xs font-semibold transition-colors",
                    periodicity === "annual"
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Anual
                </button>
              </div>
            </div>
          </div>

          {/* Simulate Button */}
          <div className="mt-6 flex items-center justify-end gap-3">
            {simError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {simError}
              </div>
            )}
            <Button
              onClick={handleSimulate}
              disabled={!formValid || simulating}
              className={cn(
                "bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {simulating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Simulando...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Simular
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Results Section ── */}
      {simulating && !result && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#c9a84c] mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">
              Calculando simulação...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Consultando dados do Comex Stat e tarifas internacionais
            </p>
          </div>
        </div>
      )}

      {result && !simulating && (
        <div className="space-y-4">
          {/* Summary header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4">
            <div>
              <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Resultado da Simulação
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-mono font-bold">{result.ncmCode}</span> —{" "}
                {result.ncmDesc}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="bg-white border-slate-200 text-slate-600"
              >
                {result.countryName}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {formatNumber(result.monthlyVolumeKg)} kg/mês
              </Badge>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultCard
              label="Preço Médio (US$/kg)"
              value={`US$ ${result.avgPricePerKg.toFixed(4).replace(".", ",")}`}
              sub="Média histórica Comex Stat"
              icon={DollarSign}
              color="bg-blue-500"
            />

            <ResultCard
              label={`FOB ${result.annualized ? "Anual" : "Mensal"} Estimado`}
              value={formatCurrency(
                result.annualized
                  ? result.estimatedAnnualFob
                  : result.estimatedMonthlyFob
              )}
              sub={`${formatNumber(result.annualized ? result.annualVolumeKg : result.monthlyVolumeKg)} kg × US$ ${result.avgPricePerKg.toFixed(4)}`}
              icon={TrendingUp}
              color="bg-emerald-500"
            />

            <ResultCard
              label="Tarifa de Importação (Destino)"
              value={result.hasTariff ? `${result.tariffRate.toFixed(1)}%` : "—"}
              sub={
                result.hasTariff
                  ? `${formatCurrency(result.tariffCostMonthly)}/mês`
                  : "Sem dados de tarifa disponíveis"
              }
              icon={Ship}
              color={
                result.hasTariff && result.tariffRate > 10
                  ? "bg-amber-500"
                  : result.hasTariff
                    ? "bg-teal-500"
                    : "bg-slate-400"
              }
            />

            <ResultCard
              label="Custo Total no Destino"
              value={formatCurrency(
                result.annualized
                  ? result.totalImporterCostAnnual
                  : result.totalImporterCostMonthly
              )}
              sub={
                result.exportTaxRate > 0
                  ? `Inclui ${result.exportTaxRate}% de tributo de exportação`
                  : "Sem tributos de exportação (isenção)"
              }
              icon={Globe}
              color="bg-violet-500"
            />
          </div>

          {/* Detailed breakdown */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-5">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">
                Composição de Custos — Base{" "}
                {result.annualized ? "Anual" : "Mensal"}
              </h3>
              <div className="space-y-3">
                {/* FOB line */}
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-sm text-slate-700 font-medium">
                      Valor FOB
                    </span>
                    <span className="text-[10px] text-slate-400">
                      (preço da mercadoria)
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {formatCurrency(
                      result.annualized
                        ? result.estimatedAnnualFob
                        : result.estimatedMonthlyFob
                    )}
                  </span>
                </div>

                {/* Tariff line */}
                {result.hasTariff && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-sm text-slate-700 font-medium">
                        Tarifa de Importação
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({result.tariffRate.toFixed(1)}% sobre FOB)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(
                        result.annualized
                          ? result.tariffCostAnnual
                          : result.tariffCostMonthly
                      )}
                    </span>
                  </div>
                )}

                {/* Export tax line */}
                {result.exportTaxRate > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-sm text-slate-700 font-medium">
                        Tributo de Exportação
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({result.exportTaxRate}% sobre FOB)
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(
                        result.annualized
                          ? result.exportTaxMonthly * 12
                          : result.exportTaxMonthly
                      )}
                    </span>
                  </div>
                )}

                {/* Total line */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                    <span className="text-sm font-bold text-slate-800">
                      Custo Total no Destino
                    </span>
                  </div>
                  <span className="text-lg font-black text-emerald-700">
                    {formatCurrency(
                      result.annualized
                        ? result.totalImporterCostAnnual
                        : result.totalImporterCostMonthly
                    )}
                  </span>
                </div>
              </div>

              {/* Footnotes */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <strong>Notas:</strong> O valor FOB estimado é calculado com
                  base no preço médio histórico do NCM no Comex Stat. Tarifas
                  são obtidas da base WTO CTS (Consolidated Tariff Schedule,
                  dados de 31 países). Tributos de exportação brasileiros são
                  tipicamente 0% — isenções aplicáveis. Custos de frete e
                  seguro não estão incluídos. Consulte um despachante aduaneiro
                  para cálculos definitivos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty state */}
      {!result && !simulating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
            <Calculator className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-slate-700 mb-1">
            Simulador de Exportação
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Preencha o formulário acima com o NCM do produto, país de destino e
            volume mensal para calcular valores FOB estimados, tarifas de
            importação no destino e custos totais.
          </p>
          <div className="flex flex-wrap gap-4 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" />
              Preço médio histórico
            </div>
            <div className="flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-amber-400" />
              Tarifas WTO no destino
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              Tributos brasileiros
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
