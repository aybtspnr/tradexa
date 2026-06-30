"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import {
  ArrowRight,
  Smartphone,
  Wheat,
  FileCheck,
  ShoppingCart,
  Car,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  Search,
  Globe,
  Users,
  Calculator,
  BarChart3,
  Bell,
  Database,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

interface Persona {
  icon: React.ElementType;
  title: string;
  tagline: string;
  industryTag: string;
  industryColor: string;
  painPoints: string[];
  solutionTools: { name: string; desc: string; route: string }[];
  result: string;
  quote: string;
}

const personas: Persona[] = [
  {
    icon: Smartphone,
    title: "Importador de Eletrônicos",
    tagline: "Como a empresa XYZ reduziu custos de importação em 22%",
    industryTag: "Importação",
    industryColor: "#D80E16",
    painPoints: [
      "Classificação NCM complexa para componentes eletrônicos",
      "Tributos variáveis entre estados e categorias",
      "Fornecedores na China difíceis de avaliar e comparar",
    ],
    solutionTools: [
      { name: "Classificador NCM", desc: "IA que classifica eletrônicos automaticamente", route: "/landing/ncm-classifier" },
      { name: "Calculadora de Importação", desc: "Simula todos os tributos: II, IPI, PIS, COFINS, ICMS", route: "/landing/calculadora-importacao" },
      { name: "Importadores", desc: "Encontre fornecedores qualificados por HS Code", route: "/landing/importadores" },
    ],
    result: "Redução de 22% no custo total de importação em 6 meses",
    quote: "Antes da TRADEXA, perdíamos horas classificando NCMs manualmente. Agora, em segundos temos o código correto e a simulação completa de custos.",
  },
  {
    icon: Wheat,
    title: "Exportador de Soja",
    tagline: "Identificando novos mercados para commodities",
    industryTag: "Agronegócio",
    industryColor: "#10b981",
    painPoints: [
      "Dependência de poucos compradores tradicionais",
      "Preços voláteis sem visibilidade de mercado",
      "Dificuldade em identificar mercados emergentes",
    ],
    solutionTools: [

      { name: "Trade Intelligence", desc: "Análise de fluxo comercial e tendências", route: "/trade-intelligence" },
      { name: "Mapa de Frete", desc: "Cotações reais entre portos globais", route: "/maritime-freight-map" },
    ],
    result: "3 novos mercados identificados no Sudeste Asiático",
    quote: "O Smart Rank mostrou oportunidades no Vietnã e Indonésia que nunca teríamos considerado. Agora diversificamos 30% da nossa base de clientes.",
  },
  {
    icon: FileCheck,
    title: "Despachante Aduaneiro",
    tagline: "Automatizando classificação fiscal para 200+ clientes",
    industryTag: "Logística",
    industryColor: "#8b5cf6",
    painPoints: [
      "Classificação manual lenta e trabalhosa",
      "Erros de classificação com custos bilionários",
      "Volume crescente de clientes exigindo mais agilidade",
    ],
    solutionTools: [
      { name: "NCM Lookup com IA", desc: "Classificação automática por descrição do produto", route: "/ai-search" },
      { name: "HTS Lookup", desc: "Referência cruzada com tarifas dos EUA", route: "/hts-lookup" },
    ],
    result: "Tempo de classificação reduzido de 30 min para 30 segundos",
    quote: "Classificávamos 50 NCMs por dia. Agora são 200+, com menos erros. A IA da TRADEXA se tornou essencial no nosso fluxo de trabalho.",
  },
  {
    icon: ShoppingCart,
    title: "Startup de E-commerce",
    tagline: "Importando da China com margem saudável",
    industryTag: "E-commerce",
    industryColor: "#f59e0b",
    painPoints: [
      "Custo total de importação totalmente desconhecido até a chegada",
      "Remessa conforme e mudanças tributárias constantes",
      "Dificuldade em precificar produtos com margem",
    ],
    solutionTools: [
      { name: "Calculadora de Importação", desc: "Simule o custo real antes de comprar", route: "/landing/calculadora-importacao" },
      { name: "WCI Monitor", desc: "Acompanhe preços de frete em tempo real", route: "/maritime-freight-map" },
      { name: "Alertas", desc: "Notificações sobre mudanças tarifárias e sazonalidade", route: "/landing/smart-alerts" },
    ],
    result: "Margem líquida subiu de 8% para 18%",
    quote: "Antes, importávamos no escuro. Agora sei exatamente quanto vou pagar de imposto e frete antes de fechar o pedido com o fornecedor.",
  },
  {
    icon: Car,
    title: "Indústria Automotiva",
    tagline: "Gestão de supply chain global com dados",
    industryTag: "Automotivo",
    industryColor: "#06b6d4",
    painPoints: [
      "Milhares de peças com NCMs variados e alterações frequentes",
      "Riscos de descontinuação e tarifas surpresa",
      "Necessidade de compliance com múltiplos países",
    ],
    solutionTools: [

      { name: "Trade Intelligence", desc: "Monitoramento de fluxo de peças globais", route: "/trade-intelligence" },
      { name: "Alertas", desc: "Notificações proativas sobre mudanças regulatórias", route: "/landing/smart-alerts" },
    ],
    result: "Zero surpresas com tarifas nos últimos 12 meses",
    quote: "Gerenciamos 5.000+ referências de peças. A TRADEXA nos alerta sobre qualquer mudança de NCM ou tarifa antes que impacte nossa produção.",
  },
  {
    icon: Briefcase,
    title: "Consultor de Comércio Exterior",
    tagline: "Base de dados completa para seus clientes",
    industryTag: "Consultoria",
    industryColor: "#ec4899",
    painPoints: [
      "Dados fragmentados em múltiplas fontes",
      "Relatórios manuais que consomem dias",
      "Dificuldade em apresentar dados confiáveis para clientes",
    ],
    solutionTools: [
      { name: "Todas as Ferramentas", desc: "Acesso completo a todas as ferramentas TRADEXA", route: "/services" },
      { name: "API", desc: "Integre dados em seus sistemas e relatórios", route: "/services/api" },
    ],
    result: "Capacidade de atender 3x mais clientes com a mesma equipe",
    quote: "A API da TRADEXA nos permite gerar relatórios automatizados para 60+ clientes. O que levava 3 dias agora leva 30 minutos.",
  },
];

