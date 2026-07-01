import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Target, Globe, Building2, DollarSign, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiDashboardProps {
  importData: { year: string; month: string; fob: number; kg: number }[];
  exportData: { year: string; month: string; fob: number; kg: number }[];
  countries: { nome_pais?: string; country?: string; vl_fob?: number }[];
  empresas: Record<string, any[]>;
  ncmPriceAvg?: {
    import?: { price_per_kg: number; total_fob: number; total_kg: number };
    export?: { price_per_kg: number; total_fob: number; total_kg: number };
  };
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color: string;
}

function KpiCard({ icon, label, value, subValue, trend, trendValue, color }: KpiCardProps) {
  const trendIcon = trend === "up" ? (
    <TrendingUp className="h-3 w-3 text-emerald-500" />
  ) : trend === "down" ? (
    <TrendingDown className="h-3 w-3 text-red-500" />
  ) : (
    <Minus className="h-3 w-3 text-slate-400" />
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            {trendIcon}
            <span className={cn(
              "text-[10px] font-semibold",
              trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-500"
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      {subValue && <p className="text-[10px] text-slate-400 mt-1">{subValue}</p>}
    </div>
  );
}

export function KpiDashboard({ importData, exportData, countries, empresas, ncmPriceAvg }: KpiDashboardProps) {
  const kpis = useMemo(() => {
    // Total FOB
    const totalImportFob = importData.reduce((s, m) => s + m.fob, 0);
    const totalExportFob = exportData.reduce((s, m) => s + m.fob, 0);
    const totalFob = totalImportFob + totalExportFob;

    // Total KG
    const totalImportKg = importData.reduce((s, m) => s + m.kg, 0);
    const totalExportKg = exportData.reduce((s, m) => s + m.kg, 0);
    const totalKg = totalImportKg + totalExportKg;

    // Balance
    const balance = totalExportFob - totalImportFob;
    const balancePct = totalImportFob > 0 ? ((balance / totalImportFob) * 100) : 0;

    // Top country
    const sortedCountries = [...countries].sort((a, b) => (b.vl_fob || 0) - (a.vl_fob || 0));
    const topCountry = sortedCountries[0];
    const topCountryShare = totalFob > 0 && topCountry ? ((topCountry.vl_fob || 0) / totalFob * 100) : 0;

    // Companies count
    const totalCompanies = Object.values(empresas).reduce((s, list) => s + list.length, 0);

    // Price trend (compare last 2 months)
    const sortedImport = [...importData].sort((a, b) => `${a.year}${a.month}`.localeCompare(`${b.year}${b.month}`));
    let priceTrend: "up" | "down" | "stable" = "stable";
    let priceTrendValue = "";
    if (sortedImport.length >= 2) {
      const last = sortedImport[sortedImport.length - 1];
      const prev = sortedImport[sortedImport.length - 2];
      const lastPrice = last.kg > 0 ? last.fob / last.kg : 0;
      const prevPrice = prev.kg > 0 ? prev.fob / prev.kg : 0;
      if (prevPrice > 0) {
        const change = ((lastPrice - prevPrice) / prevPrice) * 100;
        priceTrend = change > 1 ? "up" : change < -1 ? "down" : "stable";
        priceTrendValue = `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
      }
    }

    // Concentration (top 3 countries)
    const top3Fob = sortedCountries.slice(0, 3).reduce((s, c) => s + (c.vl_fob || 0), 0);
    const concentration = totalFob > 0 ? (top3Fob / totalFob * 100) : 0;

    return {
      totalFob,
      totalKg,
      balance,
      balancePct,
      topCountry: topCountry?.nome_pais || topCountry?.country || "-",
      topCountryShare,
      totalCompanies,
      priceTrend,
      priceTrendValue,
      concentration,
    };
  }, [importData, exportData, countries, empresas]);

  const fmtFob = (n: number) =>
    n >= 1e9 ? `US$ ${(n / 1e9).toFixed(2)}B` :
    n >= 1e6 ? `US$ ${(n / 1e6).toFixed(1)}M` :
    `US$ ${(n / 1e3).toFixed(0)}K`;

  const fmtKg = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(1)}t` :
    n >= 1e3 ? `${(n / 1e3).toFixed(0)}kg` :
    `${n.toFixed(0)}g`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 animate-fadeIn">
      <KpiCard
        icon={<DollarSign className="h-4 w-4 text-white" />}
        label="Volume Total"
        value={fmtFob(kpis.totalFob)}
        subValue={`${fmtKg(kpis.totalKg)} movimentados`}
        color="bg-[#D80E16]"
      />
      <KpiCard
        icon={<Target className="h-4 w-4 text-white" />}
        label="Saldo Comercial"
        value={`${kpis.balance >= 0 ? "+" : ""}${kpis.balancePct.toFixed(1)}%`}
        subValue={kpis.balance >= 0 ? "Superávit" : "Déficit"}
        trend={kpis.balance >= 0 ? "up" : "down"}
        color={kpis.balance >= 0 ? "bg-emerald-500" : "bg-red-500"}
      />
      <KpiCard
        icon={<Globe className="h-4 w-4 text-white" />}
        label="Principal País"
        value={kpis.topCountry}
        subValue={`${kpis.topCountryShare.toFixed(1)}% do total`}
        color="bg-blue-500"
      />
      <KpiCard
        icon={<Building2 className="h-4 w-4 text-white" />}
        label="Empresas"
        value={kpis.totalCompanies.toLocaleString("pt-BR")}
        subValue="envolvidas no comércio"
        color="bg-amber-500"
      />
      <KpiCard
        icon={<Package className="h-4 w-4 text-white" />}
        label="Concentração"
        value={`${kpis.concentration.toFixed(0)}%`}
        subValue="top 3 países"
        color="bg-purple-500"
      />
    </div>
  );
}
