import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

const routeMeta: Record<string, { title: string; subtitle?: string }> = {




  "/importers-map": { title: "Mapa Comercial", subtitle: "Exportação e importação do Brasil por país, estado e cidade" },

  "/dashboard": { title: "Painel Integrado", subtitle: "Visão geral da plataforma Tradexa" },
  "/intelligence": { title: "Inteligência Comercial", subtitle: "Dados de importação, exportação, frete e mapa interativo" },
  "/ai-search": { title: "Busca IA", subtitle: "Encontre produtos com inteligência artificial" },
  "/hs-lookup": { title: "Consulta HS", subtitle: "Classificação harmonizada" },
  "/hts-lookup": { title: "Consulta HTS", subtitle: "Tarifas dos EUA" },

  "/plans": { title: "Planos", subtitle: "Escolha seu plano" },

  "/suppliers": { title: "Fornecedores", subtitle: "Oportunidades de exportação" },
  "/trade-intelligence": { title: "Inteligência Comercial", subtitle: "Dados de comércio" },
  "/import-export-data": { title: "Export Import Data", subtitle: "Dados de exportação e importação por NCM e município" },
  "/settings": { title: "Configurações", subtitle: "Personalize sua conta" },
  "/history": { title: "Histórico", subtitle: "Suas buscas anteriores" },
  "/global-tariff": { title: "Tarifas Globais", subtitle: "Consulta de tarifas mundiais" },
  "/potential-importers": { title: "Importadores Potenciais", subtitle: "Encontre importadores" },
  "/opportunity-radar": { title: "Radar de Oportunidades", subtitle: "Cruza importadores com tarifas baixas" },
  "/global-trade": { title: "Global Trade", subtitle: "Explorador global" },
  "/maritime-freight-map": { title: "Frete Marítimo — Cotações", subtitle: "Cotações de frete marítimo FCL e LCL" },
  "/port-intelligence": { title: "Port Intelligence EUA", subtitle: "Volume de importações por porto dos EUA" },
  "/importadores": { title: "Diretório de Importadores", subtitle: "Importadores mundiais" },
  "/importadores-hs/:hs": { title: "Importadores por HS", subtitle: "Filtrado por código HS" },
  "/admin": { title: "Painel Admin", subtitle: "Gerenciamento do sistema" },
  "/admin/ncm": { title: "Admin NCM", subtitle: "Gerenciamento de NCMs" },
  "/admin/hs": { title: "Admin HS", subtitle: "Gerenciamento de HS" },
  "/team": { title: "Equipe", subtitle: "Gerencie sua equipe multiusuário" },
};

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const meta = routeMeta[location.pathname] || { title: "Tradexa", subtitle: "" };

  return (
    <DashboardLayout title={meta.title} subtitle={meta.subtitle}>
      {children}
    </DashboardLayout>
  );
}
