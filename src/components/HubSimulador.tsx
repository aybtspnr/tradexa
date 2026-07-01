// src/components/HubSimulador.tsx
// Simulador rápido de importação/exportação com dados reais

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, TrendingDown, DollarSign, Package,
  Percent, Ship, Loader2, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function fmt$(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(2)}`;
}

export default function HubSimulador() {
  const [flow, setFlow] = useState<"import" | "export">("import");
  const [fobValue, setFobValue] = useState("100000");
  const [freightPct, setFreightPct] = useState("15");
  const [insurancePct, setInsurancePct] = useState("2");
  const [tariffPct, setTariffPct] = useState("12");
  const [exchangeRate, setExchangeRate] = useState("5.80");

  const fob = parseFloat(fobValue) || 0;
  const freight = (fob * (parseFloat(freightPct) || 0)) / 100;
  const insurance = (fob * (parseFloat(insurancePct) || 0)) / 100;
  const cif = fob + freight + insurance;
  const tariff = flow === "import" ? (cif * (parseFloat(tariffPct) || 0)) / 100 : 0;
  const totalUsd = flow === "import" ? cif + tariff : fob;
  const totalBrl = totalUsd * (parseFloat(exchangeRate) || 1);

  const costItems = flow === "import"
    ? [
        { label: "FOB (mercadoria)", value: fob, color: "text-blue-600" },
        { label: "Frete", value: freight, color: "text-cyan-600" },
        { label: "Seguro", value: insurance, color: "text-emerald-600" },
        { label: "CIF (subtotal)", value: cif, color: "text-slate-800", bold: true, bg: "bg-slate-50" },
        { label: `Tarifa (${tariffPct}%)`, value: tariff, color: "text-red-600" },
      ]
    : [
        { label: "FOB (mercadoria)", value: fob, color: "text-emerald-600" },
        { label: "Frete", value: freight, color: "text-cyan-600" },
        { label: "Seguro", value: insurance, color: "text-emerald-600" },
      ];

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">Simulador de Custos</h2>
              <p className="text-[10px] text-slate-500">Calcule o custo total da sua operação</p>
            </div>
          </div>

          {/* Flow toggle */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-slate-100 mb-4 w-fit">
            <button onClick={() => setFlow("import")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${flow === "import" ? "bg-white text-red-600 shadow-sm" : "text-slate-500"}`}>
              <TrendingDown className="w-3 h-3 inline mr-1" />Importação
            </button>
            <button onClick={() => setFlow("export")}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${flow === "export" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}>
              <TrendingUp className="w-3 h-3 inline mr-1" />Exportação
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Valor FOB (USD)</label>
              <Input value={fobValue} onChange={e => setFobValue(e.target.value)}
                className="h-9 rounded-xl border-slate-200 text-sm font-mono" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Frete (%)</label>
              <Input value={freightPct} onChange={e => setFreightPct(e.target.value)}
                className="h-9 rounded-xl border-slate-200 text-sm font-mono" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Seguro (%)</label>
              <Input value={insurancePct} onChange={e => setInsurancePct(e.target.value)}
                className="h-9 rounded-xl border-slate-200 text-sm font-mono" />
            </div>
            {flow === "import" && (
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Tarifa (%)</label>
                <Input value={tariffPct} onChange={e => setTariffPct(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-sm font-mono" />
              </div>
            )}
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Câmbio (USD→BRL)</label>
              <Input value={exchangeRate} onChange={e => setExchangeRate(e.target.value)}
                className="h-9 rounded-xl border-slate-200 text-sm font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-400 to-cyan-400" />
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-500" />Detalhamento (USD)
            </h3>
            <div className="space-y-2">
              {costItems.map((item, i) => (
                <div key={i} className={cn("flex items-center justify-between px-3 py-2 rounded-lg", item.bg)}>
                  <span className="text-xs font-medium text-slate-600">{item.label}</span>
                  <span className={cn("text-xs font-black", item.color || "text-slate-700")}>${item.value.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 border border-red-100 mt-2">
                <span className="text-xs font-bold text-red-700">Total (USD)</span>
                <span className="text-sm font-black text-red-700">${totalUsd.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-500" />Resumo em Reais
            </h3>
            <div className="space-y-3">
              <div className="px-4 py-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 text-center">
                <p className="text-[10px] text-emerald-600 uppercase font-bold mb-1">Custo Total em R$</p>
                <p className="text-2xl font-black text-emerald-700">
                  R$ {totalBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-emerald-500 mt-1">
                  Cotação: R$ {parseFloat(exchangeRate || "0").toFixed(2)} · {flow === "import" ? "Importação" : "Exportação"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="px-3 py-2 rounded-xl bg-slate-50">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">FOB</p>
                  <p className="text-sm font-black text-slate-700">R$ {(fob * (parseFloat(exchangeRate) || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-50">
                  <p className="text-[9px] text-slate-500 uppercase font-bold">Custos Extras</p>
                  <p className="text-sm font-black text-red-600">R$ {((totalUsd - fob) * (parseFloat(exchangeRate) || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              {flow === "import" && (
                <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700">
                    Tarifa de {tariffPct}% sobre CIF = ${tariff.toFixed(2)}. Valor real pode variar conforme NCM e acordos comerciais.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
