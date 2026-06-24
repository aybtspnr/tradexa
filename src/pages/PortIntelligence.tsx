"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { useUsage } from "@/hooks/use-usage";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Anchor, ArrowDown, MapPin,
  Ship, Loader2, AlertTriangle
} from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import { supabase } from "@/integrations/supabase/client";

interface PortData {
  port_code: string;
  port_name: string;
  value_mo: number;
  year: string;
}

export default function PortIntelligence() {
  const { consume } = useUsage();
  useSeo({
    title: "Port Intelligence EUA — Importações por Porto",
    description: "Volume de importações por porto dos Estados Unidos. Análise detalhada de fluxos portuários, origem dos produtos e tendências de entrada.",
  });

  const [year, setYear] = useState("2025");
  const [ports, setPorts] = useState<PortData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchPorts() {
    const ok = await consume("search");
    if (!ok) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("census-porths", {
        body: { action: "top", flow: "imports", year, limit: 30 },
      });
      if (fnError) throw new Error(fnError.message || "Erro na edge function");
      if (data?.error) throw new Error(data.error);
      const fetched = data?.ports || [];
      if (fetched.length > 0) {
        setPorts(fetched);
      } else {
        throw new Error("Nenhum dado retornado");
      }
    } catch (err: any) {
      console.warn("Port Intelligence error:", err);
      setError(err.message || "Erro ao carregar dados");
      setPorts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPorts();
  }, [year]);

  const maxVal = ports.length > 0 ? Math.max(...ports.map(p => p.value_mo)) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Port Intelligence EUA"
        subtitle="Volume de importações por porto dos EUA."
        variant="blue"
      />

      {/* Controls */}
      <Card className="border border-slate-200 rounded-2xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-[#D80E16] text-white text-[10px] font-black px-2.5 py-1">
              <ArrowDown className="w-3 h-3 inline mr-1" /> Importações
            </Badge>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Ano</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <span className="ml-3 text-slate-500 font-medium">Carregando dados...</span>
        </div>
      )}

      {error && (
        <Card className="border border-red-200 bg-red-50 rounded-2xl">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchPorts} className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium">
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && ports.length === 0 && (
        <Card className="border border-slate-200 rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Nenhum dado disponível para o período selecionado.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && ports.length > 0 && (
        <div className="space-y-3">
          {ports.map((port, i) => {
            const pct = maxVal > 0 ? (port.value_mo / maxVal) * 100 : 0;
            return (
              <Card key={port.port_code} className="border border-slate-200 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#D80E16]/10 text-[#D80E16] flex items-center justify-center text-xs font-black">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{port.port_name}</h4>
                        <span className="text-sm font-black text-slate-900">
                          US$ {(port.value_mo / 1e9).toFixed(1)}B
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full bg-[#D80E16] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                        <MapPin className="w-3 h-3" /> Código: {port.port_code}
                        <Badge className="bg-slate-100 text-slate-600 text-[10px]">{port.year}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
