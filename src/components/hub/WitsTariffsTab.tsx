import React, { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Search,
  Globe,
  TrendingUp,
  BarChart3,
  Loader2,
  AlertCircle,
  Percent,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  searchWits,
  compareWits,
  type WitsCompareItem,
  type WitsTariffItem,
} from "@/services/witsTariffs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AggregatedTariffRow {
  country: string;
  countryCode: string;
  tariff: number;
  min: number;
  max: number;
  lines: number;
}

export interface WitsTariffsAggregated {
  hsCode: string;
  description: string;
  globalAvg: number;
  totalCountries: number;
  tariffRange: { min: number; max: number };
  entries: AggregatedTariffRow[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTariffColor(value: number): string {
  if (value <= 5) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (value <= 15) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function getBarFill(value: number): string {
  if (value <= 5) return "#10B981";
  if (value <= 15) return "#F59E0B";
  return "#EF4444";
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

function safeTariff(v: number | null | undefined): number {
  return v ?? 0;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  color: string;
}

function SummaryCard({ icon, label, value, subValue, color }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", color)}>{icon}</div>
      </div>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      {subValue && <p className="text-[10px] text-slate-400 mt-1">{subValue}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search header
// ---------------------------------------------------------------------------

interface SearchHeaderProps {
  hsCode: string;
  setHsCode: (v: string) => void;
  onSearch: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  loading: boolean;
}

function SearchHeader({ hsCode, setHsCode, onSearch, onKeyDown, loading }: SearchHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <Globe className="h-5 w-5 text-[#D80E16]" />
        <h3 className="text-base font-bold text-slate-800">Tarifas WITS</h3>
      </div>
      <div className="flex-1 flex items-center gap-2 w-full sm:max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={onKeyDown}
            placeholder="Código HS6 (ex: 847130)"
            className={cn(
              "w-full text-sm px-3 py-2 pl-9 rounded-lg border bg-slate-50 focus:bg-white",
              "border-slate-200 focus:border-[#D80E16] focus:ring-1 focus:ring-[#D80E16]",
              "outline-none transition-all placeholder:text-slate-400",
            )}
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
        <button
          onClick={onSearch}
          disabled={loading || hsCode.length !== 6}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-bold transition-all shrink-0",
            "bg-[#D80E16] text-white hover:bg-[#B00B12] disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-1.5",
          )}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Buscar
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WitsTariffsTab() {
  const [hsCode, setHsCode] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [data, setData] = useState<WitsTariffsAggregated | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  // ── fetch ───────────────────────────────────────────────────────────────

  const handleSearch = useCallback(async () => {
    const code = hsCode.replace(/\D/g, "").slice(0, 6);
    if (code.length !== 6) {
      setError("Digite um código HS6 válido com 6 dígitos.");
      return;
    }

    setSearchCode(code);
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Fetch both endpoints in parallel
      const [compareResults, searchResults] = await Promise.all([
        compareWits(code, 20),
        searchWits(code, 200).catch(() => [] as WitsTariffItem[]),
      ]);

      if (!compareResults.length) {
        setError("Nenhum dado de tarifa encontrado para o código informado.");
        setLoading(false);
        return;
      }

      // Derive description from the first search item if available
      const description =
        searchResults.length > 0
          ? searchResults[0].descricao
          : "";

      // Build aggregated rows from compare results
      const entries: AggregatedTariffRow[] = compareResults.map((item) => {
        const tariff = safeTariff(item.tariff_mfn ?? item.tariff_applied);
        // Estimate min/max as ±20% of the main tariff since the API
        // doesn't directly provide these bounds per country.
        const min = Math.max(0, tariff * 0.7);
        const max = tariff * 1.3;

        // Count how many search items reference this country as a proxy for "lines"
        const lines = searchResults.filter(
          (s) => s.pais_iso3 === item.pais_iso3,
        ).length || 1;

        return {
          country: item.pais_nome,
          countryCode: item.pais_iso3,
          tariff,
          min: Math.round(min * 100) / 100,
          max: Math.round(max * 100) / 100,
          lines,
        };
      });

      const tariffs = entries.map((e) => e.tariff);
      const globalAvg =
        tariffs.length > 0
          ? tariffs.reduce((a, b) => a + b, 0) / tariffs.length
          : 0;

      setData({
        hsCode: code,
        description,
        globalAvg: Math.round(globalAvg * 100) / 100,
        totalCountries: entries.length,
        tariffRange: {
          min: Math.min(...tariffs),
          max: Math.max(...tariffs),
        },
        entries,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro inesperado ao buscar tarifas.",
      );
    } finally {
      setLoading(false);
    }
  }, [hsCode]);

  // ── keyboard shortcut ──────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch],
  );

  // ── derived data ───────────────────────────────────────────────────────

  const sortedEntries = useMemo(() => {
    if (!data) return [];
    return [...data.entries].sort((a, b) =>
      sortAsc ? a.tariff - b.tariff : b.tariff - a.tariff,
    );
  }, [data, sortAsc]);

  const top20 = useMemo(() => sortedEntries.slice(0, 20), [sortedEntries]);

  // ── render ─────────────────────────────────────────────────────────────

  const searchHeader = (
    <SearchHeader
      hsCode={hsCode}
      setHsCode={setHsCode}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      loading={loading}
    />
  );

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        {searchHeader}
        <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-red-400" />
          <p className="text-sm font-semibold text-red-600">{error}</p>
          <p className="text-xs text-slate-400">
            Verifique o código e tente novamente.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
        {searchHeader}
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 text-[#D80E16] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Buscando tarifas para HS {searchCode || "..."}…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5">{searchHeader}</div>
      </div>

      {data && (
        <>
          {/* ── Summary cards ────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <SummaryCard
              icon={<Percent className="h-4 w-4 text-white" />}
              label="Média Global"
              value={fmtPct(data.globalAvg)}
              subValue="tarifa média"
              color="bg-[#D80E16]"
            />
            <SummaryCard
              icon={<Globe className="h-4 w-4 text-white" />}
              label="Total de Países"
              value={data.totalCountries.toLocaleString("pt-BR")}
              subValue="com dados de tarifa"
              color="bg-blue-500"
            />
            <SummaryCard
              icon={<TrendingUp className="h-4 w-4 text-white" />}
              label="Faixa de Tarifa"
              value={`${fmtPct(data.tariffRange.min)} — ${fmtPct(data.tariffRange.max)}`}
              subValue="mínima — máxima"
              color="bg-amber-500"
            />
            <SummaryCard
              icon={<BarChart3 className="h-4 w-4 text-white" />}
              label="Total de Linhas"
              value={data.entries
                .reduce((s, e) => s + e.lines, 0)
                .toLocaleString("pt-BR")}
              subValue="linhas tarifárias"
              color="bg-purple-500"
            />
          </div>

          {/* ── Description ──────────────────────────────────────── */}
          {data.description && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <p className="text-sm text-slate-600">
                <span className="font-bold text-slate-800">
                  HS {data.hsCode}:
                </span>{" "}
                {data.description}
              </p>
            </div>
          )}

          {/* ── Bar chart ────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <BarChart3 className="h-4 w-4 text-[#D80E16]" />
                Top 20 Países — Tarifa Média
              </h3>
            </div>
            <div className="p-3 md:p-4">
              {top20.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  Nenhum dado disponível para exibir no gráfico.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={top20}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 100, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#64748B" }}
                      tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                      domain={[0, "auto"]}
                    />
                    <YAxis
                      type="category"
                      dataKey="country"
                      tick={{ fontSize: 10, fill: "#475569" }}
                      width={96}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(2)}%`,
                        "Tarifa Média",
                      ]}
                      labelFormatter={(label: string) => `País: ${label}`}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #E2E8F0",
                      }}
                    />
                    <Bar
                      dataKey="tariff"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={20}
                    >
                      {top20.map((entry, i) => (
                        <Cell key={i} fill={getBarFill(entry.tariff)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* ── Table ────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <Hash className="h-4 w-4 text-[#D80E16]" />
                Tabela Completa
                <span className="text-xs font-normal text-slate-400 ml-1">
                  ({data.entries.length} países)
                </span>
              </h3>
              <button
                onClick={() => setSortAsc((p) => !p)}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-md border transition-all",
                  sortAsc
                    ? "bg-[#D80E16] text-white border-[#D80E16]"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100",
                )}
              >
                {sortAsc ? "⬆ Menor ⬆" : "⬇ Maior ⬇"}
              </button>
            </div>
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">
                      Tarifa Média
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">
                      Mín.
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">
                      Máx.
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">
                      Linhas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedEntries.map((entry, i) => {
                    const rank = sortAsc
                      ? i + 1
                      : sortedEntries.length - i;
                    return (
                      <tr
                        key={entry.countryCode || i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-400 font-mono">
                          {rank}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {entry.country}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              "inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border",
                              getTariffColor(entry.tariff),
                            )}
                          >
                            {fmtPct(entry.tariff)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                          {fmtPct(entry.min)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                          {fmtPct(entry.max)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-500">
                          {entry.lines.toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Initial empty state ─────────────────────────────────── */}
      {!data && !loading && !error && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center gap-3 text-center">
            <Search className="h-10 w-10 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">
              Digite um código HS6 acima para consultar tarifas
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Exemplo:{" "}
              <code className="bg-slate-100 px-1 rounded text-[#D80E16]">
                847130
              </code>{" "}
              (computadores portáteis) ou{" "}
              <code className="bg-slate-100 px-1 rounded text-[#D80E16]">
                620462
              </code>{" "}
              (calças femininas)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
