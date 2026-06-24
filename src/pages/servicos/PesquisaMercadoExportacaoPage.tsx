/**
 * Página de serviço — Pesquisa de Mercado para Exportação
 */
import { BarChart3 } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "pesquisa-mercado-exportacao",
  title: "Pesquisa de Mercado para Exportação",
  subtitle: "Identificamos os mercados mais promissores para seus produtos com dados reais de comércio exterior, análise de concorrência e potencial de demanda.",
  description: "Nossa equipe de inteligência comercial realiza uma análise aprofundada do mercado-alvo para seus produtos, combinando dados atualizados de importação, tarifa...",
  icon: BarChart3,
  color: "#D80E16",
  benefits: [
    "Relatório completo de potencial de mercado por país-produto",
    "Análise de concorrência local e internacional no destino",
    "Benchmark de preços praticados no mercado-alvo",
    "Identificação de barreiras tarifárias e não-tarifárias",
    "Tendências de consumo e sazonalidade por região",
    "Recomendações de canais de entrada e distribuição",
    "Estimativa de market share alcançável",
    "Atualização trimestral com dados frescos de comércio exterior",
  ],
  howItWorks: [
    { step: "Briefing inicial", desc: "Entendemos seu produto, capacidade produtiva e objetivos de exportação em uma call de 30 minutos." },
    { step: "Coleta de dados", desc: "Nossa plataforma coleta dados de 5+ fontes: comércio exterior, UN Comtrade, TradeMap, OEC e bases regulatórias." },
    { step: "Análise estratégica", desc: "Nossa equipe analisa os dados e produz o relatório com rankings, gráficos e recomendações acionáveis." },
    { step: "Apresentação", desc: "Apresentamos os resultados em call com slides, respondendo dúvidas e ajustando o plano." },
    { step: "Acompanhamento", desc: "Monitoramos o mercado escolhido por 3 meses e enviamos alertas de mudanças relevantes." },
  ],
  faq: [
    { q: "Quanto tempo leva para receber o relatório?", a: "O prazo padrão é de 10 dias úteis após o briefing inicial. Para urgências, temos o plano Express em 5 dias úteis." },
    { q: "Quais países vocês analisam?", a: "Temos cobertura global através de bases de dados atualizados. Os países mais solicitados são EUA, Alemanha, China, Japão, Emirados Árabes, Chile, Colômbia e México." },
    { q: "Preciso ter um produto definido?", a: "Sim. O relatório é feito sob medida para o(s) HS code(s) dos seus produtos. Se você não souber o código, oferecemos o serviço de classificação NCM/HS como etapa preliminar." },
    { q: "Qual o custo de uma pesquisa de mercado?", a: "O valor depende do número de países e profundidade da análise. Agende uma call para receber um orçamento personalizado." },
  ],
};

export default function PesquisaMercadoExportacaoPage() {
  return <ServicePageTemplate data={data} />;
}
