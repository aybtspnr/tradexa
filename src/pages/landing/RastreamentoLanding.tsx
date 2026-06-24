"use client";
import { Ship } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function RastreamentoLanding() {
  return (
    <ModuleLandingTemplate
      icon={Ship}
      color="#D80E16"
      title="Rastreamento de Carga"
      subtitle="Cargo Tracking"
      heroDesc="Rastreie containers marítimos e cargas express em tempo real. DHL, FedEx, UPS, Maersk, ZIM e mais."
      seoTitle="Rastreamento de Container e Carga Express | TRADEXA"
      seoDescription="Rastreamento gratuito de containers marítimos e cargas express: DHL, FedEx, UPS, Maersk, ZIM e mais transportadoras. Sem cadastro."
      features={[
        { name: "Múltiplas transportadoras", desc: "DHL, FedEx, UPS, Maersk, ZIM e mais." },
        { name: "Gratuito", desc: "Sem necessidade de cadastro ou pagamento." },
        { name: "Tempo real", desc: "Status atualizado da sua carga a cada consulta." },
        { name: "Container e express", desc: "Suporte a tracking marítimo e courier internacional." },
        { name: "Histórico", desc: "Acompanhe todo o trajeto da sua remessa." },
        { name: "Notificações", desc: "Alertas de mudança de status da carga." },
      ]}
      sections={[
        {
          title: "Rastreamento simplificado",
          content: "Acompanhe suas cargas internacionais em um único lugar. Suporte às principais transportadoras mundiais de container e courier express, com status em tempo real.",
          bullets: [
            "Marítimo: Maersk, MSC, ZIM, Hapag-Lloyd e mais",
            "Courier: DHL, FedEx, UPS, TNT",
            "API integrada com as principais transportadoras",
          ],
        },
        {
          title: "Visibilidade total",
          content: "Saber onde sua carga está e quando chega é essencial para planejar desembaraço, logística interna e estoque. Nossa ferramenta oferece visibilidade ponta a ponta.",
          bullets: [
            "Consulte múltiplos tracking numbers de uma vez",
            "Veja o histórico completo de movimentação",
            "Antecipe atrasos e planeje com precisão",
          ],
        },
        {
          title: "Como usar no seu negócio",
          content: "O Rastreamento de Carga da TRADEXA unifica em uma única tela o tracking das principais transportadoras do mundo. Para importadores que trabalham com múltiplos fornecedores e transportadoras, elimina a necessidade de acessar sites diferentes para cada remessa. Basta digitar o número de tracking (container, AWB ou código de rastreio) e o sistema consulta automaticamente a transportadora correta. O histórico completo de movimentação fica salvo para consulta futura e você pode ativar notificações para ser avisado quando a carga mudar de status. A ferramenta suporta os principais operadores de container (Maersk, MSC, ZIM, Hapag-Lloyd, CMA CGM, Evergreen) e serviços express (DHL, FedEx, UPS, TNT). É 100% gratuita e não requer cadastro — diferentemente de outros serviços de tracking que cobram ou exigem login. Ideal para despachantes, trading companies e importadores que gerenciam dezenas de remessas simultaneamente e precisam de agilidade na consulta."
        },
      ]}
      ctaRoute="/rastreamento"
    />
  );
}
