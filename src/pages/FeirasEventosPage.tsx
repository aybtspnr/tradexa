/**
 * Página de Feiras e Eventos Internacionais 2026
 * Calendário com os principais eventos de comércio exterior relevantes para exportadores brasileiros.
 */
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, MapPin, ExternalLink, Filter, Globe,
  UtensilsCrossed, Sprout, Shirt, Wrench, Monitor, FlaskConical, Sofa, Ship,
  ArrowRight, Sparkles, Building2, Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

// ─── Dados reais de feiras 2026 ───
interface Feira {
  nome: string;
  data: string;
  cidade: string;
  pais: string;
  setor: string;
  site: string;
  brasilPavilhao: boolean;
  destaque: boolean;
  icon: React.ElementType;
}

const feiras: Feira[] = [
  // Alimentos e Bebidas
  { nome: "SIAL Paris 2026", data: "19-23 Out", cidade: "Paris", pais: "França", setor: "Alimentos e Bebidas", site: "https://www.sialparis.com/", brasilPavilhao: true, destaque: true, icon: UtensilsCrossed },
  { nome: "Anuga 2026", data: "10-14 Out", cidade: "Colônia", pais: "Alemanha", setor: "Alimentos e Bebidas", site: "https://www.anuga.com/", brasilPavilhao: true, destaque: true, icon: UtensilsCrossed },
  { nome: "Gulfood 2026", data: "16-20 Fev", cidade: "Dubai", pais: "Emirados Árabes", setor: "Alimentos e Bebidas", site: "https://www.gulfood.com/", brasilPavilhao: true, destaque: false, icon: UtensilsCrossed },
  { nome: "Fancy Food Show Summer", data: "28-30 Jun", cidade: "Nova York", pais: "EUA", setor: "Alimentos e Bebidas", site: "https://www.specialtyfood.com/", brasilPavilhao: true, destaque: false, icon: UtensilsCrossed },
  { nome: "APAS Show 2026", data: "18-21 Mai", cidade: "São Paulo", pais: "Brasil", setor: "Alimentos e Bebidas", site: "https://www.apasshow.com.br/", brasilPavilhao: true, destaque: true, icon: UtensilsCrossed },

  // Agronegócio
  { nome: "Agrishow 2026", data: "27 Abr-1 Mai", cidade: "Ribeirão Preto", pais: "Brasil", setor: "Agronegócio", site: "https://www.agrishow.com.br/", brasilPavilhao: true, destaque: true, icon: Sprout },
  { nome: "Expointer 2026", data: "29 Ago-6 Set", cidade: "Esteio", pais: "Brasil", setor: "Agronegócio", site: "https://www.expointer.rs.gov.br/", brasilPavilhao: true, destaque: false, icon: Sprout },
  { nome: "World Ag Expo 2026", data: "10-12 Fev", cidade: "Tulare, CA", pais: "EUA", setor: "Agronegócio", site: "https://www.worldagexpo.com/", brasilPavilhao: false, destaque: false, icon: Sprout },

  // Moda e Têxtil
  { nome: "Première Vision Paris", data: "7-9 Jul", cidade: "Paris", pais: "França", setor: "Moda e Têxtil", site: "https://www.premierevision.com/", brasilPavilhao: true, destaque: false, icon: Shirt },
  { nome: "Texworld NYC", data: "20-22 Jul", cidade: "Nova York", pais: "EUA", setor: "Moda e Têxtil", site: "https://texworld-nyc.us.messefrankfurt.com/", brasilPavilhao: true, destaque: false, icon: Shirt },
  { nome: "Febratex 2026", data: "18-21 Ago", cidade: "Blumenau", pais: "Brasil", setor: "Moda e Têxtil", site: "https://www.febratex.com.br/", brasilPavilhao: true, destaque: false, icon: Shirt },
  { nome: "Feira do Empreendedor SEBRAE", data: "1-5 Out", cidade: "São Paulo", pais: "Brasil", setor: "Moda e Têxtil", site: "https://www.sebrae.com.br/", brasilPavilhao: true, destaque: false, icon: Shirt },

  // Máquinas e Equipamentos
  { nome: "Hannover Messe 2026", data: "20-24 Abr", cidade: "Hanover", pais: "Alemanha", setor: "Máquinas e Equipamentos", site: "https://www.hannovermesse.de/", brasilPavilhao: true, destaque: true, icon: Wrench },
  { nome: "MEC SHOW 2026", data: "4-7 Ago", cidade: "Serra", pais: "Brasil", setor: "Máquinas e Equipamentos", site: "https://www.mecshow.com.br/", brasilPavilhao: true, destaque: false, icon: Wrench },
  { nome: "Feimec 2026", data: "5-9 Mai", cidade: "São Paulo", pais: "Brasil", setor: "Máquinas e Equipamentos", site: "https://www.feimec.com.br/", brasilPavilhao: true, destaque: false, icon: Wrench },

  // Tecnologia
  { nome: "CES 2026", data: "6-9 Jan", cidade: "Las Vegas", pais: "EUA", setor: "Tecnologia", site: "https://www.ces.tech/", brasilPavilhao: true, destaque: true, icon: Monitor },
  { nome: "MWC Barcelona 2026", data: "2-5 Mar", cidade: "Barcelona", pais: "Espanha", setor: "Tecnologia", site: "https://www.mwcbarcelona.com/", brasilPavilhao: true, destaque: false, icon: Monitor },
  { nome: "Web Summit Rio 2026", data: "27-30 Abr", cidade: "Rio de Janeiro", pais: "Brasil", setor: "Tecnologia", site: "https://rio.websummit.com/", brasilPavilhao: true, destaque: true, icon: Monitor },

  // Cosméticos
  { nome: "Cosmoprof Bologna 2026", data: "19-22 Mar", cidade: "Bolonha", pais: "Itália", setor: "Cosméticos", site: "https://www.cosmoprof.com/", brasilPavilhao: true, destaque: false, icon: FlaskConical },
  { nome: "Beautyworld Middle East", data: "26-28 Out", cidade: "Dubai", pais: "Emirados Árabes", setor: "Cosméticos", site: "https://beautyworldme.com/", brasilPavilhao: true, destaque: false, icon: FlaskConical },

  // Móveis e Decoração
  { nome: "Salão do Móvel de Milão", data: "14-19 Abr", cidade: "Milão", pais: "Itália", setor: "Móveis e Decoração", site: "https://www.salonemilano.it/", brasilPavilhao: true, destaque: true, icon: Sofa },
  { nome: "High Point Market", data: "17-22 Out", cidade: "High Point, NC", pais: "EUA", setor: "Móveis e Decoração", site: "https://www.highpointmarket.org/", brasilPavilhao: false, destaque: false, icon: Sofa },

  // Logística
  { nome: "Intermodal 2026", data: "3-5 Mar", cidade: "São Paulo", pais: "Brasil", setor: "Logística", site: "https://www.intermodal.com.br/", brasilPavilhao: true, destaque: true, icon: Ship },
  { nome: "Transport Logistic", data: "9-12 Jun", cidade: "Munique", pais: "Alemanha", setor: "Logística", site: "https://www.transportlogistic.de/", brasilPavilhao: false, destaque: false, icon: Ship },

  // Multissetorial
  { nome: "Canton Fair (119ª)", data: "15-19 Abr", cidade: "Guangzhou", pais: "China", setor: "Multissetorial", site: "https://www.cantonfair.org.cn/", brasilPavilhao: false, destaque: false, icon: Globe },
  { nome: "Canton Fair (120ª)", data: "15-19 Out", cidade: "Guangzhou", pais: "China", setor: "Multissetorial", site: "https://www.cantonfair.org.cn/", brasilPavilhao: false, destaque: false, icon: Globe },
  { nome: "Expo Dubai 2026", data: "1 Out-31 Mar 2027", cidade: "Dubai", pais: "Emirados Árabes", setor: "Multissetorial", site: "https://www.dubaiexhibitions.com/", brasilPavilhao: true, destaque: true, icon: Globe },
];

