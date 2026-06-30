"use client";
import { useState, useEffect } from "react";
import { useSeo } from "@/hooks/use-seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const API = "/api/intel";

export default function HubEua() {
  useSeo({ title: "Comércio Brasil-EUA — TradeXA" });
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [brazil, setBrazil] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/global/bcb/exchange-rate`).then(r => r.json()),
      fetch(`${API}/global/worldbank/country/BRA`).then(r => r.json()),
    ]).then(([cambio, br]) => {
      setExchangeRate(cambio?.value || null);
      setBrazil(br);
    }).catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold">🇺🇸 Comércio Brasil-EUA</h2>
      <p className="text-sm text-slate-500">Indicadores bilaterais com os Estados Unidos</p>

      <div className="grid md:grid-cols-2 gap-3">
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 mb-1">Câmbio USD/BRL</div>
          <div className="text-2xl font-bold">{exchangeRate ? `R$ ${exchangeRate.toFixed(3)}` : "—"}</div>
          <Badge variant="outline" className="mt-1">BCB</Badge>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xs text-slate-500 mb-1">Exportações Brasil</div>
          <div className="text-2xl font-bold text-green-600">{brazil?.exports ? `$${(brazil.exports / 1e9).toFixed(1)}B` : "—"}</div>
          <Badge variant="outline" className="mt-1">World Bank</Badge>
        </CardContent></Card>
      </div>

      <p className="text-xs text-slate-400 mt-4">Dados em breve: importação/exportação bilateral via US Census API</p>
    </div>
  );
}
