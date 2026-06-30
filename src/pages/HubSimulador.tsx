"use client";
import { useState } from "react";
import { useSeo } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DollarSign, Calculator } from "lucide-react";

export default function HubSimulador() {
  useSeo({ title: "Simulador de Exportação — TradeXA" });
  const [ncm, setNcm] = useState("");
  const [valor, setValor] = useState("");
  const [pais, setPais] = useState("US");
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const v = parseFloat(valor) || 0;
    const ii = v * 0.16; // exemplo II 16%
    const ipi = v * 0.10;
    const pis = v * 0.021;
    const cofins = v * 0.097;
    setResult({ ii, ipi, pis, cofins, total: v + ii + ipi + pis + cofins, base: v });
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold">📈 Simulador de Exportação</h2>
      <p className="text-sm text-slate-500">Simule custos de exportação por NCM e país</p>
      
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600">NCM</label>
          <Input value={ncm} onChange={e => setNcm(e.target.value)} placeholder="Ex: 3004" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Valor (USD)</label>
          <Input value={valor} onChange={e => setValor(e.target.value)} placeholder="10000" type="number" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">País Destino</label>
          <select 
            value={pais} 
            onChange={e => setPais(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm"
          >
            <option value="US">Estados Unidos</option>
            <option value="CN">China</option>
            <option value="AR">Argentina</option>
            <option value="DE">Alemanha</option>
            <option value="FR">França</option>
          </select>
        </div>
      </div>

      <Button onClick={calcular} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>

      {result && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold">${result.base.toLocaleString()}</div><div className="text-xs text-slate-500">Base</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold text-red-600">${result.ii.toFixed(2)}</div><div className="text-xs text-slate-500">II (16%)</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold text-amber-600">${result.ipi.toFixed(2)}</div><div className="text-xs text-slate-500">IPI (10%)</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold text-blue-600">${result.pis.toFixed(2)}</div><div className="text-xs text-slate-500">PIS (2.1%)</div></CardContent></Card>
          <Card><CardContent className="p-3 text-center"><div className="text-lg font-bold text-green-600">${result.total.toFixed(2)}</div><div className="text-xs text-slate-500">Total</div></CardContent></Card>
        </div>
      )}
    </div>
  );
}
