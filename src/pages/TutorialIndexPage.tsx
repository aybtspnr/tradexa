import { Link } from "react-router-dom";
import { BookOpen, ArrowRight, Sparkles, BarChart3, Users, Calculator, Ship } from "lucide-react";
import { motion } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { ParticleCanvasThemed } from "@/components/3d";

const TUTORIALS = [
  {
    route: "/tutorial/classificador-ncm",
    title: "Classificador NCM com IA",
    desc: "Aprenda a classificar produtos em NCM, HS e HTS usando inteligência artificial em segundos.",
    icon: Sparkles,
    color: "from-purple-500 to-indigo-600",
    bgLight: "bg-purple-50",
    textAccent: "text-purple-600",
    borderAccent: "border-purple-200",
    steps: 3,
    time: "5 min",
  },
  {
    route: "/tutorial/monitorar-wci",
    title: "Monitorar Frete com WCI",
    desc: "Acompanhe o World Container Index, negocie fretes no momento certo e economize no transporte.",
    icon: Ship,
    color: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50",
    textAccent: "text-cyan-600",
    borderAccent: "border-cyan-200",
    steps: 4,
    time: "7 min",
  },
  {
    route: "/tutorial/trade-intelligence",
    title: "Trade Intelligence",
    desc: "Use dados de comércio exterior para analisar concorrentes, identificar tendências e encontrar oportunidades.",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-600",
    bgLight: "bg-emerald-50",
    textAccent: "text-emerald-600",
    borderAccent: "border-emerald-200",
    steps: 5,
    time: "10 min",
  },
  {
    route: "/tutorial/importadores",
    title: "Encontrar Importadores",
    desc: "Use o diretório de importadores para encontrar compradores qualificados por HS Code e país.",
    icon: Users,
    color: "from-orange-500 to-red-600",
    bgLight: "bg-orange-50",
    textAccent: "text-orange-600",
    borderAccent: "border-orange-200",
    steps: 4,
    time: "8 min",
  },
  {
    route: "/tutorial/calculadora-importacao",
    title: "Calculadora de Impostos",
    desc: "Aprenda a calcular II, IPI, PIS, COFINS e ICMS na importação com exemplos reais por estado.",
    icon: Calculator,
    color: "from-rose-500 to-pink-600",
    bgLight: "bg-rose-50",
    textAccent: "text-rose-600",
    borderAccent: "border-rose-200",
    steps: 6,
    time: "12 min",
  },
];

export default function TutorialIndexPage() {
  useSeo({
    title: "Tutoriais — Como Usar as Ferramentas TRADEXA | Tutorial",
    description: "Tutoriais passo a passo para usar as ferramentas da TRADEXA: classificador NCM, monitor de frete, trade intelligence, importadores e calculadora de impostos.",
    url: "https://www.tradexa.com.br/tutorial",
    type: "website",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Tutoriais TRADEXA",
      description: "Tutoriais passo a passo para usar as ferramentas de comércio exterior da TRADEXA.",
    },
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-white text-slate-800">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#D80E16]/5 to-white pt-24 pb-16">
          <div className="absolute inset-0 pointer-events-none">
            <ParticleCanvasThemed opacity={0.15} particleCount={30} color="216,14,22" connectionDist={120} />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 bg-[#D80E16]/5 border border-[#D80E16]/20 rounded-full px-4 py-1.5 mb-6">
                <BookOpen className="w-4 h-4 text-[#D80E16]" />
                <span className="text-sm text-[#D80E16] font-medium">Tutoriais</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                Aprenda a Usar a <span className="text-[#D80E16]">TRADEXA</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">
                Guias práticos passo a passo para dominar cada ferramenta da plataforma. Do classificador NCM à análise de mercado.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tutorial Cards */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TUTORIALS.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.div
                  key={t.route}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    to={t.route}
                    className={`block h-full ${t.bgLight} border ${t.borderAccent} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-2 group-hover:text-[#D80E16] transition-colors">{t.title}</h2>
                    <p className="text-slate-500 text-sm mb-4">{t.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{t.steps} passos</span>
                        <span>·</span>
                        <span>{t.time} de leitura</span>
                      </div>
                      <ArrowRight className={`w-4 h-4 ${t.textAccent} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 pb-20">
          <div className="mb-12 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Por que fazer os tutoriais da TRADEXA?</h2>
            <p className="text-slate-500 leading-relaxed">
              Cada tutorial foi desenvolvido por especialistas em comércio exterior que usam a plataforma diariamente. 
              Em poucos minutos você aprende a classificar produtos com IA, calcular todos os impostos de uma importação, 
              encontrar compradores internacionais qualificados e analisar dados reais de mercado. 
              Os tutoriais são 100% gratuitos e incluem exemplos práticos, capturas de tela e dicas que vão 
              direto ao ponto — sem enrolação. Ao final de cada tutorial, você terá autonomia para usar a 
              ferramenta no seu dia a dia, economizando horas de pesquisa e evitando erros comuns. 
              Todos os tutoriais são atualizados sempre que a plataforma recebe novas funcionalidades.
            </p>
          </div>
          <div className="bg-gradient-to-r from-[#D80E16] to-red-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Precisa de ajuda?</h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Nossa equipe pode fazer uma demonstração personalizada de qualquer ferramenta da TRADEXA.
            </p>
            <Link
              to="/contato"
              className="inline-flex items-center gap-2 bg-white text-[#D80E16] font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Falar com Especialista
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
