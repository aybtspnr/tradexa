"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  Search, Loader2, Globe, TrendingUp, TrendingDown,
  DollarSign, BarChart3, AlertCircle, Download, FileText,
  Target, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useSeo } from "@/hooks/use-seo";
import { cn } from "@/lib/utils";
import GlobalMarketSection from "@/components/intel/GlobalMarketSection";

const API = "/api/intel/global";

interface BrazilMacro {
  gdp?: number; population?: number; gdp_growth?: number;
  inflation?: number; exports?: number; imports?: number;
}

interface PartnerData {
  country: string; value: number;
}

interface MarketShareData {
  ncm: string; year: number;
  brazil: { export_total: number };
  partners: PartnerData[];
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("pt-BR");
}

const PIE_COLORS = ["#D80E16", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16"];

export default function NcmGlobalDashboard() {
  useSeo({
    title: "NCM Global Dashboard — TRADEXA",
    description: "Dashboard completo para qualquer NCM com dados de market share global, indicadores macroeconômicos e comparativo competitivo.",
    keywords: "NCM dashboard, market share global, comércio exterior, indicadores, BCB, World Bank, COMEXSTAT, tradexa",
  });

  const [ncm, setNcm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    marketShare: MarketShareData | null;
    brazilMacro: BrazilMacro | null;
    exchangeRate: number | null;
    selic: number | null;
    ipca: number | null;
  }>({ marketShare: null, brazilMacro: null, exchangeRate: null, selic: null, ipca: null });

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async () => {
    const cleanNcm = ncm.replace(/\D/g, "").slice(0, 6);
    if (cleanNcm.length < 4) {
      setError("Digite pelo menos 4 dígitos do NCM"); return;
    }
    setLoading(true); setError(null);

    try {
      const results = await Promise.allSettled([
        fetch(`${API}/market-share/${cleanNcm}`).then(r => r.json()),
        fetch(`${API}/worldbank/country/BRA`).then(r => r.json()),
        fetch(`${API}/bcb/exchange-rate`).then(r => r.json()),
        fetch(`${API}/bcb/selic`).then(r => r.json()),
        fetch(`${API}/bcb/ipca`).then(r => r.json()),
      ]);

      const ms = results[0].status === "fulfilled" ? results[0].value as MarketShareData : null;
      const bra = results[1].status === "fulfilled" ? results[1].value as BrazilMacro : null;

      let exchangeRate: number | null = null;
      if (results[2].status === "fulfilled") {
        const d = results[2].value as any;
        exchangeRate = typeof d === "object" ? Number(d.value || d.valor || 0) : null;
      }
      let selic: number | null = null;
      if (results[3].status === "fulfilled") {
        const d = results[3].value as any;
        selic = typeof d === "object" ? Number(d.value || d.valor || 0) : null;
      }
      let ipca: number | null = null;
      if (results[4].status === "fulfilled") {
        const d = results[4].value as any;
        ipca = typeof d === "object" ? Number(d.value || d.valor || 0) : null;
      }

      setData({ marketShare: ms, brazilMacro: bra, exchangeRate, selic, ipca });

      // Scroll to results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e: any) {
      setError(e.message || "Erro ao buscar dados");
    }
    setLoading(false);
  }, [ncm]);

  const { marketShare, brazilMacro, exchangeRate, selic, ipca } = data;

  const partners = marketShare?.partners || [];
  const totalExport = marketShare?.brazil?.export_total || 0;

  const handleExportPDF = useCallback(async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const M = 15;
      let y = 16;

      // Red bar
      doc.setFillColor(216, 14, 22);
      doc.rect(0, 0, W, 4, "F");

      // Logo placeholder
      doc.setFontSize(18);
      doc.setTextColor(216, 14, 22);
      doc.setFont("helvetica", "bold");
      doc.text("TRADEXA", M, y + 8);
      y += 16;

      // Title
      doc.setFontSize(16);
      doc.setTextColor(30, 30, 30);
      doc.text(`NCM Global Dashboard — ${ncm.replace(/\D/g, "").slice(0, 6)}`, M, y);
      y += 8;

      doc.setDrawColor(216, 14, 22);
      doc.setLineWidth(0.3);
      doc.line(M, y, W - M, y);
      y += 6;

      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, M, y);
      y += 10;

      // KPIs
      doc.setFillColor(248, 248, 250);
      doc.roundedRect(M, y, W - M * 2, 30, 2, 2, "F");

      const kpiW = (W - M * 2 - 8) / 3;
      const kpis = [
        { label: "EXPORTAÇÃO NCM", value: totalExport > 0 ? formatCurrency(totalExport) : "—" },
        { label: "USD/BRL", value: exchangeRate ? `R$ ${exchangeRate.toFixed(3)}` : "—" },
        { label: "SELIC", value: selic ? `${selic.toFixed(2)}%` : "—" },
      ];
      kpis.forEach((k, i) => {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "bold");
        doc.text(k.label, M + 4 + i * (kpiW + 4), y + 6);
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.text(k.value, M + 4 + i * (kpiW + 4), y + 16);
      });
      y += 38;

      // Partners table
      if (partners.length > 0) {
        doc.setFillColor(216, 14, 22);
        doc.rect(M, y, 1.5, 6, "F");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.text("Top Parceiros", M + 4, y + 5);
        y += 9;

        autoTable(doc, {
          startY: y,
          head: [["#", "País", "Valor FOB", "%"]],
          body: partners.slice(0, 10).map((p, i) => [
            String(i + 1), p.country,
            formatCurrency(p.value),
            totalExport > 0 ? `${((p.value / totalExport) * 100).toFixed(1)}%` : "—",
          ]),
          theme: "striped",
          headStyles: { fillColor: [216, 14, 22], textColor: 255, fontSize: 7, fontStyle: "bold" },
          bodyStyles: { fontSize: 7 },
          margin: { left: M, right: M },
        });
        y = (doc as any).lastAutoTable?.finalY + 6 || y + 30;
      }

      // Brazil macro
      if (brazilMacro) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFillColor(216, 14, 22);
        doc.rect(M, y, 1.5, 6, "F");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        doc.setFont("helvetica", "bold");
        doc.text("Indicadores Brasil", M + 4, y + 5);
        y += 9;

        autoTable(doc, {
          startY: y,
          head: [["Indicador", "Valor"]],
          body: [
            ["PIB", brazilMacro.gdp ? formatCurrency(brazilMacro.gdp) : "—"],
            ["Crescimento PIB", brazilMacro.gdp_growth ? `${brazilMacro.gdp_growth.toFixed(1)}%` : "—"],
            ["Exportações Totais", brazilMacro.exports ? formatCurrency(brazilMacro.exports) : "—"],
            ["Importações Totais", brazilMacro.imports ? formatCurrency(brazilMacro.imports) : "—"],
            ["População", brazilMacro.population ? fmtNumber(brazilMacro.population) : "—"],
          ],
          theme: "striped",
          headStyles: { fillColor: [216, 14, 22], textColor: 255, fontSize: 7, fontStyle: "bold" },
          bodyStyles: { fontSize: 7 },
          margin: { left: M, right: M },
        });
      }

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text("TRADEXA Market Intelligence  •  Fonte: BCB, World Bank, COMEXSTAT  •  tradexa.com.br", W / 2, 282, { align: "center" });

      doc.save(`tradexa-ncm-dashboard-${ncm.replace(/\D/g, "").slice(0, 6)}-${Date.now()}.pdf`);
    } catch (e) {
      console.error("PDF export error:", e);
    }
  }, [ncm, marketShare, brazilMacro, exchangeRate, selic, ipca, partners, totalExport]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
          <Globe className="w-6 h-6 text-[#D80E16]" />
          NCM Global Dashboard
        </h1>
        <p className="text-sm text-slate-600">
          Dashboard completo para qualquer NCM: market share, câmbio, indicadores macro, top parceiros e comparativo competitivo em um só lugar.
        </p>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex gap-3 max-w-lg mx-auto">
          <div className="flex-1">
            <Input
              placeholder="NCM (ex: 3004, 8471, 3926)..."
              value={ncm}
              onChange={e => setNcm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="h-12 text-base font-mono"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-[#D80E16] hover:bg-[#b80c12] text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Dashboard
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D80E16] mx-auto" />
            <p className="text-sm text-slate-600">Carregando dashboard global...</p>
          </div>
        </div>
      )}

      {/* Results Dashboard */}
      {data.marketShare && !loading && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Export PDF button */}
          <div className="flex justify-end">
            <Button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all inline-flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Relatório PDF
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Exportação NCM</div>
              <div className="text-lg font-black text-slate-900">{totalExport > 0 ? formatCurrency(totalExport) : "—"}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">NCM {ncm.replace(/\D/g, "").slice(0, 6)}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">USD/BRL</div>
              <div className={cn("text-lg font-black", exchangeRate && exchangeRate > 5.5 ? "text-red-600" : "text-emerald-600")}>
                R$ {exchangeRate?.toFixed(3) || "—"}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">PTAX</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">SELIC</div>
              <div className="text-lg font-black text-slate-900">{selic ? `${selic.toFixed(2)}%` : "—"}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Taxa atual</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">IPCA</div>
              <div className="text-lg font-black text-slate-900">{ipca ? `${ipca.toFixed(2)}%` : "—"}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Inflação</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">PIB</div>
              <div className="text-lg font-black text-slate-900">{brazilMacro?.gdp ? formatCurrency(brazilMacro.gdp) : "—"}</div>
              <div className={cn("text-[10px] mt-0.5", (brazilMacro?.gdp_growth || 0) > 0 ? "text-emerald-500" : "text-red-500")}>
                {(brazilMacro?.gdp_growth || 0) > 0 ? "▲" : "▼"} {brazilMacro?.gdp_growth?.toFixed(1) || "—"}%
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Top Partners */}
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Top Parceiros Comerciais</h3>
                  <Badge variant="secondary" className="text-[10px]">COMEXSTAT</Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={partners.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v: number) => formatCurrency(v)} />
                    <YAxis dataKey="country" type="category" tick={{ fill: "#94a3b8", fontSize: 9 }} width={100} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                      formatter={(v: number) => [formatCurrency(v), "FOB"]} />
                    <Bar dataKey="value" fill="#D80E16" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Market Distribution */}
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800">Distribuição por País</h3>
                  <Badge variant="secondary" className="text-[10px]">% share</Badge>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={partners.slice(0, 8).map(p => ({ name: p.country, value: p.value }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={100}
                      paddingAngle={2} dataKey="value"
                    >
                      {partners.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#fff", borderRadius: "8px", fontSize: "11px" }}
                      formatter={(v: number) => [formatCurrency(v), "FOB"]} />
                    <Legend wrapperStyle={{ fontSize: "9px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Partners Table */}
          <Card className="rounded-2xl border border-slate-200">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Detalhamento por País</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-[10px] font-bold text-slate-500 uppercase">#</th>
                      <th className="text-left py-2 pr-4 text-[10px] font-bold text-slate-500 uppercase">País</th>
                      <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase">Valor FOB</th>
                      <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-500 uppercase">% Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.slice(0, 15).map((p, i) => (
                      <tr key={p.country} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 pr-4 text-xs text-slate-400">{i + 1}</td>
                        <td className="py-2.5 pr-4 text-xs font-medium text-slate-700">{p.country}</td>
                        <td className="text-right py-2.5 px-3 text-xs font-bold text-slate-800">{formatCurrency(p.value)}</td>
                        <td className="text-right py-2.5 px-3 text-xs font-bold text-slate-600">
                          {totalExport > 0 ? ((p.value / totalExport) * 100).toFixed(1) : "—"}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Brazil Macro */}
          {brazilMacro && (
            <Card className="rounded-2xl border border-slate-200">
              <CardContent className="p-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#D80E16]" />
                  Indicadores Macroeconômicos — Brasil
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">PIB</p>
                    <p className="text-sm font-black text-slate-800">{brazilMacro.gdp ? formatCurrency(brazilMacro.gdp) : "—"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Crescimento</p>
                    <p className="text-sm font-black text-emerald-700">{(brazilMacro.gdp_growth || 0) > 0 ? "+" : ""}{brazilMacro.gdp_growth?.toFixed(1) || "—"}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Exportações Totais</p>
                    <p className="text-sm font-black text-blue-700">{brazilMacro.exports ? formatCurrency(brazilMacro.exports) : "—"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 text-center">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Importações Totais</p>
                    <p className="text-sm font-black text-amber-700">{brazilMacro.imports ? formatCurrency(brazilMacro.imports) : "—"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 text-center">
                    <p className="text-[10px] font-bold text-purple-600 uppercase">População</p>
                    <p className="text-sm font-black text-purple-700">{brazilMacro.population ? fmtNumber(brazilMacro.population) : "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export PDF Footer */}
          <div className="text-center">
            <Button
              onClick={handleExportPDF}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Baixar Relatório em PDF
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
