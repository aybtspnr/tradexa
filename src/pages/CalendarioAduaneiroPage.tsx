/**
 * Calendário Aduaneiro — Feriados nos portos, períodos de pico, janelas de importação
 */
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Anchor, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

interface Evento {
  data: string;
  titulo: string;
  tipo: "feriado" | "pico" | "janela" | "alerta";
  portos: string[];
  descricao: string;
}

const eventos: Evento[] = [
  { data: "01 Jan", titulo: "Ano Novo", tipo: "feriado", portos: ["Todos"], descricao: "Fechamento total. Operações retomam dia 02/01." },
  { data: "15 Jan–28 Fev", titulo: "Pico pré-Ano Novo Chinês", tipo: "pico", portos: ["Shanghai", "Ningbo", "Shenzhen"], descricao: "Alta demanda por contêineres. Fretes sobem 15-30%. Reserve com 3-4 semanas de antecedência." },
  { data: "29 Jan", titulo: "Ano Novo Chinês", tipo: "feriado", portos: ["Shanghai", "Ningbo", "Shenzhen", "Hong Kong"], descricao: "Fábricas e portos parados por 1-2 semanas.Programe embarques antes de 15 Jan." },
  { data: "Fev–Mar", titulo: "Carnaval", tipo: "feriado", portos: ["Santos", "Paranaguá", "Rio de Janeiro"], descricao: "Operação reduzida. Datas variam anualmente." },
  { data: "Mar–Abr", titulo: "Páscoa / Semana Santa", tipo: "feriado", portos: ["Todos"], descricao: "Fechamento na Sexta-feira Santa. Portos operam com escala reduzida." },
  { data: "21 Abr", titulo: "Tiradentes", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional. Portos e órgãos anuentes fechados." },
  { data: "01 Mai", titulo: "Dia do Trabalho", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional. Sem operação." },
  { data: "Mai–Jul", titulo: "Safra de Grãos — Pico de Exportação", tipo: "pico", portos: ["Santos", "Paranaguá", "Rio Grande", "São Francisco do Sul"], descricao: "Alta demanda por contêineres reefer e granéis. Programe com 4 semanas de antecedência." },
  { data: "Jul–Ago", titulo: "Janela de Importação — Natal", tipo: "janela", portos: ["Santos", "Itajaí", "Navegantes"], descricao: "Período ideal para importar produtos de Natal. Embarques até final de Agosto para chegada até Outubro." },
  { data: "07 Set", titulo: "Independência do Brasil", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional." },
  { data: "Set–Out", titulo: "Golden Week (China)", tipo: "feriado", portos: ["Shanghai", "Ningbo", "Shenzhen"], descricao: "Semana de feriados na China (1-7 Out). Fábricas e portos parados. Programe embarques antes de 20 Set." },
  { data: "Out–Nov", titulo: "Janela de Importação — Black Friday", tipo: "janela", portos: ["Santos", "Itajaí", "Viracopos"], descricao: "Embarques até meados de Outubro para chegada antes da Black Friday (final de Novembro)." },
  { data: "12 Out", titulo: "Nossa Senhora Aparecida", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional." },
  { data: "02 Nov", titulo: "Finados", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional." },
  { data: "15 Nov", titulo: "Proclamação da República", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional." },
  { data: "20 Nov", titulo: "Consciência Negra", tipo: "feriado", portos: ["Santos", "Rio de Janeiro", "São Paulo"], descricao: "Feriado em diversos estados e municípios." },
  { data: "25 Dez", titulo: "Natal", tipo: "feriado", portos: ["Todos"], descricao: "Feriado nacional. Fechamento total." },
];

const tipoBadge: Record<string, { label: string; color: string }> = {
  feriado: { label: "Feriado", color: "#ef4444" },
  pico: { label: "Alta Demanda", color: "#f59e0b" },
  janela: { label: "Janela Ideal", color: "#10b981" },
  alerta: { label: "Alerta", color: "#8b5cf6" },
};

export default function CalendarioAduaneiroPage() {
  const [eventosData, setEventosData] = useState<Evento[]>(eventos);
  const [anoCalendario, setAnoCalendario] = useState<number>(2026);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/calendario.json")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const evts = (json.eventos as Evento[]) ?? [];
        setEventosData(evts.length > 0 ? evts : eventos);
        setAnoCalendario(json.ano ?? 2026);
        console.log("Calendário aduaneiro carregado de JSON");
      })
      .catch((err) => {
        if (!cancelled) {
          console.log("Calendário: usando fallback hardcoded", err);
          setEventosData(eventos);
          setAnoCalendario(2026);
        }
      });
    return () => { cancelled = true; };
  }, []);

  useSeo({
    title: "Calendário Aduaneiro 2026 — Feriados e Janelas de Importação",
    description: "Calendário completo com feriados nos portos, períodos de alta demanda e janelas ideais para planejar suas operações de importação e exportação em 2026.",
  });

  return (
    <SiteLayout>
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.12} particleCount={25} color="216,14,22" connectionDist={120} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Ferramenta Gratuita
            </Badge>
            {anoCalendario !== 2026 && (
              <Badge className="mb-2 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-amber-100 text-amber-700">
                Calendário {anoCalendario}
              </Badge>
            )}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Calendário <span className="text-[#D80E16]">Aduaneiro</span> {anoCalendario}
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Feriados nos principais portos do mundo, períodos de pico e janelas ideais para programar suas operações de comércio exterior.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-4xl mx-auto space-y-4">
          {eventosData.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-black/[0.06] bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <Calendar className="w-5 h-5 text-[#D80E16]" />
                <span className="font-extrabold text-[#0F111A]">{e.data}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-[#0F111A]">{e.titulo}</h3>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${tipoBadge[e.tipo].color}15`, color: tipoBadge[e.tipo].color }}>
                    {tipoBadge[e.tipo].label}
                  </span>
                </div>
                <p className="text-sm text-[#5E6278]">{e.descricao}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {e.portos.map(p => (
                    <span key={p} className="text-[10px] font-bold bg-black/[0.04] text-[#5E6278] px-2 py-0.5 rounded">{p}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Precisa de ajuda para planejar?
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">Cotação de Frete Internacional</h2>
          <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
            Planeje seus embarques com antecedência. Nossa equipe compara cotações com 20+ armadores para você escolher a melhor opção.
          </p>
          <Link to="/servicos/cotacao-frete-internacional" className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-2xl transition-colors">
            Solicitar Cotação
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    </SiteLayout>
  );
}
