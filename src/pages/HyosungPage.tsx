import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import {
  hyosungData,
  trademapImporters,
  trademapExporters,
  getTotals,
  HYOSUNG_PASSWORD,
  NCM_LIST,
  YEARS,
  normalizeCountry,
  STATE_NAMES,
  MONTH_NAMES,
} from "@/data/hyosungData";

const HYOSUNG_BLUE = "#200080";
const HYOSUNG_BLUE_LIGHT = "#e8e0ff";
const HYOSUNG_BLUE_MID = "#6b5ce7";

type Tab = "overview" | "imports" | "exports" | "prices" | "countries" | "states" | "importers" | "exporters";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Visão Geral" },
  { id: "imports", label: "Importações" },
  { id: "exports", label: "Exportações" },
  { id: "prices", label: "Preços" },
  { id: "countries", label: "Países" },
  { id: "states", label: "Estados" },
  { id: "importers", label: "Importadores" },
  { id: "exporters", label: "Exportadores" },
];

function fmtUSD(n: number): string {
  if (n >= 1e6) return `US$ ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `US$ ${(n / 1e3).toFixed(1)}K`;
  return `US$ ${n}`;
}

function fmtKg(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}K ton`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} ton`;
  return `${n} kg`;
}

function fmtPrice(n: number): string {
  return `US$ ${n.toFixed(2)}/kg`;
}

function MiniBar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color || HYOSUNG_BLUE }} />
    </div>
  );
}

// ═══════════════════════════════════════
// LOGIN GATE
// ═══════════════════════════════════════
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === HYOSUNG_PASSWORD) {
      sessionStorage.setItem("hyosung_auth", "1");
      onLogin();
    } else {
      setErr(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-6 mb-8">
          <img src="/logo-tradexa-red.png" alt="TRADEXA" className="h-10" />
          <div className="w-px h-10 bg-gray-300" />
          <img src="/hyosung-logo.png" alt="Hyosung" className="h-8" />
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-center text-gray-900 mb-2">Dashboard Exclusivo</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Inteligência de Mercado — Fibras Sintéticas</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(false); }}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#200080]/30 focus:border-[#200080] transition"
              placeholder="Digite a senha..."
              autoFocus
            />
            {err && <p className="text-xs text-red-500">Senha incorreta</p>}
            <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-all" style={{ backgroundColor: HYOSUNG_BLUE }}>
              Acessar Dashboard
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">TRADEXA © {new Date().getFullYear()} — Acesso restrito</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
export default function HyosungPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("hyosung_auth") === "1") setAuthenticated(true);
  }, []);

  if (!authenticated) return <LoginGate onLogin={() => setAuthenticated(true)} />;

  const totals = getTotals(selectedYear);

  return (
    <>
      <Helmet>
        <title>Hyosung — Dashboard | TRADEXA</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo-tradexa-red.png" alt="TRADEXA" className="h-7" />
              <div className="w-px h-6 bg-gray-300" />
              <img src="/hyosung-logo.png" alt="Hyosung" className="h-6" />
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />4 NCMs
              </span>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-2">
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === t.id ? 'bg-[#f0ebff] text-[#200080] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Title + year selector */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Hyosung — Fibras Sintéticas</h1>
              <p className="text-xs text-gray-500 mt-0.5">Dados consolidados de importação</p>
            </div>
            <div className="flex items-center gap-2">
              {YEARS.map(y => (
                <button key={y} onClick={() => setSelectedYear(y)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedYear === y ? 'text-white' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  style={selectedYear === y ? { backgroundColor: HYOSUNG_BLUE } : {}}>
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400">CIF Total</p>
              <p className="text-sm font-bold" style={{ color: HYOSUNG_BLUE }}>{fmtUSD(totals.totalCif)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400">FOB Est.</p>
              <p className="text-sm font-bold text-emerald-600">{fmtUSD(totals.totalFob)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400">Volume</p>
              <p className="text-sm font-bold" style={{ color: HYOSUNG_BLUE }}>{fmtKg(totals.totalKg)}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-3 py-2 text-center">
              <p className="text-[10px] text-gray-400">Preço/kg</p>
              <p className="text-sm font-bold" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(totals.avgPriceKg)}</p>
            </div>
          </div>

          {/* Desktop tabs */}
          <div className="hidden lg:flex gap-1 bg-gray-100/80 rounded-xl p-1 mb-6 overflow-x-auto">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === t.id ? 'bg-white text-[#200080] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && <OverviewTab year={selectedYear} />}
          {activeTab === "imports" && <ImportsTab year={selectedYear} />}
          {activeTab === "exports" && <ExportsTab year={selectedYear} />}
          {activeTab === "prices" && <PricesTab year={selectedYear} />}
          {activeTab === "countries" && <CountriesTab year={selectedYear} />}
          {activeTab === "states" && <StatesTab year={selectedYear} />}
          {activeTab === "importers" && <ImportersTab />}
          {activeTab === "exporters" && <ExportersTab />}
        </main>

        <footer className="border-t border-gray-200 bg-white mt-8">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">© {new Date().getFullYear()} TRADEXA — Dashboard exclusivo.</p>
            <div className="flex items-center gap-3">
              <img src="/logo-tradexa-red.png" alt="TRADEXA" className="h-4 opacity-50" />
              <img src="/hyosung-logo.png" alt="Hyosung" className="h-3 opacity-50" />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════
function OverviewTab({ year }: { year: string }) {
  const totals = getTotals(year);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">CIF ({year})</p>
          <p className="text-xl font-bold" style={{ color: HYOSUNG_BLUE }}>{fmtUSD(totals.totalCif)}</p>
          <p className="text-[10px] text-gray-500">Importações Brasil</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">FOB ({year})</p>
          <p className="text-xl font-bold text-emerald-600">{fmtUSD(totals.totalFob)}</p>
          <p className="text-[10px] text-gray-500">sem frete e seguro</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Volume</p>
          <p className="text-xl font-bold" style={{ color: HYOSUNG_BLUE }}>{fmtKg(totals.totalKg)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Preço/kg (CIF)</p>
          <p className="text-xl font-bold" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(totals.avgPriceKg)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NCM_LIST.map(ncm => {
          const d = hyosungData[ncm];
          const yd = d?.years[year];
          if (!yd) return null;
          return (
            <div key={ncm} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-mono text-gray-400">{ncm}</p>
                  <p className="text-sm font-semibold text-gray-800">{d.description}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: HYOSUNG_BLUE_LIGHT, color: HYOSUNG_BLUE }}>
                  {fmtUSD(yd.totalCif)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs mb-2">
                <div><p className="text-gray-400">Volume</p><p className="font-semibold text-gray-700">{fmtKg(yd.totalKg)}</p></div>
                <div><p className="text-gray-400">Preço/kg</p><p className="font-semibold text-gray-700">{fmtPrice(yd.avgPriceKg)}</p></div>
              </div>
              {yd.monthly.length > 0 && (
                <div className="flex items-end gap-0.5 h-10">
                  {yd.monthly.map((m, i) => {
                    const maxFob = Math.max(...yd.monthly.map(x => x.fob));
                    const h = maxFob > 0 ? (m.fob / maxFob) * 100 : 0;
                    return <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: HYOSUNG_BLUE, opacity: 0.3 + (i / 12) * 0.5 }} title={`${MONTH_NAMES[m.month - 1]}: ${fmtUSD(m.fob)}`} />;
                  })}
                </div>
              )}
              <p className="text-[9px] text-gray-400 text-right mt-1">{MONTH_NAMES.join(" ")}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// IMPORTS TAB
// ═══════════════════════════════════════
function ImportsTab({ year }: { year: string }) {
  const [selectedNcm, setSelectedNcm] = useState(NCM_LIST[0]);
  const d = hyosungData[selectedNcm];
  const yd = d?.years[year];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {NCM_LIST.map(ncm => (
          <button key={ncm} onClick={() => setSelectedNcm(ncm)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedNcm === ncm ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={selectedNcm === ncm ? { backgroundColor: HYOSUNG_BLUE } : {}}>
            {ncm}
          </button>
        ))}
      </div>
      {yd && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
            <p className="text-sm font-semibold text-gray-700">{d.ncm} — {d.description} — {year}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="text-left px-4 py-2 font-medium text-gray-400">Mês</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">CIF (USD)</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">FOB Est.</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">Peso (kg)</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">Preço/kg</th>
                </tr>
              </thead>
              <tbody>
                {yd.monthly.map((m, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2 font-medium text-gray-600">{MONTH_NAMES[m.month - 1]}</td>
                    <td className="px-4 py-2 text-right text-gray-700">{fmtUSD(m.cif)}</td>
                    <td className="px-4 py-2 text-right text-emerald-600 font-medium">{fmtUSD(m.fob)}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fmtKg(m.kg)}</td>
                    <td className="px-4 py-2 text-right font-semibold" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(m.avgPriceKg)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50/70 font-semibold border-t border-gray-200">
                  <td className="px-4 py-2 text-gray-700">Total</td>
                  <td className="px-4 py-2 text-right text-gray-900">{fmtUSD(yd.totalCif)}</td>
                  <td className="px-4 py-2 text-right text-emerald-600 font-semibold">{fmtUSD(yd.totalFob)}</td>
                  <td className="px-4 py-2 text-right text-gray-800">{fmtKg(yd.totalKg)}</td>
                  <td className="px-4 py-2 text-right" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(yd.avgPriceKg)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// EXPORTS TAB
// ═══════════════════════════════════════
function ExportsTab({ year }: { year: string }) {
  const totals = getTotals(year);
  const allMonthly = NCM_LIST.reduce((acc, ncm) => {
    const yd = hyosungData[ncm]?.years[year];
    if (!yd) return acc;
    yd.monthly.forEach(m => {
      const ex = acc.find(x => x.month === m.month);
      if (ex) { ex.fob += m.fob; ex.kg += m.kg; }
      else acc.push({ ...m });
    });
    return acc;
  }, [] as { month: number; fob: number; kg: number }[]);
  allMonthly.sort((a, b) => a.month - b.month);
  const maxFob = Math.max(...allMonthly.map(m => m.fob));

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-4">📈 Exportações Brasileiras — Fibras Sintéticas ({year})</p>
        <div className="space-y-2">
          {allMonthly.map(m => {
            const pct = maxFob > 0 ? (m.fob / maxFob) * 100 : 0;
            return (
              <div key={m.month} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8 text-right">{MONTH_NAMES[m.month - 1]}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-r-lg overflow-hidden">
                  <div className="h-full rounded-r-lg flex items-center pl-2" style={{ width: `${pct}%`, backgroundColor: "#10b981" }}>
                    <span className="text-[10px] text-white font-medium">{fmtUSD(m.fob)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Total: <strong className="text-gray-700">{fmtUSD(totals.totalFob)}</strong></p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PRICES TAB — WITH MONTHLY LABELS
// ═══════════════════════════════════════
function PricesTab({ year }: { year: string }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-4">💰 Preço Médio por NCM — US$/kg ({year})</p>
        <div className="space-y-3">
          {NCM_LIST.map(ncm => {
            const yd = hyosungData[ncm]?.years[year];
            if (!yd) return null;
            const allPrices = yd.monthly.map(m => m.avgPriceKg);
            const minP = Math.min(...allPrices);
            const maxP = Math.max(...allPrices);
            const range = maxP - minP || 1;
            return (
              <div key={ncm}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-mono">{ncm}</span>
                  <span className="font-semibold" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(yd.avgPriceKg)}</span>
                </div>
                <MiniBar value={yd.avgPriceKg} max={6} color={HYOSUNG_BLUE_MID} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly price evolution with LABELS */}
      {NCM_LIST.map(ncm => {
        const yd = hyosungData[ncm]?.years[year];
        if (!yd || yd.monthly.length === 0) return null;
        const prices = yd.monthly.map(m => m.avgPriceKg);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const range = maxP - minP || 1;

        return (
          <div key={ncm} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-semibold text-gray-700 mb-3">
              📊 {ncm} — Preço por mês ({year})
            </p>
            {/* Table with all months */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    {yd.monthly.map(m => (
                      <th key={m.month} className="text-center px-1 py-1 font-medium text-gray-400">{MONTH_NAMES[m.month - 1]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {yd.monthly.map(m => (
                      <td key={m.month} className="text-center px-1 py-2 font-semibold" style={{ color: HYOSUNG_BLUE }}>
                        {fmtPrice(m.avgPriceKg)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Bar chart */}
            <div className="flex items-end gap-0.5 h-16">
              {yd.monthly.map((m, i) => {
                const h = ((m.avgPriceKg - minP) / range) * 80 + 20;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[8px] text-gray-500 mb-0.5">{fmtPrice(m.avgPriceKg)}</span>
                    <div className="w-full rounded-t-sm" style={{ height: `${h}%`, backgroundColor: HYOSUNG_BLUE_MID, opacity: 0.6 + (i / yd.monthly.length) * 0.3 }} />
                  </div>
                );
              })}
            </div>
            <p className="text-[9px] text-gray-400 text-right mt-1">
              {MONTH_NAMES.slice(0, yd.monthly.length).join(" ")}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// COUNTRIES TAB
// ═══════════════════════════════════════
function CountriesTab({ year }: { year: string }) {
  const [selectedNcm, setSelectedNcm] = useState(NCM_LIST[0]);
  const yd = hyosungData[selectedNcm]?.years[year];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {NCM_LIST.map(ncm => (
          <button key={ncm} onClick={() => setSelectedNcm(ncm)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedNcm === ncm ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={selectedNcm === ncm ? { backgroundColor: HYOSUNG_BLUE } : {}}>
            {ncm}
          </button>
        ))}
      </div>
      {yd && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="text-left px-4 py-2 font-medium text-gray-400">País</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">CIF</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">FOB Est.</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">Preço/kg</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">%</th>
                  <th className="px-4 py-2 font-medium text-gray-400" style={{ width: "25%" }}></th>
                </tr>
              </thead>
              <tbody>
                {yd.countries.map((c, i) => {
                  const maxFob = yd.countries[0]?.fob || 1;
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-700">{c.country}</td>
                      <td className="px-4 py-2.5 text-right text-gray-700">{fmtUSD(c.cif)}</td>
                      <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{fmtUSD(c.fob)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(c.avgPriceKg)}</td>
                      <td className="px-4 py-2.5 text-right text-gray-500">{c.share.toFixed(1)}%</td>
                      <td className="px-4 py-2.5"><MiniBar value={c.fob} max={maxFob} color={HYOSUNG_BLUE_MID} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// STATES TAB
// ═══════════════════════════════════════
function StatesTab({ year }: { year: string }) {
  const [selectedNcm, setSelectedNcm] = useState(NCM_LIST[0]);
  const yd = hyosungData[selectedNcm]?.years[year];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {NCM_LIST.map(ncm => (
          <button key={ncm} onClick={() => setSelectedNcm(ncm)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedNcm === ncm ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={selectedNcm === ncm ? { backgroundColor: HYOSUNG_BLUE } : {}}>
            {ncm}
          </button>
        ))}
      </div>
      {yd && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/30">
                  <th className="text-left px-4 py-2 font-medium text-gray-400">Estado</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">FOB</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">Volume</th>
                  <th className="text-right px-4 py-2 font-medium text-gray-400">Preço/kg</th>
                </tr>
              </thead>
              <tbody>
                {yd.states.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium text-gray-700">{STATE_NAMES[s.state] || s.state}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmtUSD(s.fob)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{fmtKg(s.kg)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold" style={{ color: HYOSUNG_BLUE }}>{fmtPrice(s.avgPriceKg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// IMPORTERS TAB — no source mention
// ═══════════════════════════════════════
function ImportersTab() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">📋 Top 30 importadores globais de fios sintéticos</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="text-left px-4 py-2 font-medium text-gray-400">Empresa</th>
                <th className="text-left px-4 py-2 font-medium text-gray-400">País</th>
                <th className="text-left px-4 py-2 font-medium text-gray-400">Cidade</th>
                <th className="text-left px-4 py-2 font-medium text-gray-400">Website</th>
              </tr>
            </thead>
            <tbody>
              {trademapImporters.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{normalizeCountry(c.country)}</td>
                  <td className="px-4 py-2.5 text-gray-500">{c.city}</td>
                  <td className="px-4 py-2.5">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-[200px] text-[11px]">
                        {c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// EXPORTERS TAB — no source mention
// ═══════════════════════════════════════
function ExportersTab() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 mb-3">📋 Top 30 exportadores globais de fios sintéticos</p>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/30">
                <th className="text-left px-4 py-2 font-medium text-gray-400">Empresa</th>
                <th className="text-left px-4 py-2 font-medium text-gray-400">País</th>
                <th className="text-left px-4 py-2 font-medium text-gray-400">Cidade</th>
                <th className="text-left px-4 py-2 font-medium text-gray-400">Website</th>
              </tr>
            </thead>
            <tbody>
              {trademapExporters.map((c, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-800">{c.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{normalizeCountry(c.country)}</td>
                  <td className="px-4 py-2.5 text-gray-500">{c.city}</td>
                  <td className="px-4 py-2.5">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate block max-w-[200px] text-[11px]">
                        {c.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
