/**
 * Calculadora de Drawback — Simulação de recuperação de impostos na exportação
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, ArrowRight, Sparkles, Info, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

export default function CalculadoraDrawbackPage() {
  useSeo({
    title: "Calculadora de Drawback — Simule Impostos na Exportação",
    description: "Simule quanto você pode recuperar em impostos utilizando o regime de Drawback na exportação. Cálculo de II, IPI, PIS e COFINS.",
  });

  const [valorImportado, setValorImportado] = useState(100000);
  const [percentualExportado, setPercentualExportado] = useState(100);

  // Simulação simplificada: II ~12%, IPI ~5%, PIS ~2.1%, COFINS ~9.65%
  const ii = valorImportado * 0.12;
  const ipi = valorImportado * 0.05;
  const pis = valorImportado * 0.021;
  const cofins = valorImportado * 0.0965;
  const totalImpostos = ii + ipi + pis + cofins;
  const recuperacao = totalImpostos * (percentualExportado / 100);
  const economiaAnual = recuperacao * 12;

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Calculadora de Drawback</h2>
        <p>A calculadora de drawback da TRADEXA permite simular a recuperação de impostos na exportação. O regime de drawback suspende ou isenta tributos federais (II, IPI, PIS e COFINS) sobre insumos importados que serão utilizados na fabricação de produtos exportados. Existem três modalidades principais: drawback isenção (para reposição de estoque de insumos já importados), drawback suspensão (para insumos a serem importados e transformados) e drawback restituição (para tributos já pagos). Esta ferramenta calcula automaticamente quanto sua empresa pode economizar em cada operação, comparando o custo com e sem o benefício fiscal. O cálculo considera o valor dos insumos importados, o percentual exportado da produção e as alíquotas vigentes de II (Imposto de Importação ~12%), IPI (Imposto sobre Produtos Industrializados ~5%), PIS (Programa de Integração Social ~2.1%) e COFINS (Contribuição para o Financiamento da Seguridade Social ~9.65%). Ideal para indústrias exportadoras que querem aumentar sua competitividade internacional reduzindo a carga tributária sobre insumos importados. O regime é regulamentado pela Receita Federal e exige comprovação de exportação no prazo de 1 ano para suspensão e 2 anos para isenção.</p>
      </div>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-emerald-500/10 text-emerald-600">
              Ferramenta Gratuita
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Calculadora de <span className="text-[#D80E16]">Drawback</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Simule quanto você pode recuperar de impostos utilizando o regime de Drawback — suspensão ou isenção de tributos na importação de insumos para exportação.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-3xl mx-auto">
          {/* Simulador */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-black/[0.06] bg-white p-8 mb-12">
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[#D80E16]" />
              Simulador de Drawback
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#5E6278] mb-2">
                  Valor médio importado por mês (insumos)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6278] font-bold">R$</span>
                  <input
                    type="number"
                    value={valorImportado}
                    onChange={e => setValorImportado(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/[0.08] text-lg font-bold text-[#0F111A] focus:outline-none focus:border-[#D80E16]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#5E6278] mb-2">
                  Percentual destinado à exportação (%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={percentualExportado}
                  onChange={e => setPercentualExportado(Number(e.target.value))}
                  className="w-full accent-[#D80E16]"
                />
                <div className="text-center text-2xl font-extrabold text-[#D80E16] mt-1">{percentualExportado}%</div>
              </div>
            </div>

            {/* Resultados */}
            <div className="mt-8 p-6 rounded-2xl bg-[#0F111A] text-white">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wide mb-4">Estimativa Mensal</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "II (12%)", value: ii },
                  { label: "IPI (5%)", value: ipi },
                  { label: "PIS (2.1%)", value: pis },
                  { label: "COFINS (9.65%)", value: cofins },
                ].map(t => (
                  <div key={t.label}>
                    <div className="text-[10px] text-white/40 uppercase font-bold">{t.label}</div>
                    <div className="text-sm md:text-base font-bold text-white truncate">{t.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.08] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-white/40 uppercase font-bold">Recuperação Mensal</div>
                  <div className="text-xl md:text-2xl font-extrabold text-[#10b981] truncate">{recuperacao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase font-bold">Economia Anual Estimada</div>
                  <div className="text-xl md:text-2xl font-extrabold text-[#10b981] truncate">{economiaAnual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Esta é uma simulação simplificada. Os valores reais dependem do regime específico (Suspensão, Isenção ou Restituição), da classificação NCM dos insumos e do produto final. Consulte nossa equipe para uma análise personalizada.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Quer saber exatamente quanto pode recuperar?
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">Consultoria de Drawback</h2>
            <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
              Nossa equipe analisa seu caso real, identifica o melhor regime e calcula a economia exata para sua operação.
            </p>
            <Link to="/contato" className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-2xl transition-colors">
              Falar com Especialista
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