function PersonaCard({ persona, index }: { persona: Persona; index: number }) {
  const Icon = persona.icon;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="mb-20 last:mb-0"
    >
      {/* Persona header */}
      <motion.div
        variants={fadeUp}
        className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-start`}
      >
        {/* Avatar + Info */}
        <div className="w-full md:w-1/3 flex-shrink-0">
          <motion.div
            variants={fadeUp}
            className="relative p-6 rounded-2xl bg-white border border-black/[0.04] shadow-sm"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: persona.industryColor + "15" }}
            >
              <Icon className="w-8 h-8" style={{ color: persona.industryColor }} />
            </div>
            <Badge
              className="mb-3 font-bold text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full border-0"
              style={{
                background: persona.industryColor + "12",
                color: persona.industryColor,
              }}
            >
              {persona.industryTag}
            </Badge>
            <h3 className="text-xl font-extrabold text-[#0F111A] mb-2">
              {persona.title}
            </h3>
            <p className="text-sm text-[#5E6278] italic leading-relaxed">
              "{persona.tagline}"
            </p>
          </motion.div>
        </div>

        {/* Challenge + Solution */}
        <div className="w-full md:w-2/3">
          {/* Pain Points */}
          <motion.div variants={fadeUp} className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D80E16] mb-3 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Dores
            </h4>
            <div className="space-y-2">
              {persona.painPoints.map((pain, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-red-50/60 border border-red-100/50"
                >
                  <div className="w-5 h-5 rounded-full bg-[#D80E16]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#D80E16] text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-sm text-[#374151] leading-relaxed">{pain}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div variants={fadeUp} className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#10b981] mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              Solução TRADEXA
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {persona.solutionTools.map((tool, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={tool.route}
                    className="block p-4 rounded-xl bg-white border border-black/[0.04] hover:border-[#D80E16]/20 hover:shadow-[0_4px_24px_-8px_rgba(216,14,22,0.1)] transition-all group h-full"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-sm font-bold text-[#0F111A] group-hover:text-[#D80E16] transition-colors">
                        {tool.name}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E6278] leading-relaxed">
                      {tool.desc}
                    </p>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D80E16] mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Result */}
          <motion.div variants={fadeUp} className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/60 border border-emerald-100/50">
            <CheckCircle2 className="w-5 h-5 text-[#10b981] flex-shrink-0" />
            <span className="text-sm font-bold text-[#065f46]">{persona.result}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Quote */}
      <motion.blockquote
        variants={fadeUp}
        className="mt-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 relative overflow-hidden"
      >
        <div className="absolute top-4 left-6 text-6xl font-serif text-slate-200 leading-none select-none">
          "
        </div>
        <p className="text-sm leading-relaxed text-slate-600 pl-6 relative z-10 italic">
          {persona.quote}
        </p>
      </motion.blockquote>
    </motion.div>
  );
}

export default function CasosDeUsoPage() {
  useSeo({
    title: "Casos de Uso — TRADEXA Market Intelligence",
    description: "Veja como empresas brasileiras usam a TRADEXA para reduzir custos de importação, descobrir novos mercados e automatizar classificação fiscal.",
    keywords:
      "casos de uso, tradexa, importação, exportação, comércio exterior, depoimentos, resultados, NCM, tarifas",
    canonical: "https://www.tradexa.com.br/casos-de-uso",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Casos de Uso — TRADEXA Market Intelligence",
      description:
        "Veja como empresas brasileiras usam a TRADEXA para resultados reais no comércio exterior.",
      url: "https://www.tradexa.com.br/casos-de-uso",
    },
  });

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Casos de Uso da TRADEXA</h2>
        <p>Veja como empresas brasileiras de diferentes setores utilizam a TRADEXA no dia a dia para resolver problemas reais de comércio exterior. Nossos casos de uso cobrem os principais perfis de usuários: importadores de eletrônicos que usam o classificador NCM com IA para evitar erros de classificação fiscal e a calculadora de importação para simular todos os tributos antes de fechar compras internacionais; exportadores de soja e commodities que utilizam o Trade Intelligence para identificar novos mercados e o Diretório de Importadores para encontrar compradores qualificados; trading companies que analisam tendências de preços com a Precificação Inteligente e monitoram market share global; despachantes aduaneiros que otimizam processos de documentação e desembaraço com a Conformidade Regulatória; indústrias automotivas que gerenciam milhares de referências de peças com o NCM Comparison e o Trade Intelligence; e consultorias de comércio exterior que utilizam intelligence de mercado como serviço para seus clientes finais. Cada caso de uso apresenta os desafios reais enfrentados por empresas brasileiras, as ferramentas TRADEXA utilizadas para resolvê-los e os resultados quantitativos obtidos: redução de custos, aumento de margem, economia de tempo e conquista de novos mercados. São histórias reais de transformação digital no comércio exterior brasileiro.</p>
      </div>
      {/* Hero */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.05),transparent)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              Casos de Uso
            </Badge>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[#0F111A] tracking-tight leading-[1.08] mb-6">
              Empresas reais.{" "}
              <span className="text-[#D80E16]">Resultados reais.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5E6278] max-w-2xl mx-auto leading-relaxed">
              Conheça profissionais e empresas que transformaram suas operações
              de comércio exterior com dados e inteligência da TRADEXA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9] border-y border-black/[0.04]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
          >
            {[
              { value: "6", label: "Perfis de clientes", icon: Users },
              { value: "22%", label: "Redução média de custos", icon: TrendingUp },
              { value: "200+", label: "Classificações/dia automatizadas", icon: Zap },
              { value: "3x", label: "Mais capacidade de atendimento", icon: BarChart3 },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex flex-col items-center gap-1"
              >
                <stat.icon className="w-4 h-4 text-[#D80E16] mb-1" />
                <span className="text-2xl font-extrabold text-[#0F111A]">
                  {stat.value}
                </span>
                <span className="text-xs text-[#5E6278] font-medium">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Persona cards */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          {personas.map((persona, index) => (
            <PersonaCard key={index} persona={persona} index={index} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#D80E16] to-[#b80c12]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/20 text-[#D80E16]">
              Sua vez
            </Badge>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              Pronto para transformar sua operação de comércio exterior?
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
              Junte-se a milhares de profissionais que já usam a TRADEXA para
              tomar decisões baseadas em dados reais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services">
                <Button
                  size="lg"
                  className="bg-[#D80E16] hover:bg-[#b80c12] text-white px-8 py-6 text-base font-bold rounded-xl shadow-lg shadow-[#D80E16]/20"
                >
                  Explorar Serviços
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base font-bold rounded-xl"
                >
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </SiteLayout>
  );
}
