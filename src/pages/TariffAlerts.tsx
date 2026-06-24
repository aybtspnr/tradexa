import { useState, useEffect, useCallback } from "react";
import {
  Bell, Plus, Trash2, TrendingUp, TrendingDown, Minus,
  Loader2, AlertTriangle, Search, Globe, Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedFeature } from "@/components/ProtectedFeature";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { useSeo } from "@/hooks/use-seo";
import { useUsage } from "@/hooks/use-usage";
import { calculateCost } from "@/lib/usage-costs";
import { lookupCTSTariff, getCTSCountries } from "@/services/ctsTariffs";

interface WatchedTariff {
  id: string;
  hsCode: string;
  hsDesc: string;
  country: string;
  lastRate: number | null;
  lastChecked: string;
  createdAt: string;
}

interface CheckResult {
  watch: WatchedTariff;
  currentRate: number | null;
  changed: boolean;
  direction: "up" | "down" | "same" | "unknown";
  diff: number;
}

const STORAGE_KEY = "tradexa_tariff_alerts";

interface CtsCountry { name: string; label: string; }

export default function TariffAlerts() {
  useSeo({
    title: "Alertas de Tarifas — Monitoramento de Alíquotas",
    description: "Configure alertas de alterações tarifárias. Monitore mudanças de alíquotas de importação em 31 países e receba notificações por email.",
    keywords: "alertas tarifas, alíquotas, monitoramento tarifário, tradexa",
  });

  const [watches, setWatches] = useState<WatchedTariff[]>([]);
  const [hsCode, setHsCode] = useState("");
  const [hsDesc, setHsDesc] = useState("");
  const [country, setCountry] = useState("");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [ctsCountries, setCtsCountries] = useState<CtsCountry[]>([]);

  const { consume, plan } = useUsage();
  const { canAccess } = useFeatureAccess("tariff_alerts");

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWatches(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watches));
  }, [watches]);

  // Load CTS countries for the dropdown
  useEffect(() => {
    getCTSCountries().then(names => {
      const labelMap: Record<string, string> = {
        "Argentina": "Argentina", "Australia": "Austrália", "Bolivia": "Bolívia",
        "Brazil": "Brasil", "Canada": "Canadá", "Chile": "Chile", "China": "China",
        "Colombia": "Colômbia", "Costa Rica": "Costa Rica", "Ecuador": "Equador",
        "Egypt": "Egito", "European Union": "União Europeia", "Hong Kong, China": "Hong Kong",
        "India": "Índia", "Israel": "Israel", "Japan": "Japão", "Mexico": "México",
        "Norway": "Noruega", "Panama": "Panamá", "Paraguay": "Paraguai", "Peru": "Peru",
        "Russian Federation": "Rússia", "South Africa": "África do Sul", "South Korea": "Coreia do Sul",
        "Switzerland": "Suíça", "Thailand": "Tailândia", "Türkiye": "Turquia",
        "United Arab Emirates": "Emirados Árabes", "United Kingdom": "Reino Unido",
        "United States of America": "EUA", "Uruguay": "Uruguai",
      };
      const countries = names.map(n => ({ name: n, label: labelMap[n] || n }));
      setCtsCountries(countries);
      if (countries.length > 0 && !country) setCountry(countries[0].name);
    }).catch(() => {});
  }, []);

  const addWatch = () => {
    if (!hsCode || !country) return;
    const id = `${hsCode}-${country}-${Date.now()}`;
    setWatches(prev => [...prev, {
      id,
      hsCode,
      hsDesc: hsDesc || `HS ${hsCode}`,
      country,
      lastRate: null,
      lastChecked: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }]);
    setHsCode("");
    setHsDesc("");
    setShowAdd(false);
  };

  const removeWatch = (id: string) => {
    setWatches(prev => prev.filter(w => w.id !== id));
    setResults(prev => prev.filter(r => r.watch.id !== id));
  };

  const checkAll = useCallback(async () => {
    if (watches.length === 0) return;

    // Consume credits per watch
    if (canAccess) {
      const cost = watches.length; // 1 credit per watch
      const consumed = await consume("alert_create");
      if (!consumed) {
        alert("Créditos insuficientes para verificar alertas.");
        return;
      }
    }

    setChecking(true);

    const newResults: CheckResult[] = [];
    const updatedWatches = [...watches];

    for (const watch of watches) {
      const hsPrefix = watch.hsCode.replace(".", "").substring(0, 4);
      let currentRate: number | null = null;
      try {
        const { rate, hasData } = await lookupCTSTariff(watch.country, hsPrefix);
        if (hasData && rate > 0) currentRate = rate;
      } catch {}

      let direction: CheckResult["direction"] = "unknown";
      let diff = 0;
      let changed = false;

      if (watch.lastRate !== null && currentRate !== null) {
        diff = currentRate - watch.lastRate;
        if (Math.abs(diff) > 0.01) {
          changed = true;
          direction = diff > 0 ? "up" : "down";
        } else {
          direction = "same";
        }
      } else if (currentRate !== null) {
        direction = "same"; // first check
      }

      newResults.push({ watch, currentRate, changed, direction, diff });

      // Update stored lastRate
      const idx = updatedWatches.findIndex(w => w.id === watch.id);
      if (idx !== -1) {
        updatedWatches[idx] = { ...updatedWatches[idx], lastRate: currentRate, lastChecked: new Date().toISOString() };
      }
    }

    setWatches(updatedWatches);
    setResults(newResults);
    setChecking(false);
  }, [watches]);

  const hasAlerts = results.some(r => r.changed);

  return (
    <ProtectedFeature featureKey="tariff_alerts">
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-[#D80E16]" />
            <h1 className="text-xl font-black text-slate-800">Alertas de Tarifas</h1>
          </div>
          <p className="text-sm text-slate-600">
            Monitore variações de alíquotas para produtos e países de interesse.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-[#D80E16] text-white font-bold text-sm
                     hover:bg-[#b80c12] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Alerta
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
          <h3 className="text-sm font-black text-slate-800">Adicionar Monitoramento</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Código HS</label>
              <input
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
                placeholder="Ex: 0901.11"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium
                           focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">País Destino</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold bg-white"
              >
                {ctsCountries.map(c => (
                  <option key={c.name} value={c.name}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Descrição (opcional)</label>
            <input
              value={hsDesc}
              onChange={(e) => setHsDesc(e.target.value)}
              placeholder="Ex: Café verde em grãos"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium
                         focus:outline-none focus:ring-2 focus:ring-[#D80E16]/20 focus:border-[#D80E16]"
            />
          </div>
          <button
            onClick={addWatch}
            disabled={!hsCode || !country}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm
                       hover:bg-slate-900 disabled:opacity-50 transition-all"
          >
            Salvar Alerta
          </button>
        </div>
      )}

      {/* Check button */}
      {watches.length > 0 && (
        <button
          onClick={checkAll}
          disabled={checking}
          className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-bold text-sm
                     hover:border-[#D80E16] hover:text-[#D80E16] transition-all flex items-center justify-center gap-2"
        >
          {checking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verificando {watches.length} alertas...</>
          ) : (
            <><Search className="w-4 h-4" /> Verificar Tarifas Agora</>
          )}
        </button>
      )}

      {/* Alert banner */}
      {hasAlerts && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {results.filter(r => r.changed).length} tarifa(s) alterada(s) desde a última verificação!
            </p>
            <p className="text-xs text-amber-700">
              Compare os valores abaixo e ajuste sua estratégia de exportação.
            </p>
          </div>
        </div>
      )}

      {/* Watches list */}
      {watches.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-300">
          <Bell className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Nenhum alerta configurado</p>
          <p className="text-xs text-slate-600 mt-1">Clique em "Novo Alerta" para começar a monitorar.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {watches.map((watch) => {
            const result = results.find(r => r.watch.id === watch.id);
            return (
              <div
                key={watch.id}
                className={cn(
                  "rounded-2xl border p-4 space-y-2 transition-all",
                  result?.changed
                    ? result.direction === "up"
                      ? "border-red-300 bg-red-50"
                      : "border-green-300 bg-green-50"
                    : "border-slate-200 bg-white"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{watch.hsDesc}</p>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {watch.country}
                        <span className="mx-1">·</span>
                        HS {watch.hsCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result && (
                      <div className="flex items-center gap-1.5">
                        {result.direction === "up" && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            <TrendingUp className="w-3 h-3" /> +{result.diff.toFixed(1)}%
                          </span>
                        )}
                        {result.direction === "down" && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                            <TrendingDown className="w-3 h-3" /> {result.diff.toFixed(1)}%
                          </span>
                        )}
                        {result.direction === "same" && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            <Minus className="w-3 h-3" /> Estável
                          </span>
                        )}
                        {result.currentRate !== null && (
                          <span className="text-sm font-black text-slate-800">
                            {result.currentRate.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => removeWatch(watch.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {result && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-600">Tarifa anterior:</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {watch.lastRate !== null ? `${watch.lastRate.toFixed(1)}%` : "—"}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-600">Tarifa atual:</span>
                      <span className="ml-2 font-bold text-slate-800">
                        {result.currentRate !== null ? `${result.currentRate.toFixed(1)}%` : "N/D"}
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-slate-600">
                  Última verificação: {watch.lastChecked ? new Date(watch.lastChecked).toLocaleString("pt-BR") : "Nunca"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </ProtectedFeature>
  );
}
