/**
 * Solução para Importadores — landing page agrupando ferramentas e serviços
 */
import { Search, Globe, Calculator, Ship, Shield, Navigation } from "lucide-react";
import { SolutionPageTemplate, type SolutionPageData } from "@/components/SolutionPageTemplate";

const data: SolutionPageData = {
  slug: "importadores",
  audience: "Importadores",
  title: "Importe com Inteligência e Confiança",
  subtitle: "Da classificação NCM ao desembaraço aduaneiro — dados, ferramentas e serviços integrados para importar do mundo todo.",
  heroDesc: "Classifique produtos com IA, consulte tarifas de 31 países, calcule impostos, rastreie cargas ao vivo e gerencie todo o processo de importação em uma única plataforma.",
  color: "#D80E16",
  painPoints: [
    {
      pain: "Classificar produtos no NCM/HS correto é demorado e arriscado — um código errado pode gerar multas e atrasos.",
      solution: "Descreva qualquer produto em português e nossa IA retorna o NCM, HS e HTS em segundos, com alíquotas completas de II, IPI, PIS, COFINS e ICMS por estado.",
    },
    {
      pain: "Comparar tarifas de importação entre países exige consultar dezenas de sites e tabelas diferentes.",
      solution: "O Tarifário Global da TRADEXA reúne alíquotas de importação de 31 países em um único lugar. Compare tarifas, simule custos totais e identifique a melhor origem.",
    },
    {
      pain: "Cotas de frete com múltiplos armadores, documentação e rastreamento — gerenciar logística internacional é complexo e fragmentado.",
      solution: "Com o Frete Internacional Gerenciado, você solicita cotação com 20+ armadores, acompanha a carga ao vivo no Supply Chain Map e tem suporte documental completo — do BL ao desembaraço.",
    },
    {
      pain: "Despacho aduaneiro, licenças (ANVISA, INMETRO, MAPA) e regimes especiais — a burocracia brasileira é um dos maiores gargalos.",
      solution: "Oferecemos despacho aduaneiro em todos os portos do Brasil, consultoria em regimes especiais (drawback, ex-tarifário, RECOF) e conformidade regulatória integrada.",
    },
  ],
  tools: [
    { title: "Classificador IA NCM", route: "/landing/ncm-classifier", icon: Search, color: "#D80E16", desc: "Classificação automática de produtos em NCM/HS/HTS" },
    { title: "Tarifário Global", route: "/landing/tariff-calculator", icon: Globe, color: "#f59e0b", desc: "Alíquotas de importação em 31 países" },
    { title: "Calculadora de Impostos", route: "/landing/calculadora-importacao", icon: Calculator, color: "#10b981", desc: "Simule II, IPI, PIS, COFINS e ICMS por estado" },
    { title: "Frete Internacional Gerenciado", route: "/servicos/agenciamento-carga", icon: Ship, color: "#D80E16", desc: "Cotação, reserva, tracking e documentação completos" },
    { title: "Despacho Aduaneiro", route: "/servicos/despacho-aduaneiro", icon: Shield, color: "#10b981", desc: "Desembaraço em todos os portos do Brasil" },
    { title: "Track & Trace", route: "/landing/track-trace", icon: Navigation, color: "#D80E16", desc: "Navios e aviões cargueiros ao vivo no mapa mundial" },
  ],
  benefits: [
    "Inteligência artificial para classificação de produtos — reduza erros e multas",
    "Maior base de tarifas de importação do Brasil — 31 países cobertos",
    "Agenciamento de carga integrado com plataforma de dados",
    "Rastreamento ao vivo de navios e containers no mapa",
    "Despacho aduaneiro em todos os portos e aeroportos do Brasil",
    "Suporte documental completo: Licenças, certificações e regimes especiais",
    "Plano grátis para começar — sem cartão de crédito",
  ],
  ctaRoute: "/register",
};

export default function ImportadoresSolucaoPage() {
  return <SolutionPageTemplate data={data} />;
}
