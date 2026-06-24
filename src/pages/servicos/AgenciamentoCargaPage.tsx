/**
 * Página de serviço — Frete Internacional Gerenciado (Agenciamento de Carga)
 */
import { Ship } from "lucide-react";
import { ServicePageTemplate, type ServicePageData } from "@/components/ServicePageTemplate";

const data: ServicePageData = {
  slug: "agenciamento-carga",
  title: "Frete Internacional Gerenciado",
  subtitle: "Agenciamento de carga completo: cotação, reserva, documentação, tracking e desembaraço — tudo gerenciado pela TRADEXA com visibilidade em tempo real.",
  description: "Combinamos nossa plataforma de inteligência de mercado com serviços operacionais de agenciamento de carga. Você pesquisa mercados e compradores na plataforma, e a TRADEXA gerencia todo o processo logístico — da reserva do container ao desembaraço aduaneiro no destino. Com 20+ armadores parceiros, tracking ao vivo via Supply Chain Map e suporte documental completo. Uma única interface para gerenciar cotações, reservas, documentação e rastreamento da sua carga.",
  icon: Ship,
  color: "#D80E16",
  benefits: [
    "Cotação multicanal com 20+ armadores (MSC, Maersk, CMA CGM, Hapag-Lloyd, COSCO)",
    "Reserva de container FCL/LCL em rotas globais",
    "Rastreamento ao vivo via Supply Chain Map — veja seu navio no mapa",
    "Documentação completa: BL, AWB, CRT, DU-E, Licença de Importação",
    "Despacho aduaneiro integrado (parceria com despachantes credenciados)",
    "Seguro internacional de carga com cobertura porta-a-porta",
    "Coordenação multimodal: marítimo + aéreo + rodoviário",
    "Armazenagem e cross-docking em SP, SC e Miami",
    "Suporte dedicado em português com time de logística experiente",
  ],
  howItWorks: [
    { step: "Solicitação de Cotação", desc: "Informe origem, destino, tipo de carga, peso/volume e urgência. Receba cotações de múltiplos armadores em até 24h." },
    { step: "Reserva e Confirmação", desc: "Escolha a melhor rota e preço. Cuidamos da reserva do container ou espaço aéreo com o armador selecionado." },
    { step: "Documentação e Despacho", desc: "Preparamos toda a documentação: BL, AWB, certidões, licenças. Coordenamos o desembaraço aduaneiro na origem." },
    { step: "Tracking ao Vivo", desc: "Acompanhe sua carga em tempo real no Supply Chain Map. Veja posição do navio/avião, status da documentação e ETA." },
    { step: "Desembaraço e Entrega", desc: "Coordenação do desembaraço no destino, armazenagem temporária e entrega porta-a-porta com tracking até a última milha." },
  ],
  faq: [
    { q: "Qual a diferença entre agenciamento de carga e cotação de frete?", a: "A cotação de frete é o levantamento de preços. O agenciamento de carga é o serviço completo: cotação + reserva + documentação + tracking + desembaraço. Nosso Frete Internacional Gerenciado inclui tudo." },
    { q: "Vocês trabalham com quais modais?", a: "Oferecemos marítimo (FCL e LCL), aéreo e rodoviário internacional. Para operações multimodais, combinamos os modais na rota mais eficiente." },
    { q: "Posso ver meu container no mapa?", a: "Sim! Todos os clientes de agenciamento têm acesso ao Supply Chain Map com tracking ao vivo do navio, posição, velocidade, destino e ETA — igual às companhias de navegação." },
    { q: "Quanto custa o serviço de agenciamento?", a: "O custo varia por rota, modal, tipo de carga e volume. Trabalhamos com fee fixo por container + percentual sobre o frete. Cotações são personalizadas. Solicite um orçamento sem compromisso." },
    { q: "Fazem também desembaraço aduaneiro?", a: "Sim! Temos parceria com despachantes credenciados em todos os portos do Brasil. O desembaraço pode ser contratado junto com o frete com desconto no combinado." },
    { q: "Atendem importação e exportação?", a: "Sim. Atendemos importadores e exportadores brasileiros em todas as modalidades, para qualquer país." },
  ],
};

export default function AgenciamentoCargaPage() {
  return <ServicePageTemplate data={data} />;
}
