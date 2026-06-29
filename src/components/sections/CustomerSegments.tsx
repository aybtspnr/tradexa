"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ShoppingCart,
  Truck,
  Globe,
  Package,
  Users,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Clock,
  Shield,
  Ship,
  Plane,
  Warehouse,
  BarChart3
} from "lucide-react";
import { PremiumCard, PremiumButton } from "@/components/premium";

interface Segment {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  benefits: string;
  features: string[];
  cta: string;
  color: string;
  bgColor: string;
}

const segments: Segment[] = [
  {
    id: "import-export",
    icon: Globe,
    title: "Importação e Exportação",
    description: "Sua operação de comércio exterior completa, do radar ao desembaraço",
    benefits: "Reduza custos e prazos com nossa rede de parceiros verificados",
    features: [
      "Habilitação de Radar Siscomex",
      "Classificação fiscal NCM",
      "Cotação de fretes marítimos e aéreos",
      "Desembaraço aduaneiro ágil",
      "Tracking em tempo real",
      "Gestão de documentos digitais"
    ],
    cta: "Abrir Operação",
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50"
  },
  {
    id: "ecommerce",
    icon: ShoppingCart,
    title: "E-commerce Cross-Border",
    description: "Venda para o mundo com logística integrada e experiência local",
    benefits: "Expanda suas vendas internacionais sem complicação logística",
    features: [
      "Integração com Shopify, Vtex, WooCommerce",
      "Cálculo automático de impostos",
      "Fulfillment em 7 países",
      "Couriers com desconto corporativo",
      "Checkout internacional",
      "Experiência localizada por país"
    ],
    cta: "Começar a Vender",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50"
  },
  {
    id: "national",
    icon: Truck,
    title: "Distribuição Nacional",
    description: "Transporte de cargas em todo território brasileiro",
    benefits: "Capilaridade nacional com rastreamento e segurança",
    features: [
      "Cobertura em todos os estados",
      "Rede de transportadores verificados",
      "Rastreamento GPS em tempo real",
      "Entregas fracionadas e dedicadas",
      "Seguro de carga incluso",
      "Pagamento facilitado"
    ],
    cta: "Cotar Frete Nacional",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50"
  },
  {
    id: "fulfillment",
    icon: Warehouse,
    title: "Fulfillment e Estoque",
    description: "Armazenagem e distribuição em hubs estratégicos",
    benefits: "Reduza lead time de entrega e custos de frete",
    features: [
      "Hubs em 7 países",
      "Pick & pack em 24h",
      "Gestão de estoque em tempo real",
      "Integração com marketplaces",
      "Devoluções e reversa",
      "Embalagem personalizada"
    ],
    cta: "Estruturar Hub",
    color: "from-red-500 to-rose-600",
    bgColor: "bg-red-50"
  },
  {
    id: "trading",
    icon: Building2,
    title: "Trading Company",
    description: "Intermediação de negócios internacionais com apoio completo",
    benefits: "Opere múltiplos clientes com eficiência e escala",
    features: [
      "Gestão multi-cliente",
      "Dashboard personalizado",
      "API de integração",
      "Relatórios analíticos",
      "Compliance regulatório",
      "Gerente de conta dedicado"
    ],
    cta: "Falar com Consultor",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-50"
  },
  {
    id: "market-intelligence",
    icon: BarChart3,
    title: "Market Intelligence",
    description: "Análise de mercado por NCM para decisões estratégicas",
    benefits: "Não entregamos apenas análise — conectamos o insight à operação",
    features: [
      "Panorama de importação/exportação",
      "Mapeamento de concorrentes",
      "Benchmark de preços (FOB/CIF)",
      "Barreiras regulatórias",
      "Viabilidade logística e tributária",
      "Plano de entrada no mercado"
    ],
    cta: "Solicitar Análise",
    color: "from-teal-500 to-emerald-600",
    bgColor: "bg-teal-50"
  },
];

export function CustomerSegmentsSection() {
  const navigate = useNavigate();

  const handleComingSoon = () => {
    navigate("/");
  };

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            Segmentos
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Uma plataforma, múltiplas operações
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Escolha seu perfil de atuação e tenha acesso a todos os serviços da plataforma Tradexa conforme sua assinatura
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {segments.map((segment, i) => (
            <motion.div
              key={segment.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <PremiumCard className="h-full overflow-hidden">
                <div className="p-6 lg:p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${segment.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <segment.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 mb-2">
                        {segment.title}
                      </h3>
                      <p className="text-slate-600 font-medium">{segment.description}</p>
                    </div>
                  </div>

                  <div className={`${segment.bgColor} rounded-xl p-4 mb-6`}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Principal Benefício</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{segment.benefits}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Recursos Incluídos:</h4>
                    <ul className="space-y-2">
                      {segment.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-sm font-bold text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <PremiumButton
                    onClick={handleComingSoon}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {segment.cta}
                    <ArrowRight className="w-5 h-5" />
                  </PremiumButton>
                </div>
              </PremiumCard>
            </motion.div>
          ))}
        </div>

        {/* Comparison CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-slate-600 font-medium mb-4">
            Não sabe qual perfil escolher?
          </p>
          <a
            href="mailto:contato@tradexa.com.br"
            className="inline-flex items-center gap-2 text-red-600 font-bold hover:underline"
          >
            Fale com um consultor e receba orientação personalizada
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}