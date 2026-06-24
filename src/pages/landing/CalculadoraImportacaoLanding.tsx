"use client";
import { Calculator } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function CalculadoraImportacaoLanding() {
  return (
    <ModuleLandingTemplate
      icon={Calculator}
      color="#ef4444"
      title="Calculadora de Imposto de Importação"
      subtitle="Import Tax Calculator"
      heroDesc="Calcule todos os tributos de importação do Brasil: II, IPI, PIS, COFINS, ICMS por estado. Ferramenta com alíquotas atualizadas 2026."
      seoTitle="Calculadora de Imposto de Importação | TRADEXA"
      seoDescription="Calculadora de imposto de importação. Calcule II, IPI, PIS, COFINS e ICMS por estado brasileiro. Simule custos aduaneiros completos antes de importar."
      features={[
        { name: "Cálculo de tributos", desc: "II, IPI, PIS, COFINS e ICMS calculados automaticamente com base no NCM e valor aduaneiro." },
        { name: "ICMS por estado", desc: "Alíquotas interestaduais e internas atualizadas para todos os 27 estados brasileiros." },
        { name: "Cenários comparativos", desc: "Compare o custo total entre diferentes países de origem, modos de transporte e regimes tributários." },
        { name: "Estimativas de frete", desc: "Valores de frete marítimo e aéreo por rota, peso e dimensão para calcular o custo CIF." },
        { name: "Custo landed total", desc: "Valor final do produto desembaracado no seu armazém, incluindo todos os impostos e taxas." },
        { name: "Exportação em PDF", desc: "Gere um relatório em PDF com memória de cálculo completa para auditoria e compliance." }
      ]}
      sections={[
        {
          title: "Precisão fiscal garantida",
          content: "Nossa calculadora utiliza alíquotas oficiais atualizadas de todos os tributos de importação, incluindo as particularidades de cada estado para ICMS, regimes especiais como drawback, ex-tarifário e ZFM.",
          bullets: ["Alíquotas atualizadas automaticamente com base na legislação vigente", "Suporte a regimes especiais: drawback, ex-tarifário, RECAP, Zona Franca de Amazônia", "Memória de cálculo detalhada e auditável para cada tributo"]
        },
        {
          title: "Planejamento de importação",
          content: "Simule o custo total da sua importação antes de fechar o contrato. Compare fornecedores em diferentes países e descubra qual combinação de origem, modal e quantidade oferece o menor custo total no Brasil."
        }
      ]}
      ctaRoute="/global-tariff"
      relatedModules={[
        { label: "Classificador NCM", route: "/landing/ncm-classifier" },
        { label: "Dashboard Importação", route: "/landing/import-dashboard" },
        { label: "Comparação de Países", route: "/landing/country-comparison" }
      ]}
    />
  );
}
