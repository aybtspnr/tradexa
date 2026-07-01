/**
 * Precificação Inteligente — Ferramenta gratuita de consulta de preços de exportação
 * Para dados em tempo real, redireciona ao serviço de Pesquisa de Mercado.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  DollarSign, Search, TrendingUp, TrendingDown, ArrowRight,
  Sparkles, Info, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Dados de referência para HS codes comuns ───
interface HSData {
  product: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  topDestinations: { country: string; price: number }[];
}

const commonHSData: Record<string, HSData> = {
  "090111": {
    product: "Café Verde Não Torrado", avgPrice: 4.85, minPrice: 3.20, maxPrice: 7.50, unit: "USD/kg",
    topDestinations: [
      { country: "EUA", price: 5.10 }, { country: "Alemanha", price: 5.45 },
      { country: "Itália", price: 4.90 }, { country: "Japão", price: 5.80 }, { country: "Bélgica", price: 4.60 },
    ],
  },
  "020130": {
    product: "Carne Bovina Fresca Desossada", avgPrice: 5.20, minPrice: 3.80, maxPrice: 8.50, unit: "USD/kg",
    topDestinations: [
      { country: "China", price: 5.50 }, { country: "EUA", price: 6.20 },
      { country: "Chile", price: 4.80 }, { country: "Egito", price: 3.90 }, { country: "UE", price: 6.00 },
    ],
  },
  "120190": {
    product: "Soja em Grão", avgPrice: 0.52, minPrice: 0.42, maxPrice: 0.65, unit: "USD/kg",
    topDestinations: [
      { country: "China", price: 0.55 }, { country: "Espanha", price: 0.48 },
      { country: "Tailândia", price: 0.50 }, { country: "Países Baixos", price: 0.46 },
    ],
  },
  "260111": {
    product: "Minério de Ferro", avgPrice: 0.11, minPrice: 0.08, maxPrice: 0.15, unit: "USD/kg",
    topDestinations: [
      { country: "China", price: 0.12 }, { country: "Japão", price: 0.10 },
      { country: "Coreia do Sul", price: 0.11 }, { country: "Malásia", price: 0.09 },
    ],
  },
  "170114": {
    product: "Açúcar de Cana Bruto", avgPrice: 0.48, minPrice: 0.38, maxPrice: 0.58, unit: "USD/kg",
    topDestinations: [
      { country: "Índia", price: 0.45 }, { country: "China", price: 0.50 },
      { country: "Argélia", price: 0.47 }, { country: "Emirados Árabes", price: 0.49 },
    ],
  },
  "020714": {
    product: "Carne de Frango Congelada", avgPrice: 2.10, minPrice: 1.60, maxPrice: 2.80, unit: "USD/kg",
    topDestinations: [
      { country: "China", price: 2.30 }, { country: "Japão", price: 2.50 },
      { country: "Arábia Saudita", price: 1.90 }, { country: "Emirados Árabes", price: 2.10 },
    ],
  },
  "470329": {
    product: "Celulose Kraft Branqueada", avgPrice: 0.62, minPrice: 0.50, maxPrice: 0.78, unit: "USD/kg",
    topDestinations: [
      { country: "China", price: 0.65 }, { country: "EUA", price: 0.70 },
      { country: "Itália", price: 0.60 }, { country: "Países Baixos", price: 0.58 },
    ],
  },
  "870323": {
    product: "Veículos Automóveis (1500-3000cc)", avgPrice: 28000, minPrice: 18000, maxPrice: 45000, unit: "USD/unidade",
    topDestinations: [
      { country: "Argentina", price: 25000 }, { country: "México", price: 30000 },
      { country: "Colômbia", price: 27000 }, { country: "Chile", price: 29000 },
    ],
  },
};

function formatUSD(v: number): string {
  if (v >= 1_000_000) return `US$ ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1000) return `US$ ${(v / 1000).toFixed(0)}K`;
  return `US$ ${v.toFixed(2)}`;
}

export default function PrecificacaoExportacaoPage() {
  const [hsCode, setHsCode] = useState("");
  const [userPrice, setUserPrice] = useState("");
  const [showResult, setShowResult] = useState(false);

  useSeo({
    title: "Precificação Inteligente — Preços de Exportação | TRADEXA",
    description: "Consulte preços de referência de exportação por HS code. Dados de mercado para café, soja, carne, açúcar e mais.",
    canonical: "https://www.tradexa.com.br/ferramentas/precificacao-exportacao",
  });

  const data = commonHSData[hsCode.trim()];
  const userPriceNum = parseFloat(userPrice);
  const priceComparison = data && userPriceNum > 0 ? ((userPriceNum - data.avgPrice) / data.avgPrice * 100) : null;

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Precificação de Exportação</h2>
        <p>A ferramenta de precificação de exportação da TRADEXA ajuda exportadores brasileiros a definir o preço final de venda no mercado internacional com confiança. A precificação correta é um dos maiores desafios do exportador iniciante: é preciso considerar não apenas o custo de produção, mas também o frete internacional, seguro de carga, impostos e taxas no país de destino, margem de lucro desejada e taxas portuárias em ambas as pontas. Esta ferramenta consulta preços de referência de exportação por código HS (Harmonized System) para os principais produtos brasileiros: café verde (HS 090111), carne bovina fresca (HS 020130), soja em grão (HS 120190), minério de ferro (HS 260111), açúcar bruto (HS 170114) e muitos outros. Os dados incluem preço médio, mínimo e máximo praticados nos últimos 12 meses, além dos principais países de destino com seus respectivos preços de importação. Com essas informações, você pode comparar seu preço com o mercado internacional e ajustar sua estratégia para ser competitivo sem sacrificar a margem de lucro. Para análises mais detalhadas com dados em tempo real e séries históricas completas, a TRADEXA oferece o serviço de Pesquisa de Mercado de Exportação, com consultoria personalizada para o seu produto e setor.</p>
      </div>
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Preços de Referência
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4">
              Precificação <span className="text-[#D80E16]">Inteligente</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-2xl mx-auto">
              Consulte preços de referência de exportação para os principais produtos brasileiros.
              Para análises detalhadas e em tempo real, fale com nossa equipe.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[180px]">
                <label className="text-[11px] font-bold text-[#5E6278] block mb-1">HS Code (6 dígitos)</label>
                <input type="text" value={hsCode} onChange={(e) => { setHsCode(e.target.value); setShowResult(false); }}
                  placeholder="Ex: 090111 (café)" maxLength={6}
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10" />
                <p className="text-[10px] text-[#5E6278] mt-1">
                  HS codes com dados: 090111, 020130, 120190, 260111, 170114, 020714, 470329, 870323
                </p>
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="text-[11px] font-bold text-[#5E6278] block mb-1">Seu preço (USD)</label>
                <input type="number" value={userPrice} onChange={(e) => setUserPrice(e.target.value)}
                  placeholder="Opcional" step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] bg-white text-sm focus:outline-none focus:border-[#D80E16]/30 focus:ring-2 focus:ring-[#D80E16]/10" />
              </div>
              <Button onClick={() => setShowResult(true)}
                className="gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-6 py-3 rounded-xl">
                <Search className="w-4 h-4" /> Consultar
              </Button>
            </div>
          </motion.div>

          {/* Results */}
          {showResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {data ? (
                <>
                  {/* Product info */}
                  <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#D80E16]/5 flex items-center justify-center text-2xl"></div>
                      <div>
                        <h2 className="text-xl font-extrabold text-[#0F111A]">{data.product}</h2>
                        <p className="text-sm text-[#5E6278]">HS {hsCode} — Preços FOB de referência (Brasil, 2024-2025)</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <DollarSign className="w-5 h-5 text-[#D80E16]" />
                        <Badge className="text-[10px] bg-[#D80E16]/10 text-[#D80E16] border-0">Médio</Badge>
                      </div>
                      <p className="text-xs text-[#5E6278] mb-1">Preço médio</p>
                      <p className="text-2xl font-extrabold text-[#0F111A]">{formatUSD(data.avgPrice)}</p>
                      <p className="text-[10px] text-[#5E6278] mt-1">{data.unit}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingDown className="w-5 h-5 text-emerald-500" />
                        <Badge className="text-[10px] bg-emerald-50 text-emerald-600 border-0">Mín</Badge>
                      </div>
                      <p className="text-xs text-[#5E6278] mb-1">Menor preço</p>
                      <p className="text-2xl font-extrabold text-emerald-600">{formatUSD(data.minPrice)}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <TrendingUp className="w-5 h-5 text-red-500" />
                        <Badge className="text-[10px] bg-red-50 text-red-600 border-0">Máx</Badge>
                      </div>
                      <p className="text-xs text-[#5E6278] mb-1">Maior preço</p>
                      <p className="text-2xl font-extrabold text-red-500">{formatUSD(data.maxPrice)}</p>
                    </div>
                  </div>

                  {/* User comparison */}
                  {priceComparison !== null && (
                    <div className={`rounded-2xl border p-6 shadow-sm ${
                      Math.abs(priceComparison) <= 10 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                    }`}>
                      <h3 className="text-lg font-extrabold mb-3">
                        {Math.abs(priceComparison) <= 10 ? "Seu preço está competitivo" : "Atenção ao posicionamento"}
                      </h3>
                      <div className="flex items-baseline gap-4 flex-wrap">
                        <div><p className="text-xs text-[#5E6278]">Seu preço</p><p className="text-2xl font-extrabold">{formatUSD(userPriceNum)}</p></div>
                        <span className="text-xl text-[#5E6278]">vs</span>
                        <div><p className="text-xs text-[#5E6278]">Média mercado</p><p className="text-2xl font-extrabold">{formatUSD(data.avgPrice)}</p></div>
                        <Badge className={`text-sm px-3 py-1.5 font-extrabold ${Math.abs(priceComparison) <= 10 ? "bg-emerald-500" : "bg-red-500"} text-white`}>
                          {priceComparison > 0 ? "+" : ""}{priceComparison.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Chart */}
                  <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-[#D80E16]" /> Preço Médio por Destino
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.topDestinations} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: "#5E6278" }} />
                          <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: "#5E6278" }} width={100} />
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)" }}
                            formatter={(v: number) => [formatUSD(v), "Preço"]} />
                          <Bar dataKey="price" radius={[0, 6, 6, 0]} fill="#D80E16" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-800">Preços de referência</p>
                      <p className="text-xs text-blue-600">
                        Preços FOB médios observados em 2024-2025.
                        Para análises detalhadas com dados em tempo real por país e comprador, consulte nossa Pesquisa de Mercado.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* No data for this HS code */
                <div className="bg-white rounded-2xl border border-black/[0.06] p-8 shadow-sm text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-extrabold text-[#0F111A] mb-2">HS Code não encontrado na base gratuita</h3>
                  <p className="text-sm text-[#5E6278] max-w-md mx-auto mb-6">
                    Nossa ferramenta gratuita cobre os principais produtos da pauta exportadora brasileira.
                    Para seu produto específico, nossa equipe pode fazer uma análise completa de precificação.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link to="/servicos/pesquisa-mercado-exportacao"
                      className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-6 py-3 rounded-xl transition-colors">
                      <Sparkles className="w-4 h-4" /> Pesquisa de Mercado <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Bottom CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-2xl bg-gradient-to-br from-[#D80E16] to-[#b80c12] p-8 md:p-10 text-white overflow-hidden text-center">
            <h3 className="text-2xl font-extrabold mb-3">Precisa de dados em tempo real?</h3>
            <p className="text-white/80 max-w-lg mx-auto mb-6">
              Nossa Pesquisa de Mercado inclui precificação atualizada, concorrência e canais de distribuição para qualquer HS code e destino.
            </p>
            <Link to="/servicos/pesquisa-mercado-exportacao"
              className="inline-flex items-center gap-2 bg-white text-[#D80E16] hover:bg-white/90 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all">
              <Sparkles className="w-5 h-5" /> Pesquisa de Mercado <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
