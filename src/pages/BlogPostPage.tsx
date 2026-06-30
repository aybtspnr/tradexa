import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Sparkles,
  ArrowRight,
  Globe,
  Ship,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Target,
  Shield,
  Package,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import StructuredData from "@/components/StructuredData";
import { blogPosts, getPostContent, type BlogPost } from "@/data/blog/posts";
import { NewsletterGate } from "@/components/blog/NewsletterGate";
import { GlossarioWidget } from "@/components/blog/GlossarioWidget";
import { ReadingProgressBar } from "@/components/blog/ReadingProgressBar";
import { FloatingTOC } from "@/components/blog/FloatingTOC";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// ─── Sub-components ───

function CTABanner({
  title,
  desc,
  route,
  buttonText,
}: {
  title: string;
  desc: string;
  route: string;
  buttonText: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative my-12 rounded-2xl bg-gradient-to-br from-[#D80E16] to-[#b80c12] p-8 md:p-10 text-white overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
      </div>
      <div className="relative z-10 text-center">
        <h3 className="text-2xl md:text-3xl font-extrabold mb-3">{title}</h3>
        <p className="text-white/80 max-w-lg mx-auto mb-6">{desc}</p>
        <Button
          size="lg"
          className="gap-2 bg-white text-[#D80E16] hover:bg-white/90 px-8 py-6 text-base font-bold rounded-2xl border-0 shadow-xl"
          asChild
        >
          <Link to={route}>
            <Sparkles className="w-5 h-5" />
            {buttonText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

function CTACard({
  title,
  desc,
  route,
  icon: Icon,
  color,
}: {
  title: string;
  desc: string;
  route: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Link
      to={route}
      className="group block rounded-xl border border-black/[0.06] bg-white p-5 hover:shadow-[0_4px_20px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10 transition-all"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-white"
        style={{ background: color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-sm text-[#0F111A] mb-1 group-hover:text-[#D80E16] transition-colors">
        {title}
      </h3>
      <p className="text-xs text-[#5E6278] leading-relaxed">{desc}</p>
    </Link>
  );
}

// ─── Service card (consulting, distinct styling) ───
function ServiceCard({
  title,
  desc,
  route,
  icon: Icon,
}: {
  title: string;
  desc: string;
  route: string;
  icon: React.ElementType;
}) {
  return (
    <Link
      to={route}
      className="group block rounded-xl border border-[#D80E16]/10 bg-gradient-to-br from-[#D80E16]/[0.02] to-white p-5 hover:shadow-[0_4px_20px_-8px_rgba(216,14,22,0.15)] hover:border-[#D80E16]/20 transition-all"
    >
      <div className="w-10 h-10 rounded-lg bg-[#D80E16]/10 flex items-center justify-center mb-3 text-[#D80E16]">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold text-sm text-[#0F111A] mb-1 group-hover:text-[#D80E16] transition-colors">
        {title}
      </h3>
      <p className="text-xs text-[#5E6278] leading-relaxed">{desc}</p>
    </Link>
  );
}

// ─── Tag → Service auto-mapping ───
const tagToServices: Record<string, { title: string; desc: string; route: string; icon: React.ElementType }[]> = 
{
  // Exportação tags → pesquisa de mercado + compradores
  Exportação: [
    { title: "Pesquisa de Mercado para Exportação", desc: "Identificamos os melhores mercados para seus produtos com dados reais.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Pesquisa de Compradores Internacionais", desc: "Encontramos compradores qualificados no exterior.", route: "/servicos/pesquisa-compradores", icon: Globe },
  ],

  
  // Importação tags → despacho + cotação
  Importação: [
    { title: "Despacho Aduaneiro", desc: "Desembaraço completo com despachantes experientes em todos os portos.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Cotação de Frete Internacional", desc: "Cotações competitivas com 20+ armadores e agentes.", route: "/servicos/cotacao-frete-internacional", icon: Globe },
  ],

  "Comércio Exterior": [
    { title: "Despacho Aduaneiro", desc: "Desembaraço completo de importação e exportação.", route: "/servicos/despacho-aduaneiro", icon: Ship },
  ],
  
  // Logística / Frete tags → frete + fulfillment
  Logística: [
    { title: "Cotação de Frete Internacional", desc: "Comparamos cotações com 20+ armadores. Marítimo, aéreo e rodoviário.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
    { title: "Frete Internacional Gerenciado", desc: "Agenciamento de carga completo com tracking ao vivo.", route: "/servicos/agenciamento-carga", icon: Globe },
  ],
  "Frete Marítimo": [
    { title: "Cotação de Frete Internacional", desc: "Cotações competitivas de frete marítimo.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  "Frete Aéreo": [
    { title: "Cotação de Frete Internacional", desc: "Cotações competitivas de frete aéreo.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  "Supply Chain": [
    { title: "Fulfillment Internacional", desc: "Armazenagem, picking, packing e distribuição global.", route: "/servicos/fulfillment", icon: Ship },
    { title: "Frete Internacional Gerenciado", desc: "Gestão completa da sua logística internacional.", route: "/servicos/agenciamento-carga", icon: Globe },
  ],
  
  // NCM / Classificação tags → auditoria fiscal
  NCM: [
    { title: "Auditoria de Classificação Fiscal", desc: "Revisão completa dos seus NCMs para reduzir impostos legalmente.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  "Classificação Fiscal": [
    { title: "Auditoria de Classificação Fiscal", desc: "Revisão completa dos seus NCMs para reduzir impostos legalmente.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  
  // Tributação → auditoria fiscal
  Tributação: [
    { title: "Auditoria de Classificação Fiscal", desc: "Reduza impostos legalmente com revisão de NCMs.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  Tributos: [
    { title: "Auditoria de Classificação Fiscal", desc: "Reduza impostos legalmente com revisão de NCMs.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  
  // Compliance / Regulamentação → auditoria
  Compliance: [
    { title: "Auditoria de Classificação Fiscal", desc: "Elimine riscos de autuação com classificação fiscal correta.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
    { title: "Despacho Aduaneiro", desc: "Desembaraço com compliance regulatório completo.", route: "/servicos/despacho-aduaneiro", icon: Ship },
  ],
  
  // Fornecedores → pesquisa de compradores (inverso também serve)
  Fornecedores: [
    { title: "Pesquisa de Compradores Internacionais", desc: "Encontramos compradores qualificados no exterior.", route: "/servicos/pesquisa-compradores", icon: Globe },
    { title: "Representação Comercial no Brasil", desc: "Seu braço comercial no Brasil para fornecedores estrangeiros.", route: "/servicos/representacao-brasil", icon: Globe },
  ],

  // Regulatory / Certification tags
  ANVISA: [
    { title: "Despacho Aduaneiro", desc: "Desembaraco com compliance sanitario ANVISA completo.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificacao Fiscal", desc: "Classificacao NCM correta para produtos regulados.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  INMETRO: [
    { title: "Despacho Aduaneiro", desc: "Desembaraco com certificacao INMETRO obrigatoria.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificacao Fiscal", desc: "NCM correto para produtos com certificacao.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  Siscomex: [
    { title: "Despacho Aduaneiro", desc: "Registros no Siscomex com despachantes experientes.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificacao Fiscal", desc: "NCMs em conformidade com o Siscomex.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  MAPA: [
    { title: "Despacho Aduaneiro", desc: "Importacao e exportacao com certificacao MAPA.", route: "/servicos/despacho-aduaneiro", icon: Ship },
  ],
  Certificações: [
    { title: "Despacho Aduaneiro", desc: "Desembaraço completo com certificações internacionais.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificação Fiscal", desc: "NCM correto conforme requisitos de certificação.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  Regulamentação: [
    { title: "Despacho Aduaneiro", desc: "Desembaraco com compliance regulatorio completo.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificacao Fiscal", desc: "Elimine riscos regulatorios com NCMs corretos.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  Saude: [
    { title: "Despacho Aduaneiro", desc: "Desembaraco de produtos de saude com ANVISA.", route: "/servicos/despacho-aduaneiro", icon: Ship },
  ],
  Documentacao: [
    { title: "Despacho Aduaneiro", desc: "Documentacao completa para despacho sem erros.", route: "/servicos/despacho-aduaneiro", icon: Ship },
  ],


  // Market / Country tags
  Mercosul: [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Identificamos os melhores mercados no Mercosul.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Representacao Comercial no Brasil", desc: "Seu braco comercial para o mercado sul-americano.", route: "/servicos/representacao-brasil", icon: Globe },
  ],
  China: [
    { title: "Cotacao de Frete Internacional", desc: "Cotacoes para importacao e exportacao com a China.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
    { title: "Despacho Aduaneiro", desc: "Desembaraco agil para cargas da China.", route: "/servicos/despacho-aduaneiro", icon: Shield },
  ],
  EUA: [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Identificamos oportunidades de exportacao para os EUA.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Despacho Aduaneiro", desc: "Desembaraco para exportacao ao mercado americano.", route: "/servicos/despacho-aduaneiro", icon: Ship },
  ],
  "União Europeia": [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Analise de oportunidades no mercado europeu.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Cotacao de Frete Internacional", desc: "Cotacoes para importacao e exportacao com a Europa.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  Brasil: [
    { title: "Representacao Comercial no Brasil", desc: "Seu braco comercial para o mercado brasileiro.", route: "/servicos/representacao-brasil", icon: Globe },
    { title: "Pesquisa de Mercado para Exportacao", desc: "Analise de mercado para produtos brasileiros no exterior.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
  ],

  // Tax / Finance tags
  ICMS: [
    { title: "Auditoria de Classificacao Fiscal", desc: "Reduza ICMS com classificacao NCM correta.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  tarifas: [
    { title: "Auditoria de Classificacao Fiscal", desc: "Otimize tarifas com NCMs corretos.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  "Receita Federal": [
    { title: "Auditoria de Classificacao Fiscal", desc: "Mantenha conformidade fiscal com NCMs corretos.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  "acordo comercial": [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Aproveite acordos comerciais para expandir mercados.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
  ],

  // Sector / Business tags
  Agronegócio: [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Encontre mercados para commodities agricolas.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Auditoria de Classificacao Fiscal", desc: "NCM correto para produtos do agronegocio.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  Moda: [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Mercados internacionais para moda brasileira.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Fulfillment Internacional", desc: "Armazenagem e distribuicao B2B/B2C para moda.", route: "/servicos/fulfillment", icon: Package },
  ],
  Sustentabilidade: [
    { title: "Auditoria de Classificacao Fiscal", desc: "NCMs corretos para produtos sustentaveis.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
    { title: "Pesquisa de Mercado para Exportacao", desc: "Mercados que valorizam sustentabilidade.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
  ],

  // Strategy / Data tags
  Estrategia: [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Estrategia de entrada em novos mercados.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
  ],
  Dados: [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Decisoes baseadas em dados reais de comercio exterior.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Pesquisa de Compradores Internacionais", desc: "Encontre compradores usando dados de importacao.", route: "/servicos/pesquisa-compradores", icon: Globe },
  ],
  "Inteligencia de Mercado": [
    { title: "Pesquisa de Mercado para Exportacao", desc: "Inteligencia de mercado para expandir exportacoes.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Pesquisa de Compradores Internacionais", desc: "Identifique compradores com inteligencia de dados.", route: "/servicos/pesquisa-compradores", icon: Globe },
  ],

  // Logistics tags
  "Logística Internacional": [
    { title: "Cotacao de Frete Internacional", desc: "Cotacoes competitivas para logistica global.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
    { title: "Frete Internacional Gerenciado", desc: "Agenciamento de carga completo com tracking.", route: "/servicos/agenciamento-carga", icon: Globe },
    { title: "Fulfillment Internacional", desc: "Armazenagem e distribuicao internacional.", route: "/servicos/fulfillment", icon: Package },
  ],
  Portos: [
    { title: "Cotacao de Frete Internacional", desc: "Cotacoes para os principais portos mundiais.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
    { title: "Frete Internacional Gerenciado", desc: "Gestao logistica nos principais portos.", route: "/servicos/agenciamento-carga", icon: Globe },
  ],
  "Acordos Comerciais": [
    { title: "Pesquisa de Mercado para Exportação", desc: "Aproveite acordos comerciais para expandir mercados.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
  ],

  // Sector/product-specific tags
  Minérios: [
    { title: "Pesquisa de Mercado para Exportação", desc: "Mercados compradores de minérios brasileiros.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Cotação de Frete Internacional", desc: "Frete para granéis sólidos e minérios.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  Commodities: [
    { title: "Pesquisa de Mercado para Exportação", desc: "Análise de mercados para commodities brasileiras.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Cotação de Frete Internacional", desc: "Cotações para transporte de commodities.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  Calçados: [
    { title: "Pesquisa de Mercado para Exportação", desc: "Mercados para calçados brasileiros no exterior.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Fulfillment Internacional", desc: "Armazenagem e distribuição B2B/B2C para calçados.", route: "/servicos/fulfillment", icon: Package },
  ],
  Mercados: [
    { title: "Pesquisa de Mercado para Exportação", desc: "Identificamos os mercados mais promissores para seus produtos.", route: "/servicos/pesquisa-mercado-exportacao", icon: TrendingUp },
    { title: "Pesquisa de Compradores Internacionais", desc: "Encontramos compradores qualificados no exterior.", route: "/servicos/pesquisa-compradores", icon: Globe },
  ],
  Bebidas: [
    { title: "Despacho Aduaneiro", desc: "Desembaraço para importação e exportação de bebidas.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificação Fiscal", desc: "Classificação NCM correta para bebidas.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],
  Vinhos: [
    { title: "Despacho Aduaneiro", desc: "Desembaraço especializado para importação de vinhos.", route: "/servicos/despacho-aduaneiro", icon: Ship },
    { title: "Auditoria de Classificação Fiscal", desc: "NCM correto para vinhos e bebidas alcoólicas.", route: "/servicos/auditoria-classificacao-fiscal", icon: Target },
  ],

  // ─── New SEO internal linking entries ───
  Antidumping: [
    { title: "Defesa Comercial / Medidas Antidumping", desc: "Assessoria especializada em defesa comercial.", route: "/servicos/despacho-aduaneiro", icon: Shield },
  ],
  ESG: [
    { title: "Consultoria ESG e Sustentabilidade", desc: "Adequação a padrões ambientais internacionais.", route: "/servicos/consultoria-esg", icon: TrendingUp },
  ],
  Carbono: [
    { title: "Consultoria ESG e Sustentabilidade", desc: "Adequação a padrões ambientais internacionais.", route: "/servicos/consultoria-esg", icon: TrendingUp },
  ],
  Blockchain: [
    { title: "Consultoria em Transformação Digital", desc: "Automação e integração de sistemas.", route: "/servicos/consultoria-digital", icon: BarChart3 },
  ],
  IA: [
    { title: "Consultoria em Transformação Digital", desc: "Automação e integração de sistemas.", route: "/servicos/consultoria-digital", icon: BarChart3 },
  ],
  Tecnologia: [
    { title: "Consultoria em Transformação Digital", desc: "Automação e integração de sistemas.", route: "/servicos/consultoria-digital", icon: BarChart3 },
  ],
  "Due Diligence": [
    { title: "Assessoria em Sourcing Internacional", desc: "Prospecção e auditoria de fornecedores.", route: "/servicos/pesquisa-compradores", icon: Globe },
  ],
  Sourcing: [
    { title: "Assessoria em Sourcing Internacional", desc: "Prospecção e auditoria de fornecedores.", route: "/servicos/pesquisa-compradores", icon: Globe },
  ],
  Sanções: [
    { title: "Compliance Aduaneiro", desc: "Assessoria em conformidade regulatória e listas restritivas.", route: "/servicos/despacho-aduaneiro", icon: Shield },
  ],
  Embargos: [
    { title: "Compliance Aduaneiro", desc: "Assessoria em conformidade regulatória e listas restritivas.", route: "/servicos/despacho-aduaneiro", icon: Shield },
  ],
  "E-commerce": [
    { title: "E-commerce Cross-Border", desc: "Consultoria para vendas em marketplaces internacionais.", route: "/servicos/fulfillment", icon: Globe },
  ],
  "Cross-Border": [
    { title: "E-commerce Cross-Border", desc: "Consultoria para vendas em marketplaces internacionais.", route: "/servicos/fulfillment", icon: Globe },
  ],
  Infraestrutura: [
    { title: "Consultoria em Logística Portuária", desc: "Otimização de rotas e modais.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  Cabotagem: [
    { title: "Consultoria em Logística Portuária", desc: "Otimização de rotas e modais.", route: "/servicos/cotacao-frete-internacional", icon: Ship },
  ],
  Drawback: [
    { title: "Regimes Aduaneiros Especiais", desc: "Assessoria para Drawback, RECOF e REPETRO.", route: "/servicos/despacho-aduaneiro", icon: FileText },
  ],
  RECOF: [
    { title: "Regimes Aduaneiros Especiais", desc: "Assessoria para Drawback, RECOF e REPETRO.", route: "/servicos/despacho-aduaneiro", icon: FileText },
  ],
  REPETRO: [
    { title: "Regimes Aduaneiros Especiais", desc: "Assessoria para Drawback, RECOF e REPETRO.", route: "/servicos/despacho-aduaneiro", icon: FileText },
  ],
  Orgânicos: [
    { title: "Certificações Internacionais", desc: "Adequação a padrões globais.", route: "/servicos/consultoria-esg", icon: Shield },
  ],
  "Fair Trade": [
    { title: "Certificações Internacionais", desc: "Adequação a padrões globais.", route: "/servicos/consultoria-esg", icon: Shield },
  ],
  Embalagens: [
    { title: "Logística Sustentável", desc: "Soluções de green logistics.", route: "/servicos/fulfillment", icon: Package },
  ],
  "Green Logistics": [
    { title: "Logística Sustentável", desc: "Soluções de green logistics.", route: "/servicos/fulfillment", icon: Package },
  ],
  Games: [
    { title: "Importação de Eletrônicos", desc: "Assessoria completa para setor de tecnologia.", route: "/servicos/despacho-aduaneiro", icon: Sparkles },
  ],
  Eletrônicos: [
    { title: "Importação de Eletrônicos", desc: "Assessoria completa para setor de tecnologia.", route: "/servicos/despacho-aduaneiro", icon: Sparkles },
  ],
  ANATEL: [
    { title: "Certificações ANATEL e INMETRO", desc: "Regularização de produtos.", route: "/servicos/despacho-aduaneiro", icon: Shield },
  ],
  USPTO: [
    { title: "Propriedade Intelectual", desc: "Registro de marca e patentes internacionais.", route: "/servicos/representacao-brasil", icon: FileText },
  ],
  "Propriedade Intelectual": [
    { title: "Propriedade Intelectual", desc: "Registro de marca e patentes internacionais.", route: "/servicos/representacao-brasil", icon: FileText },
  ],
  "Seguro Garantia": [
    { title: "Garantias Aduaneiras", desc: "Seguro garantia e fiança para importação.", route: "/servicos/despacho-aduaneiro", icon: Shield },
  ],
};

// ─── Tag → Tool auto-mapping (for posts without postTools) ───
const tagToTools: Record<string, { title: string; desc: string; route: string; icon: React.ElementType; color: string }[]> = 
{
  NCM: [
    { title: "Classificador NCM com IA", desc: "Classifique produtos automaticamente em segundos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte alíquotas em 31+ países.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  Importação: [
    { title: "Calculadora de Imposto de Importação", desc: "Simule II, IPI, PIS, COFINS e ICMS.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Classificador NCM com IA", desc: "Classifique produtos para importação.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  Exportação: [
    { title: "Smart Rank", desc: "Descubra os melhores países para exportar.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Diretório de Importadores", desc: "Encontre compradores para seus produtos.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  Logística: [
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize rotas e compare cotações.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe navios ao vivo.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],
  "Comércio Exterior": [
    { title: "Trade Intelligence", desc: "Dashboard completo com dados de importação e exportação.", route: "/trade-intelligence", icon: BarChart3, color: "#10b981" },
    { title: "Classificador NCM com IA", desc: "Classifique qualquer produto em segundos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  Tributação: [
    { title: "Calculadora de Imposto de Importação", desc: "Simule II, IPI, PIS, COFINS e ICMS.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Classificador NCM com IA", desc: "Classifique produtos para redução tributária.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  Sustentabilidade: [
    { title: "Trade Intelligence", desc: "Dados de comércio exterior para estratégias sustentáveis.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
    { title: "Smart Rank", desc: "Descubra mercados com vantagens sustentáveis.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  Agronegócio: [
    { title: "Smart Rank", desc: "Descubra os melhores países para exportar do agronegócio.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Diretório de Importadores", desc: "Encontre compradores globais.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  China: [
    { title: "Calculadora de Imposto de Importação", desc: "Simule tributos para importação da China.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Trade Intelligence", desc: "Dados de importação Brasil-China.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
  ],
  EUA: [
    { title: "Smart Rank", desc: "Descubra oportunidades de exportação para os EUA.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Tarifário Global", desc: "Consulte tarifas dos EUA (HTS).", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "Regimes Aduaneiros": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos para regimes especiais.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte alíquotas para regimes aduaneiros.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
  ],
  "Frete Marítimo": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize rotas e compare cotações.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe navios ao vivo.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],
  "Inteligência de Mercado": [
    { title: "Trade Intelligence", desc: "Dashboard completo de análise de mercado.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
    { title: "Smart Rank", desc: "Ranking de mercados para seu produto.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "Cadeia de Suprimentos": [
    { title: "Supply Chain Map", desc: "Acompanhe sua cadeia ao vivo.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize rotas logísticas.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
  ],
  Portos: [
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize portos e rotas.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe chegada de navios.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],

  // ─── New SEO internal linking tool entries ───
  Antidumping: [
    { title: "Tarifário Global", desc: "Consulte tarifas antidumping em 31+ países.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  Blockchain: [
    { title: "Classificador NCM com IA", desc: "Classificação inteligente com tecnologia de ponta.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  IA: [
    { title: "Classificador NCM com IA", desc: "Classificação inteligente com IA.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  Tecnologia: [
    { title: "Classificador NCM com IA", desc: "Classificação com inteligência artificial.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  Fornecedores: [
    { title: "Diretório de Importadores", desc: "Encontre fornecedores globais.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "Due Diligence": [
    { title: "Diretório de Importadores", desc: "3.8M+ compradores para due diligence.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  Sourcing: [
    { title: "Diretório de Importadores", desc: "Encontre fornecedores globais.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  Sanções: [
    { title: "Tarifário Global", desc: "Consulte sanções e listas restritivas.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  Embargos: [
    { title: "Tarifário Global", desc: "Consulte regimes de embargo.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "E-commerce": [
    { title: "Diretório de Importadores", desc: "Encontre parceiros para e-commerce.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "Cross-Border": [
    { title: "Tarifário Global", desc: "Consulte tarifas para cross-border.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  Drawback: [
    { title: "Classificador NCM com IA", desc: "Encontre o NCM correto para Drawback.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  RECOF: [
    { title: "Classificador NCM com IA", desc: "NCM correto para RECOF.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  REPETRO: [
    { title: "Classificador NCM com IA", desc: "Classifique para REPETRO.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  "Propriedade Intelectual": [
    { title: "Smart Rank", desc: "Proteja sua marca internacionalmente.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  USPTO: [
    { title: "Smart Rank", desc: "Registro de marca nos EUA.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  Games: [
    { title: "Classificador NCM com IA", desc: "Classifique jogos e eletrônicos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  Eletrônicos: [
    { title: "Classificador NCM com IA", desc: "Classifique eletrônicos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  ANATEL: [
    { title: "Classificador NCM com IA", desc: "Identifique exigências ANATEL por NCM.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  "Seguro Garantia": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule tributos com seguro garantia.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
};

// ─── Key Points Card ───
function KeyPointsCard({ points }: { points: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="my-8 rounded-2xl border border-[#D80E16]/15 bg-gradient-to-br from-[#D80E16]/[0.03] to-white p-6 md:p-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#D80E16]/10 flex items-center justify-center">
          <Target className="w-4 h-4 text-[#D80E16]" />
        </div>
        <h3 className="font-extrabold text-[#0F111A] text-sm uppercase tracking-wide">
          O que você vai aprender
        </h3>
      </div>
      <ul className="space-y-2.5">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3 text-[#0F111A] text-sm md:text-base">
            <span className="w-6 h-6 rounded-full bg-[#D80E16]/10 text-[#D80E16] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Tool recommendations per post slug ───
const postTools: Record<
  string,
  { title: string; desc: string; route: string; icon: React.ElementType; color: string }[]
> = {
  "classificacao-ncm-guia-completo": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos automaticamente em segundos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },

    { title: "AI Search", desc: "Busca inteligente por NCM com IA.", route: "/ai-search", icon: Sparkles, color: "#06b6d4" },
  ],
  "calcular-imposto-importacao-brasil": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule II, IPI, PIS, COFINS e ICMS automaticamente.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Tarifário Global", desc: "Consulte alíquotas em 31+ países.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "frete-maritimo-como-funciona": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize rotas e compare cotações interativas.", route: "/landing/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe navios ao vivo no mapa global.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],
  "tarifas-importacao-31-paises": [
    { title: "Tarifário Global", desc: "Consulte alíquotas MFN e VAT em 31+ países.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Smart Rank", desc: "Descubra os melhores países para exportar.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "comex-stat-dados-comercio-exterior": [
    { title: "Inteligência Comercial", desc: "Dashboard completo com dados atualizados do comércio exterior.", route: "/intelligence", icon: BarChart3, color: "#10b981" },
    { title: "Trade Intelligence", desc: "Dados de importação e exportação com filtros avançados.", route: "/landing/import-dashboard", icon: BarChart3, color: "#D80E16" },
  ],
  "icms-importacao-estados-brasil": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule ICMS por estado automaticamente.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Tarifário Global", desc: "Consulte alíquotas em 31+ países.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "drawback-regime-aduaneiro-exportacao": [
    { title: "Classificador NCM com IA", desc: "Encontre o NCM correto para seu insumo.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Veja as alíquotas dos seus insumos.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
  ],
  "documentos-importacao-exportacao": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos com precisão documental.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Diretório de Importadores", desc: "Encontre compradores para seus produtos.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "ncm-vs-cesta-basica-reducao-tributaria": [
    { title: "Tarifário Global", desc: "Consulte tarifas reduzidas e Ex-tarifário.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
    { title: "Classificador NCM com IA", desc: "Verifique o NCM antes de importar.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  "exportar-para-eua-guia": [
    { title: "Brasil ↔ EUA", desc: "Dados cruzados exclusivos Brasil-EUA.", route: "/us-trade", icon: Globe, color: "#2563eb" },
    { title: "Inteligência Comercial", desc: "Análise completa do mercado americano.", route: "/intelligence", icon: BarChart3, color: "#10b981" },
    { title: "Classificador NCM com IA", desc: "Classifique para NCM, HS e HTS (EUA).", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
  ],
  "incoterms-2026-guia-importacao-exportacao": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule tributos com diferentes Incoterms.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Simulador de Exportação", desc: "Simule exportação com FOB, CIF e mais.", route: "/export-simulator", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "importar-da-china-guia-completo": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos chineses em segundos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Imposto", desc: "Calcule tributos de importação da China.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Trade Intelligence", desc: "Analise dados de importação Brasil-China.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
  ],
  "classificacao-ncm-automotivo-pecas-veiculos": [
    { title: "Classificador NCM com IA", desc: "Classifique peças automotivas automaticamente.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte alíquotas de peças automotivas.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
  ],
  "anvisa-inmetro-importacao-regulamentacoes": [
    { title: "Classificador NCM com IA", desc: "Identifique exigências regulatórias por NCM.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Imposto", desc: "Inclua custos regulatórios na simulação.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "seguro-internacional-carga-importacao-exportacao": [
    { title: "Calculadora de Imposto de Importação", desc: "Inclua o custo do seguro na simulação.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Simulador de Exportação", desc: "Calcule custos totais com seguro.", route: "/export-simulator", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "regimes-aduaneiros-especiais-recof-repetro": [
    { title: "Classificador NCM com IA", desc: "Encontre o NCM correto para regimes especiais.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte alíquotas e benefícios Ex-Tarifário.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
  ],
  "balanca-comercial-brasileira-2026": [
    { title: "Trade Intelligence", desc: "Acompanhe dados reais de exportação e importação.", route: "/landing/import-dashboard", icon: BarChart3, color: "#D80E16" },
    { title: "Inteligência Comercial", desc: "Dashboard completo com dados atualizados MDIC.", route: "/intelligence", icon: BarChart3, color: "#10b981" },
    { title: "Smart Rank", desc: "Descubra oportunidades por país.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "portos-brasil-infraestrutura-logistica": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize rotas entre portos mundiais.", route: "/landing/maritime-freight-map", icon: Globe, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe navios nos portos ao vivo.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],
  "margem-preferencia-acordos-comerciais": [
    { title: "Tarifário Global", desc: "Consulte tarifas MFN e preferenciais.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
    { title: "Smart Rank", desc: "Descubra os melhores mercados com acordo.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "e-commerce-internacional-vender-exterior": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos para vender online.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Diretório de Importadores", desc: "Encontre compradores B2B no exterior.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "calculadora-imposto-importacao-2026": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule todos os tributos automaticamente.", route: "/global-tariff", icon: Globe, color: "#ef4444" },
    { title: "Tarifário Global", desc: "Consulte alíquotas em 31+ países.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "como-importar-da-china-guia-completo": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos chineses em segundos.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Imposto", desc: "Calcule tributos de importação da China.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "aliquotas-importacao-por-pais-comparativo": [
    { title: "Comparador de Países", desc: "Compare alíquotas lado a lado.", route: "/country-comparison", icon: Globe, color: "#10b981" },
    { title: "Smart Rank", desc: "Descubra os melhores países para importar.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "desembaraco-aduaneiro-como-funciona": [
    { title: "Classificador NCM com IA", desc: "Classifique produtos para despacho.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Imposto", desc: "Simule custos de desembaraço.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "quanto-custa-container-maritimo": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Cotações interativas por rota.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe navios ao vivo.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],
  "remessa-conforme-importacao-2026": [
    { title: "Calculadora de Imposto", desc: "Simule ICMS do Remessa Conforme.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Tarifário Global", desc: "Consulte alíquotas atualizadas.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "principais-produtos-exportados-brasil-2026": [
    { title: "Trade Intelligence", desc: "Dados oficiais de exportação.", route: "/trade-intelligence", icon: BarChart3, color: "#10b981" },
    { title: "Smart Rank", desc: "Oportunidades por país e produto.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
  ],
  "como-saber-ncm-produto": [
    { title: "Classificador NCM com IA", desc: "Classifique qualquer produto com IA.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "AI Search", desc: "Busca inteligente por NCM.", route: "/ai-search", icon: Sparkles, color: "#06b6d4" },
  ],
  "importar-china-vs-india-vs-vietna": [
    { title: "Comparador de Países", desc: "Compare custos e tributos lado a lado.", route: "/country-comparison", icon: Globe, color: "#10b981" },
    { title: "Diretório de Importadores", desc: "Encontre fornecedores confiáveis.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "guia-completo-transporte-multimodal": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Visualize rotas multimodais interativas.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Supply Chain Map", desc: "Acompanhe sua cadeia multimodal ao vivo.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
  ],
  "modal-transporte-ideal-carga": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Compare modais marítimos em tempo real.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Tarifário Global", desc: "Consulte tarifas por modal e país.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "armazenagem-alfandegada-brasil": [
    { title: "Classificador NCM com IA", desc: "Classifique mercadorias para armazenagem.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Impostos", desc: "Simule tributos na armazenagem.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "otimizar-custos-logisticos-importacao": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Compare custos de rotas marítimas.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Trade Intelligence", desc: "Analise dados para otimizar custos.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
  ],
  "infraestrutura-portuaria-brasil-desafios": [
    { title: "Mapa de Frete Marítimo 3D", desc: "Explore portos e rotas em 3D.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
    { title: "Trade Intelligence", desc: "Dashboard de dados portuários.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
  ],
  "agente-carga-freight-forwarder-logistica": [
    { title: "Cotação de Frete Internacional", desc: "Cotações com os melhores agentes.", route: "/landing/maritime-freight-map", icon: Globe, color: "#f59e0b" },
    { title: "Diretório de Importadores", desc: "Encontre agentes de carga confiáveis.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "logistica-ultima-milha-internacional": [
    { title: "Supply Chain Map", desc: "Acompanhe entregas última milha.", route: "/landing/supply-chain", icon: Globe, color: "#D80E16" },
    { title: "Trade Intelligence", desc: "Dados para roteirização final.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
  ],
  "passo-a-passo-importacao-brasil-2026": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule todos os tributos.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Classificador NCM com IA", desc: "Classifique produtos passo a passo.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte tarifas de 31 países.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "importacao-conta-ordem-encomenda": [
    { title: "Classificador NCM com IA", desc: "NCM correto para cada modalidade.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Impostos", desc: "Compare tributos das modalidades.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "custos-ocultos-importacao-orcamento": [
    { title: "Calculadora de Imposto de Importação", desc: "Simule custos totais ocultos.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
    { title: "Tarifário Global", desc: "Consulte todas as taxas por país.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "licenciamento-importacao-li-lpco": [
    { title: "Classificador NCM com IA", desc: "Identifique órgãos anuentes por NCM.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Impostos", desc: "Simule custos com licenciamento.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "importar-produtos-pereciveis-regras": [
    { title: "Classificador NCM com IA", desc: "Classifique perecíveis com precisão.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte regras por país para perecíveis.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "documentos-importacao-brasil-obrigatorios": [
    { title: "Classificador NCM com IA", desc: "Documentos baseados no NCM correto.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Calculadora de Impostos", desc: "Documentos fiscais automatizados.", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b" },
  ],
  "fiscalizacao-aduaneira-importacao": [
    { title: "Classificador NCM com IA", desc: "Reduza riscos de fiscalização.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte regras para evitar multas.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "exportar-brasil-habilitacao-desembaraco": [
    { title: "Smart Rank", desc: "Descubra os melhores países para exportar.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Diretório de Importadores", desc: "Encontre compradores no exterior.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
  "exportacao-competitiva-estrategias": [
    { title: "Smart Rank", desc: "Ranking de mercados competitivos.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Trade Intelligence", desc: "Dados para estratégia exportadora.", route: "/landing/import-dashboard", icon: BarChart3, color: "#10b981" },
  ],
  "certificacoes-internacionais-exportar": [
    { title: "Smart Rank", desc: "Mercados que exigem cada certificação.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Tarifário Global", desc: "Consulte exigências por país.", route: "/global-tariff", icon: Globe, color: "#10b981" },
  ],
  "regimes-aduaneiros-especiais-exportacao": [
    { title: "Classificador NCM com IA", desc: "NCM correto para regimes especiais.", route: "/landing/ncm-classifier", icon: Sparkles, color: "#D80E16" },
    { title: "Tarifário Global", desc: "Consulte alíquotas para regimes.", route: "/global-tariff", icon: Globe, color: "#f59e0b" },
  ],
  "exportacao-commodities-agricolas": [
    { title: "Smart Rank", desc: "Ranking de mercados para commodities.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Mapa de Frete Marítimo 3D", desc: "Rotas para commodities agrícolas.", route: "/maritime-freight-map", icon: Ship, color: "#0ea5e9" },
  ],
  "exportacao-pme-oportunidades": [
    { title: "Smart Rank", desc: "Oportunidades de mercado para PMEs.", route: "/landing/export-opportunities", icon: TrendingUp, color: "#8b5cf6" },
    { title: "Diretório de Importadores", desc: "3.8M+ compradores para PMEs.", route: "/landing/importadores", icon: Globe, color: "#ef4444" },
  ],
};

// ─── FAQ structured data ───
const postFAQs: Record<string, { question: string; answer: string }[]> = {
  "calculadora-imposto-importacao-2026": [
    { question: "Como calcular imposto de importação?", answer: "Use a fórmula: II = aduaneiro × alíquota II, depois IPI, PIS, COFINS e ICMS. Use nossa calculadora." },
    { question: "Quanto é o imposto de importação do Brasil?", answer: "A alíquota média é 11%, mas varia de 0% a 35% dependendo do NCM do produto." },
  ],
  "desembaraco-aduaneiro-como-funciona": [
    { question: "Quanto tempo demora o desembaraço aduaneiro?", answer: "De 3 a 7 dias úteis para DI eletrônica, podendo chegar a 30 dias se selecionado para fiscalização." },
    { question: "Quanto custa um despachante aduaneiro?", answer: "Entre R$ 800 e R$ 3.000 por desembaraço, dependendo da complexidade e valor da mercadoria." },
  ],
  "como-importar-da-china-guia-completo": [
    { question: "Quanto custa importar da China?", answer: "Depende do produto, mas inclua: preço FOB + frete + seguro + II (11%) + IPI + PIS + COFINS + ICMS." },
    { question: "Qual o melhor frete para importar da China?", answer: "Marítimo FCL para cargas grandes, aéreo para urgentes. Marítimo custa 5-10x menos que aéreo." },
  ],
  "como-saber-ncm-produto": [
    { question: "Como descobrir o NCM de um produto?", answer: "3 métodos: 1) Busca por descrição na plataforma, 2) Consulta manual na tabela NCM, 3) Classificação com IA." },
  ],
  "remessa-conforme-importacao-2026": [
    { question: "Como funciona o Remessa Conforme?", answer: "Regime que cobra ICMS de 17% para compras acima de USD 50 e 20% para abaixo. Plataformas devem se cadastrar." },
  ],
};

// ─── Semantic related posts (by tag intersection) ───
function getRelatedPosts(current: BlogPost, allPosts: BlogPost[], count = 3): BlogPost[] {
  const scored = allPosts
    .filter((p) => p.slug !== current.slug)
    .map((p) => {
      const intersection = (p.tags || []).filter((t) => (current.tags || []).includes(t)).length;
      const score = intersection * 10 + (p.readTime === current.readTime ? 1 : 0);
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.post);
}

// ─── Main Page Component ───

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  const tools = slug ? postTools[slug] || [] : [];
  
  // Lazy-load post content (keyPoints + markdown body)
  const [loadedContent, setLoadedContent] = useState<string | null>(null);
  const [loadedKeyPoints, setLoadedKeyPoints] = useState<string[] | undefined>(undefined);
  
  useEffect(() => {
    if (!slug) return;
    setLoadedContent(null);
    setLoadedKeyPoints(undefined);
    getPostContent(slug).then((data) => {
      if (data) {
        setLoadedContent(data.content);
        setLoadedKeyPoints(data.keyPoints);
      }
    });
  }, [slug]);
  
  // Auto-generate tool cards for posts without hardcoded postTools
  const autoTools = useMemo(() => {
    if (!post || tools.length > 0 || !post.tags) return []; // only use auto when no hardcoded tools
    const seen = new Set<string>();
    const result: typeof tools = [];
    for (const tag of post.tags) {
      const tagTools = tagToTools[tag];
      if (tagTools) {
        for (const t of tagTools) {
          if (!seen.has(t.route)) {
            seen.add(t.route);
            result.push(t);
          }
        }
      }
    }
    return result.slice(0, 3); // max 3 auto tools
  }, [post, tools.length]);
  
  const allTools = tools.length > 0 ? tools : autoTools;
  
  // Auto-generate service cards from tags
  const services = useMemo(() => {
    if (!post || !post.tags) return [];
    const seen = new Set<string>();
    const result: { title: string; desc: string; route: string; icon: React.ElementType }[] = [];
    for (const tag of post.tags) {
      const tagSvcs = tagToServices[tag];
      if (tagSvcs) {
        for (const s of tagSvcs) {
          if (!seen.has(s.route)) {
            seen.add(s.route);
            result.push(s);
          }
        }
      }
    }
    return result.slice(0, 4); // max 4 service cards
  }, [post]);
  const relatedPosts = useMemo(
    () => (post ? getRelatedPosts(post, blogPosts) : []),
    [post],
  );

  const todayISO = new Date().toISOString().split("T")[0];

  useSeo({
    title: post
      ? `${post.title} | Blog TRADEXA`
      : "Post não encontrado | Blog TRADEXA",
    description: post?.excerpt || "",
    keywords: post ? `blog, ${(post.tags || []).join(", ")}, TRADEXA` : "",
    canonical: post
      ? `https://www.tradexa.com.br/blog/${post.slug}`
      : undefined,
    publishedTime: post?.date || todayISO,
    modifiedTime: todayISO,
  });

  // Inject FAQPage structured data
  useEffect(() => {
    const faqs = slug ? postFAQs[slug] : undefined;
    if (!faqs || faqs.length === 0) return;

    const faqPageSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    };

    const id = "faq-ldjson";
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqPageSchema);

    return () => {
      const el = document.getElementById(id);
      if (el) el.remove();
    };
  }, [slug]);

  if (!post) {
    return (
      <SiteLayout>
        <section className="pt-32 pb-16 px-4 text-center">
          <h1 className="text-2xl font-bold text-[#0F111A] mb-4">
            Post não encontrado
          </h1>
          <Link to="/blog" className="text-[#D80E16] font-bold hover:underline">
            ← Voltar para o blog
          </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      {/* Structured data */}
      <StructuredData
        type="BlogPosting"
        data={{
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.date,
          image: post.image,
          url: `https://www.tradexa.com.br/blog/${post.slug}`,
        }}
      />

      {/* Reading progress bar */}
      <ReadingProgressBar />

      <article className="relative">
        {/* ── Hero Section ── */}
        <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {post.image ? (
            <>
              {/* Hero with cover image */}
              <div className="absolute inset-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F111A]/85 via-[#0F111A]/70 to-[#FAFAF9]" />
              </div>
            </>
          ) : (
            <>
              {/* Hero with particles (fallback) */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.08),transparent)]" />
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(216,14,22,0.03),transparent)]" />

          <div className="relative z-10 max-w-3xl mx-auto">
            <Link
              to="/blog"
              className={`inline-flex items-center gap-2 text-sm font-bold transition-colors mb-8 ${
                post.image ? "text-white/80 hover:text-white" : "text-[#5E6278] hover:text-[#D80E16]"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o blog
            </Link>

            <header>
              {/* Tags + Date row */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                {(post.tags || []).slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    className={`font-bold text-[10px] uppercase tracking-[0.15em] px-3 py-1 rounded-full border-0 ${
                      post.image
                        ? "bg-white/15 text-white"
                        : "bg-[#D80E16]/8 text-[#D80E16]"
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                <span
                  className={`flex items-center gap-1.5 text-sm ml-auto ${
                    post.image ? "text-white/70" : "text-[#5E6278]"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.date)}
                </span>
                <span
                  className={`flex items-center gap-1.5 text-sm ${
                    post.image ? "text-white/70" : "text-[#5E6278]"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {post.readTime} min
                </span>
              </div>

              <h1
                className={`text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mb-6 ${
                  post.image ? "text-white" : "text-[#0F111A]"
                }`}
              >
                {post.title.length > 120
                  ? post.title.substring(0, 117) + "..."
                  : post.title}
              </h1>

              <p
                className={`text-lg md:text-xl leading-relaxed ${
                  post.image ? "text-white/80" : "text-[#5E6278]"
                }`}
              >
                {post.excerpt}
              </p>
            </header>
          </div>
        </section>

        {/* ── Content Body ── */}
        <section className="pb-20 md:pb-28 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
          <div className="max-w-5xl mx-auto flex gap-10">
            {/* Floating TOC (desktop sidebar) */}
            <FloatingTOC content={loadedContent || ""} />

            {/* Main content column */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-black/[0.06] p-6 md:p-10 lg:p-12 shadow-sm">
                {/* Key Points Card */}
                {(loadedKeyPoints && loadedKeyPoints.length > 0) && (
                  <KeyPointsCard points={loadedKeyPoints} />
                )}

                {/* Markdown content */}
                <MarkdownRenderer content={loadedContent || ""} />

                {/* Newsletter + Glossário */}
                <div className="mt-12 grid md:grid-cols-5 gap-6 items-start">
                  <div className="md:col-span-3">
                    <NewsletterGate />
                  </div>
                  <div className="md:col-span-2">
                    <GlossarioWidget />
                  </div>
                </div>

                {/* Bottom CTA Banner */}
                <div className="mt-12">
                  <CTABanner
                    title="Coloque em prática com a TRADEXA"
                    desc="Use nossas ferramentas para classificar NCM, consultar tarifas em 31+ países e analisar dados reais de comércio exterior."
                    route="/register"
                    buttonText="Criar Conta Grátis"
                  />
                </div>

                {/* Related tools */}
                {allTools.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-lg font-extrabold text-[#0F111A] mb-4">
                      Ferramentas relacionadas
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allTools.map((tool) => (
                        <CTACard key={tool.route} {...tool} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Related services (auto-generated from tags) */}
                {services.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-lg font-extrabold text-[#0F111A] mb-4">
                      Serviços que podem ajudar
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {services.map((svc) => (
                        <ServiceCard key={svc.route} {...svc} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Related Posts (semantic) */}
              {relatedPosts.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-[#D80E16]" />
                    <h2 className="text-2xl font-extrabold text-[#0F111A]">
                      Artigos Relacionados
                    </h2>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.slug}
                        to={`/blog/${related.slug}`}
                        className="group block rounded-xl border border-black/[0.06] bg-white p-5 hover:shadow-[0_4px_20px_-8px_rgba(15,17,26,0.1)] hover:border-[#D80E16]/10 transition-all"
                      >
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {related.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#D80E16]/[0.06] text-[#D80E16]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-bold text-[#0F111A] mb-2 group-hover:text-[#D80E16] transition-colors text-sm leading-snug">
                          {related.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[#5E6278]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(related.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {related.readTime} min
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </article>
    </SiteLayout>
  );
}