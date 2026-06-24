"use client";
import { Handshake } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function SimuladorAcordosComerciaisLanding() {
  return (
    <ModuleLandingTemplate
      icon={Handshake}
      color="#8b5cf6"
      title="Simulador de Acordos Comerciais"
      subtitle="Trade Agreements"
      heroDesc="Simule o impacto de acordos comerciais nas tarifas. Veja quanto você economiza com Mercosul, ALADI e SGP."
      seoTitle="Simulador de Acordos Comerciais — Mercosul, ALADI, SGP | TRADEXA"
      seoDescription="Simule reduções tarifárias de acordos comerciais: Mercosul, ALADI, SGP. Compare alíquotas com e sem preferência tarifária."
      features={[
        { name: "Acordos reais", desc: "Mercosul, ALADI, SGP e acordos bilaterais do Brasil." },
        { name: "Margem de preferência", desc: "Redução tarifária aplicável ao seu NCM." },
        { name: "Simulação", desc: "Compare custo com e sem acordo comercial." },
        { name: "Regras de origem", desc: "Verifique se seu produto atende aos critérios." },
        { name: "Certificados", desc: "Saiba quais certificados de origem são necessários." },
        { name: "Economia anual", desc: "Projeção de economia com base no volume exportado." },
      ]}
      sections={[
        {
          title: "Aproveite preferências tarifárias",
          content: "O Brasil possui acordos comerciais que podem reduzir ou zerar tarifas de importação para milhares de produtos. Muitas empresas pagam tarifas cheias sem saber que poderiam usar preferências tarifárias.",
          bullets: [
            "Mercosul: tarifa zero para a maioria dos produtos entre membros",
            "ALADI: preferências tarifárias com países da América Latina",
            "SGP: Sistema Geral de Preferências com países desenvolvidos",
          ],
        },
        {
          title: "Economia potencial",
          content: "Dependendo do acordo e do produto, a economia tarifária pode chegar a 100% da alíquota de importação. Use o simulador para quantificar essa economia antes de negociar.",
          bullets: [
            "Simule com e sem acordo para visualizar a diferença",
            "Descubra automaticamente quais acordos se aplicam ao seu NCM",
            "Projete economia anual baseada no seu volume de importação",
          ],
        },
      ]}
      ctaRoute="/ferramentas/simulador-acordos-comerciais"
    />
  );
}