// ─── Mapa de setor → ícone (mantido para enriquecer dados do JSON) ───
const SETOR_ICON_MAP: Record<string, React.ElementType> = {
  "Alimentos e Bebidas": UtensilsCrossed,
  "Agronegócio": Sprout,
  "Moda e Têxtil": Shirt,
  "Máquinas e Equipamentos": Wrench,
  "Tecnologia": Monitor,
  "Cosméticos": FlaskConical,
  "Móveis e Decoração": Sofa,
  "Logística": Ship,
  "Multissetorial": Globe,
};

const setores = [...new Set(feiras.map((f) => f.setor))].sort();

function FeiraCard({ feira }: { feira: Feira }) {
  const Icon = feira.icon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-[0_4px_20px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/15 transition-all"
    >
      {feira.destaque && (
        <div className="absolute -top-2 -right-2">
          <span className="inline-flex items-center gap-1 bg-[#D80E16] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full">
            <Star className="w-3 h-3" /> Destaque
          </span>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#D80E16]/5 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-[#D80E16]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-[#0F111A] mb-2 leading-snug group-hover:text-[#D80E16] transition-colors">
            {feira.nome}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5E6278] mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {feira.data}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {feira.cidade}, {feira.pais}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] font-bold bg-[#D80E16]/[0.06] text-[#D80E16] border-0">
              {feira.setor}
            </Badge>
            {feira.brasilPavilhao && (
              <Badge className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border-0">
                Pavilhão Brasil
              </Badge>
            )}
          </div>
          <a
            href={feira.site}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#D80E16] hover:underline mt-3"
          >
            Site oficial <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeirasEventosPage() {
  const [filtro, setFiltro] = useState<string | null>(null);
  const [feirasData, setFeirasData] = useState<Feira[]>(feiras);
  const [setoresData, setSetoresData] = useState<string[]>(setores);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/feiras.json")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const eventos = (json.eventos as Array<{
          nome: string; data: string; cidade: string; pais: string;
          setor: string; site: string; brasilPavilhao: boolean; destaque: boolean;
        }>) ?? [];
        const enriquecidos: Feira[] = eventos.map((e) => ({
          ...e,
          icon: SETOR_ICON_MAP[e.setor] ?? Globe,
        }));
        const setoresUnicos = [...new Set(enriquecidos.map((f) => f.setor))].sort();
        setFeirasData(enriquecidos);
        setSetoresData(setoresUnicos);
        setUltimaAtualizacao(json.ultima_atualizacao ?? null);
        console.log("Feiras carregadas de JSON");
      })
      .catch((err) => {
        if (!cancelled) {
          console.log("Feiras: usando fallback hardcoded", err);
          setFeirasData(feiras);
          setSetoresData(setores);
          setUltimaAtualizacao(null);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const filtradas = useMemo(
    () => (filtro ? feirasData.filter((f) => f.setor === filtro) : feirasData),
    [filtro, feirasData],
  );

  useSeo({
    title: "Feiras e Eventos 2026 — Calendário do Exportador",
    description:
      "Calendário completo de feiras internacionais para exportadores brasileiros. Alimentos, agronegócio, moda, tecnologia, cosméticos e mais.",
    canonical: "https://www.tradexa.com.br/feiras-eventos",
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <ParticleCanvasThemed opacity={0.15} particleCount={30} color="216, 14, 22" connectionDist={120} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.04),transparent)]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Calendário 2026
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Feiras e Eventos{" "}
              <span className="text-[#D80E16]">Internacionais</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed mb-10">
              Calendário com as principais feiras internacionais para exportadores brasileiros.
              Organizado por setor, com destaque para eventos com pavilhão Brasil da Apex-Brasil.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          {/* Filtros */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setFiltro(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                !filtro
                  ? "bg-[#D80E16] text-white border-[#D80E16]"
                  : "bg-white text-[#5E6278] border-black/[0.08] hover:border-[#D80E16]/20"
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Todos ({feirasData.length})
            </button>
            {setoresData.map((s) => (
              <button
                key={s}
                onClick={() => setFiltro(filtro === s ? null : s)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                  filtro === s
                    ? "bg-[#D80E16] text-white border-[#D80E16]"
                    : "bg-white text-[#5E6278] border-black/[0.08] hover:border-[#D80E16]/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div key={filtro || "_all"} className="grid md:grid-cols-2 gap-4">
              {filtradas.map((f) => (
                <FeiraCard key={f.nome + f.data} feira={f} />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D80E16]/[0.08] border border-[#D80E16]/[0.15] text-[#D80E16] text-sm font-semibold mb-4">
              <Building2 className="w-4 h-4" />
              Precisa de apoio?
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mb-4">
              Vai expor em alguma feira?
            </h2>
            <p className="text-[#5E6278] max-w-xl mx-auto mb-8">
              Oferecemos pesquisa de mercado, prospecção de compradores e representação
              comercial para maximizar seu retorno em feiras internacionais.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/servicos/pesquisa-compradores"
                className="inline-flex items-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-6 py-3 rounded-xl transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Pesquisa de Compradores
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/servicos/representacao-brasil"
                className="inline-flex items-center gap-2 border border-[#D80E16]/20 text-[#D80E16] hover:bg-[#D80E16]/5 font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Representação no Brasil
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
