import { useNavigate } from "react-router-dom";
import {
  Check, X, Zap, Shield, Globe, BrainCircuit, Bell,
  Search, TrendingUp, ArrowRight, Star, Users,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

const FEATURES = [
  { icon: Search, label: "Classificador IA NCM/HS", desc: "Descreva o produto, a IA classifica automaticamente." },
  { icon: Globe, label: "Alíquotas em 31 Países", desc: "Dados reais de alíquotas, VAT e frete estimado." },
  { icon: TrendingUp, label: "Smart Rank", desc: "Ranqueie os melhores mercados para seu produto." },
  { icon: Bell, label: "Alertas de Tarifas", desc: "Monitore variações e receba notificações." },
  { icon: BrainCircuit, label: "Análise Avançada", desc: "IA analisa tendências e oportunidades." },
  { icon: Users, label: "3.8M+ Importadores", desc: "Base global de empresas importadoras." },
  { icon: Shield, label: "Consulta CNPJ", desc: "Valide empresas brasileiras." },
];

const PLANS = [
  {
    name: "Essential",
    price: "Grátis",
    period: "para sempre",
    badge: null,
    features: [
      { text: "2 consultas IA NCM/mês", included: true },
      { text: "Exportação Intelligence (5 buscas/dia)", included: true },
      { text: "Dashboard com dados reais", included: true },
      { text: "Suporte por email", included: true },
      { text: "Consulta HTS EUA", included: false },
      { text: "Comparador de NCMs", included: false },
      { text: "Simulador Exportação", included: false },
      { text: "Smart Rank", included: false },
      { text: "Alertas de Tarifas", included: false },
      { text: "Análise Avançada", included: false },
      { text: "API", included: false },
    ],
    cta: "Começar Grátis",
    ctaLink: "/register",
    primary: false,
  },
  {
    name: "Growth",
    price: "R$ 497",
    period: "/ mês",
    badge: null,
    features: [
      { text: "Consultas IA NCM", included: true },
      { text: "Consulta HTS EUA", included: true },
      { text: "Comparador de NCMs", included: true },
      { text: "Simular Exportação", included: true },
      { text: "Alíquotas por País", included: true },
      { text: "Suporte por email", included: true },
      { text: "Smart Rank", included: false },
      { text: "Alertas de Tarifas", included: false },
      { text: "Análise Avançada", included: false },
      { text: "API customizada", included: false },
    ],
    cta: "Assinar Growth",
    ctaLink: "/register?plan=growth",
    primary: false,
  },
  {
    name: "Professional",
    price: "R$ 1.297",
    period: "/ mês",
    badge: "MAIS POPULAR",
    features: [
      { text: "Tudo do Growth", included: true },
      { text: "Smart Rank", included: true },
      { text: "Alertas de Tarifas", included: true },
      { text: "Análise Avançada", included: true },
      { text: "Mapa de Importadores", included: true },
      { text: "Calendário Sazonal", included: true },
      { text: "Frete Marítimo", included: true },
      { text: "Port Intelligence", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "API customizada", included: false },
    ],
    cta: "Assinar Professional",
    ctaLink: "/register?plan=professional",
    primary: true,
  },
  {
    name: "Business",
    price: "R$ 4.799",
    period: "/ mês",
    badge: "EMPRESARIAL",
    features: [
      { text: "Tudo do Professional", included: true },
      { text: "API customizada", included: true },
      { text: "Limites personalizados", included: true },
      { text: "Custo mínimo por ação", included: true },
      { text: "Onboarding dedicado", included: true },
      { text: "SLA garantido", included: true },
      { text: "Suporte prioritário", included: true },
      { text: "Relatórios customizados", included: true },
      { text: "White-label", included: false },
      { text: "Gerente de conta", included: false },
      { text: "Múltiplos usuários", included: false },
      { text: "Webhooks", included: false },
    ],
    cta: "Falar com Vendas",
    ctaLink: "mailto:contato@tradexa.com.br",
    primary: false,
  },
];

export default function LandingVendas() {
  const navigate = useNavigate();

  useSeo({
    title: "Planos e Preços — Inteligência Comercial para Exportadores",
    description: "Planos a partir de R$0. Classificador IA de NCM, alíquotas de 31 países, importadores, dashboards e mapas logísticos ao vivo.",
    keywords: "planos comércio exterior, preços tradexa, classificador ncm, alíquotas importação, inteligência comercial, exportação",
    canonical: "https://www.tradexa.com.br/pricing",
  });

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D80E16]/10 text-[#D80E16] text-xs font-bold">
            <Star className="w-3.5 h-3.5" />
            Plataforma de Inteligência Comercial
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight">
            Exporte com dados.<br />
            <span className="text-[#D80E16]">Não com guesswork.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Alíquotas de importação, VAT, frete, 3.8M+ importadores e IA classificadora em uma única plataforma.
            Comece grátis. Escale quando precisar.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-4 rounded-2xl bg-[#D80E16] text-white font-black text-sm hover:bg-[#b80c12] transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
            >
              Começar Grátis <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-700 font-black text-sm hover:border-slate-400 transition-all"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-slate-900">Tudo que você precisa para exportar</h2>
            <p className="text-sm text-slate-600 mt-2">Uma plataforma completa, sem necessidade de múltiplas ferramentas.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-[#D80E16]" />
                </div>
                <h3 className="text-sm font-black text-slate-800">{f.label}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-slate-900">Escolha seu plano</h2>
            <p className="text-sm text-slate-600 mt-2">Comece grátis. Faça upgrade quando precisar de mais poder.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 space-y-5 ${
                  plan.primary
                    ? "border-[#D80E16] bg-gradient-to-b from-red-50/50 to-white shadow-xl shadow-red-500/10 relative"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.badge && (
                  <div className={`text-center text-[10px] font-black uppercase tracking-widest py-1 rounded-full ${
                    plan.primary ? "bg-[#D80E16] text-white" : "bg-slate-800 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm text-slate-600 ml-1">{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat.text} className="flex items-start gap-2.5">
                      {feat.included ? (
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-xs ${feat.included ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (plan.ctaLink.startsWith("mailto")) {
                      window.location.href = plan.ctaLink;
                    } else {
                      navigate(plan.ctaLink);
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.primary
                      ? "bg-[#D80E16] text-white hover:bg-[#b80c12] shadow-lg shadow-red-500/20"
                      : "border-2 border-slate-200 text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-2xl font-black text-slate-900">Dados que você pode confiar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: "3.8M+", label: "Importadores" },
              { value: "97", label: "Capítulos HS" },
              { value: "18", label: "Países com tarifas" },
              { value: "100%", label: "Dados reais" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-black text-[#D80E16]">{stat.value}</p>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
