/**
 * Página de serviço — Fulfillment Internacional
 */
import { Package } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "fulfillment",
  title: "Fulfillment Internacional",
  subtitle: "Armazenagem, picking, packing e distribuição B2B/B2C no Brasil e exterior. Preparação completa para e-commerce cross-border.",
  description: "Oferecemos centros de fulfillment estratégicos no Brasil e exterior para que você possa armazenar, preparar e distribuir seus produtos com eficiência. Nosso ...",
  icon: Package,
  color: "#f59e0b",
  benefits: [
    "Centros de fulfillment em SP, SC e Miami (FL)",
    "Armazenagem com controle de inventário em tempo real",
    "Picking e packing com embalagem personalizada da sua marca",
    "Integração com marketplaces e plataformas de e-commerce",
    "Gestão de devoluções e logística reversa",
    "Preparação para envios FBA (Fulfillment by Amazon)",
    "Distribuição B2B (atacado e varejo) e B2C (consumidor final)",
    "Relatórios mensais de desempenho logístico e custos",
  ],
  howItWorks: [
    { step: "Onboarding", desc: "Cadastramos seus produtos, definimos SLA de preparação e configuramos integração com seu e-commerce ou ERP." },
    { step: "Recebimento", desc: "Recebemos sua carga no centro de fulfillment, conferimos quantidade e qualidade, e armazenamos com etiquetagem individual." },
    { step: "Processamento de pedidos", desc: "Quando um pedido é feito (B2B ou B2C), nossa equipe faz o picking, packing e emite a etiqueta de envio automaticamente." },
    { step: "Expedição", desc: "Despachamos via transportadora parceira com tracking. Prazo de expedição: mesmo dia para pedidos até 14h." },
    { step: "Pós-venda", desc: "Gerenciamos devoluções, reembalagem e reintegração ao estoque quando necessário." },
  ],
  faq: [
    { q: "Quanto custa o fulfillment?", a: "Cobramos por item processado + armazenagem por m³ + frete de saída. O valor exato depende do volume e tipo de produto. Envie sua necessidade para um orçamento." },
    { q: "Qual o prazo de entrega para o cliente final?", a: "No Brasil: 2-7 dias úteis (dependendo da região). Nos EUA a partir de Miami: 2-5 dias úteis para todo o território americano." },
    { q: "Fazem fulfillment para Amazon FBA?", a: "Sim! Preparamos seus produtos conforme as exigências da Amazon (etiquetas, embalagem, paletização) e enviamos para os centros de distribuição FBA." },
    { q: "Preciso ter CNPJ para usar o serviço?", a: "Sim. Atendemos pessoas jurídicas estabelecidas no Brasil ou exterior." },
  ],
};

export default function FulfillmentPage() {
  return <ServicePageTemplate data={data} />;
}
