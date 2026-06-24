/**
 * Simulador de Acordos Comerciais — Economia com preferências tarifárias
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, TrendingDown, ArrowRight, Sparkles, Info, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

interface Acordo {
  nome: string;
  sigla: string;
  paises: string;
  reducaoMedia: number;
  produtosBeneficiados: string;
}

const acordos: Acordo[] = [
  { nome: "Mercosul", sigla: "MERCOSUL", paises: "Brasil, Argentina, Paraguai, Uruguai, Bolívia", reducaoMedia: 100, produtosBeneficiados: "Praticamente todos os produtos com origem nos países-membros (tarifa zero para a maioria)" },
  { nome: "Mercosul-Chile", sigla: "ACE 35", paises: "Mercosul + Chile", reducaoMedia: 100, produtosBeneficiados: "Produtos industriais e agrícolas com certificado de origem" },
  { nome: "Mercosul-Peru", sigla: "ACE 58", paises: "Mercosul + Peru", reducaoMedia: 90, produtosBeneficiados: "Ampla cobertura de produtos industriais" },
  { nome: "Mercosul-Colômbia/Equador/Venezuela", sigla: "ACE 59", paises: "Mercosul + Colômbia, Equador, Venezuela", reducaoMedia: 85, produtosBeneficiados: "Produtos industriais e agrícolas selecionados" },
  { nome: "Mercosul-México", sigla: "ACE 55", paises: "Mercosul + México", reducaoMedia: 80, produtosBeneficiados: "Setor automotivo, máquinas e equipamentos" },
  { nome: "Mercosul-Egito", sigla: "ALC", paises: "Mercosul + Egito", reducaoMedia: 70, produtosBeneficiados: "Carne bovina, soja, milho, açúcar, industrializados" },
  { nome: "Mercosul-Israel", sigla: "ALC", paises: "Mercosul + Israel", reducaoMedia: 75, produtosBeneficiados: "Carnes, grãos, frutas, sucos, tecnologia" },
  { nome: "Mercosul-União Europeia", sigla: "UE-Mercosul", paises: "Mercosul + 27 países da UE", reducaoMedia: 90, produtosBeneficiados: "Em ratificação. Cobertura ampla: agrícola, industrial, serviços (previsão de entrada em vigor 2025–2026)" },
  { nome: "SGPC (Sistema Geral de Preferências)", sigla: "SGPC", paises: "EUA, UE, Japão, Suíça, Noruega, Rússia e outros", reducaoMedia: 30, produtosBeneficiados: "Seletivo — produtos agrícolas e manufaturados específicos. Brasil perdeu SGPC dos EUA em 2019, mantém de outros." },
];

export default function SimuladorAcordosComerciaisPage() {
  useSeo({
    title: "Simulador de Acordos Comerciais — Preferências Tarifárias",
    description: "Descubra quanto você pode economizar em tarifas de importação usando acordos comerciais do Brasil (Mercosul, UE, Chile, Egito, Israel e outros).",
  });

  const [valorExportacao, setValorExportacao] = useState(100000);
  const [tarifaNormal, setTarifaNormal] = useState(15);
  const [acordoSelecionado, setAcordoSelecionado] = useState(0);

  const acordo = acordos[acordoSelecionado];
  const impostoNormal = valorExportacao * (tarifaNormal / 100);
  const impostoPreferencial = impostoNormal * ((100 - acordo.reducaoMedia) / 100);
  const economia = impostoNormal - impostoPreferencial;

  return (
    <SiteLayout>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-amber-500/10 text-amber-600">
              Ferramenta Gratuita
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Simulador de <span className="text-[#D80E16]">Acordos Comerciais</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Descubra quanto você pode economizar utilizando os acordos de preferência tarifária que o Brasil possui com dezenas de países.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-3xl mx-auto">
          {/* Simulador */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-black/[0.06] bg-white p-8 mb-12">
            <h2 className="text-xl font-extrabold text-[#0F111A] mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#D80E16]" />
              Simulador
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-[#5E6278] mb-2">Valor da Exportação</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6278] font-bold">R$</span>
                  <input type="number" value={valorExportacao} onChange={e => setValorExportacao(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/[0.08] text-lg font-bold text-[#0F111A] focus:outline-none focus:border-[#D80E16]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5E6278] mb-2">Tarifa Normal de Importação (%)</label>
                <input type="number" value={tarifaNormal} onChange={e => setTarifaNormal(Number(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-lg font-bold text-[#0F111A] focus:outline-none focus:border-[#D80E16]" />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-[#5E6278] mb-2">Acordo Comercial</label>
              <select value={acordoSelecionado} onChange={e => setAcordoSelecionado(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-sm font-bold text-[#0F111A] focus:outline-none focus:border-[#D80E16]">
                {acordos.map((a, i) => (
                  <option key={i} value={i}>{a.nome} ({a.sigla}) — Redução média {a.reducaoMedia}%</option>
                ))}
              </select>
            </div>

            {/* Resultado */}
            <div className="p-6 rounded-2xl bg-[#0F111A] text-white">
              <p className="text-xs text-white/40 uppercase font-bold mb-2">{acordo.nome} ({acordo.sigla})</p>
              <p className="text-sm text-white/50 mb-4">{acordo.paises}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">Imposto sem Acordo</div>
                  <div className="text-xl font-bold text-red-400">{impostoNormal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/40 uppercase font-bold">Imposto com Acordo</div>
                  <div className="text-xl font-bold text-[#10b981]">{impostoPreferencial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                </div>
              </div>

              <div className="border-t border-white/[0.08] pt-4">
                <div className="text-xs text-white/40 uppercase font-bold">Economia Estimada</div>
                <div className="text-3xl font-extrabold text-[#10b981]">{economia.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                <div className="text-sm text-white/50 mt-1">por operação com certificado de origem</div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Simulação com base na redução tarifária média do acordo. A economia real depende da classificação NCM específica do produto e das regras de origem do acordo. Consulte nossa equipe para uma análise precisa.
              </p>
            </div>
          </motion.div>

          {/* Lista de Acordos */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <h2 className="text-2xl font-extrabold text-[#0F111A] mb-6">Acordos Comerciais do Brasil</h2>
            <div className="space-y-3">
              {acordos.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="rounded-xl border border-black/[0.06] bg-white p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-extrabold text-[#0F111A]">{a.nome} <span className="text-xs text-[#5E6278] font-bold">({a.sigla})</span></h3>
                    <span className="text-sm font-extrabold text-[#10b981]">{a.reducaoMedia}% redução média</span>
                  </div>
                  <p className="text-sm text-[#5E6278] mb-1"><span className="font-bold">Países:</span> {a.paises}</p>
                  <p className="text-sm text-[#5E6278]"><span className="font-bold">Produtos:</span> {a.produtosBeneficiados}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Quer uma análise completa para seu produto?
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">Pesquisa de Mercado para Exportação</h2>
            <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
              Identificamos os melhores mercados para seu produto considerando acordos comerciais, tarifas preferenciais e demanda real.
            </p>
            <Link to="/servicos/pesquisa-mercado-exportacao" className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-2xl transition-colors">
              Solicitar Análise
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
