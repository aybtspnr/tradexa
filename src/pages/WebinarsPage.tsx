/**
 * Webinars e Eventos Online — Conteúdo gratuito sobre comércio exterior
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Calendar, Clock, Users, ArrowRight, Sparkles, PlayCircle, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

interface Webinar {
  titulo: string;
  data: string;
  horario: string;
  tipo: "ao-vivo" | "gravado";
  palestrante: string;
  descricao: string;
  topicos: string[];
  inscricao?: string;
}

const webinars: Webinar[] = [
  {
    titulo: "Como Encontrar Compradores Internacionais com Dados Reais",
    data: "Em breve — inscreva-se para ser avisado",
    horario: "—",
    tipo: "ao-vivo",
    palestrante: "Equipe TRADEXA",
    descricao: "Aprenda a usar dados de importação para identificar compradores qualificados no exterior. Demonstração prática da plataforma com cases reais de exportadores brasileiros.",
    topicos: ["Como acessar dados de importação por país", "Identificação de compradores por NCM", "Qualificação de leads com dados de volume e frequência", "Template de abordagem comercial"],
  },
  {
    titulo: "Desvendando o Drawback: Recupere Impostos na Exportação",
    data: "Em breve — inscreva-se para ser avisado",
    horario: "—",
    tipo: "ao-vivo",
    palestrante: "Especialista em Regimes Aduaneiros",
    descricao: "Entenda os 3 tipos de drawback (Suspensão, Isenção e Restituição), quem pode usar e como calcular a economia real para sua empresa.",
    topicos: ["Drawback Suspensão vs Isenção vs Restituição", "Quem pode se habilitar", "Cálculo prático de economia", "Passo a passo da habilitação"],
  },
  {
    titulo: "Classificação Fiscal Sem Erro: Evite Multas e Reduza Impostos",
    data: "Em breve — inscreva-se para ser avisado",
    horario: "—",
    tipo: "ao-vivo",
    palestrante: "Consultor de Comércio Exterior",
    descricao: "Os erros mais comuns na classificação NCM, como corrigi-los e como identificar oportunidades de economia tributária legal.",
    topicos: ["Regras gerais de classificação (RGI/SH)", "Erros mais comuns e como evitá-los", "Ex-tarifários: como solicitar", "Cases reais de economia com reclassificação"],
  },
  {
    titulo: "Planejamento Logístico 2026: Rotas, Portos e Calendário Aduaneiro",
    data: "Em breve — inscreva-se para ser avisado",
    horario: "—",
    tipo: "ao-vivo",
    palestrante: "Especialista em Logística Internacional",
    descricao: "Como planejar suas operações de importação e exportação em 2026 considerando safras, feriados nos portos e períodos de alta demanda.",
    topicos: ["Calendário aduaneiro e períodos críticos", "Comparativo de portos brasileiros", "Estratégias para evitar sobretaxas na alta temporada", "Negociação com armadores e agentes"],
  },
  {
    titulo: "Inteligência de Mercado para Exportadores: Da Análise à Ação",
    data: "Assista à gravação",
    horario: "45 min",
    tipo: "gravado",
    palestrante: "Equipe TRADEXA",
    descricao: "Como transformar dados de comércio exterior em decisões estratégicas. Demonstração da plataforma TRADEXA com análise de mercado real.",
    topicos: ["Análise de potencial por país-produto", "Benchmark de preços FOB/CIF", "Mapeamento de concorrentes", "Identificação de barreiras e oportunidades"],
  },
];

export default function WebinarsPage() {
  useSeo({
    title: "Webinars e Eventos Online de Comércio Exterior | TRADEXA",
    description: "Participe de webinars gratuitos sobre exportação, importação, drawback, classificação fiscal e logística internacional com especialistas da TRADEXA.",
  });

  return (
    <SiteLayout>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-purple-500/10 text-purple-600">
              Eventos Online
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Webinars e <span className="text-[#D80E16]">Eventos</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Conteúdo gratuito sobre comércio exterior com especialistas. Ao vivo ou gravado — aprenda no seu ritmo.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto">
          {/* Próximos */}
          <div className="mb-16">
            <h2 className="text-2xl font-extrabold text-[#0F111A] mb-2 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-[#D80E16]" />
              Próximos Webinars
            </h2>
            <p className="text-[#5E6278] mb-8">Inscreva-se para ser avisado quando as datas forem confirmadas.</p>

            <div className="space-y-4">
              {webinars.filter(w => w.tipo === "ao-vivo").map((w, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <Video className="w-5 h-5 text-[#D80E16]" />
                      </div>
                      <h3 className="font-extrabold text-[#0F111A]">{w.titulo}</h3>
                    </div>
                    <Badge className="bg-red-100 text-red-700 border-0 font-bold text-[10px] uppercase">Ao Vivo</Badge>
                  </div>
                  <p className="text-sm text-[#5E6278] leading-relaxed mb-4">{w.descricao}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {w.topicos.map(t => (
                      <span key={t} className="text-[10px] font-bold bg-black/[0.04] text-[#5E6278] px-2 py-1 rounded">{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-[#5E6278]">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {w.palestrante}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {w.data}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to="/contato" className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-2xl transition-colors">
                Quero ser avisado dos próximos
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Gravações */}
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F111A] mb-2 flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-[#D80E16]" />
              Gravações Disponíveis
            </h2>
            <p className="text-[#5E6278] mb-8">Assista quando quiser.</p>

            <div className="space-y-4">
              {webinars.filter(w => w.tipo === "gravado").map((w, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-slate-600" />
                      </div>
                      <h3 className="font-extrabold text-[#0F111A]">{w.titulo}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-[#5E6278] font-bold"><Clock className="w-4 h-4" /> {w.horario}</span>
                  </div>
                  <p className="text-sm text-[#5E6278] leading-relaxed mb-4">{w.descricao}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {w.topicos.map(t => (
                      <span key={t} className="text-[10px] font-bold bg-black/[0.04] text-[#5E6278] px-2 py-1 rounded">{t}</span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Quer conteúdo personalizado para sua empresa?
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">Treinamento Corporativo</h2>
            <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
              Webinar exclusivo para sua equipe sobre temas específicos de comércio exterior. Entre em contato para agendar.
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
