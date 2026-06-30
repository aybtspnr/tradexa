"use client";
import { useState, useEffect } from "react";
import { useSeo } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Globe } from "lucide-react";

const API = "/api/intel";

export default function HubRankings() {
  useSeo({ title: "Rankings — TradeXA" });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/global/market-share/3004?year=2025`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold">🏆 Rankings de Mercado</h2>
      <p className="text-sm text-slate-500">Top parceiros comerciais do Brasil por NCM</p>
      <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
        NCM 3004 — Medicamentos
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
      ) : (
        <div className="space-y-2">
          {data?.partners?.map((p: any, i: number) => (
            <div key={p.country} className="flex items-center gap-3 bg-white rounded-xl border p-3">
              <span className="w-6 h-6 rounded-full bg-[#D80E16]/10 text-[#D80E16] text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <Globe className="w-4 h-4 text-slate-400" />
              <span className="flex-1 font-medium text-sm">{p.country}</span>
              <span className="text-sm font-bold">${(p.value / 1_000_000).toFixed(1)}M</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
