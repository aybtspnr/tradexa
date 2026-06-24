"use client";
import { TrendingUp } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function CalculadoraDrawbackLanding() {
  return (
    <ModuleLandingTemplate
      icon={TrendingUp}
      color="#D80E16"
      title="Calculadora de Drawback"
      subtitle="Drawback Calculator"
      heroDesc="Calcule quanto você economiza com o regime de drawback: suspensão de II, IPI, PIS e COFINS para insumos de produtos exportados."
      seoTitle="Calculadora de Drawback — Suspensão de Tributos | TRADEXA"
      seoDescription="Simule a economia com drawback: suspensão de II, IPI, PIS e COFINS na importação de insumos para produtos exportados. Resultado em segundos."
      features={[
        { name: "Economia real", desc: "Veja exatamente quanto você deixa de pagar em tributos." },
        { name: "Suspensão total", desc: "II + IPI + PIS + COFINS em um único cálculo." },
        { name: "Simulação rápida", desc: "Insira os dados e veja o resultado em segundos." },
        { name: "Modalidades", desc: "Drawback Suspensão, Isenção e Restituição." },
        { name: "Relatório", desc: "Exporte o cálculo para usar na sua consultoria." },
        { name: "Conformidade", desc: "Verifique os requisitos para habilitação no regime." },
      ]}
      sections={[
        {
          title: "Drawback: economia garantida",
          content: "O drawback é um dos regimes aduaneiros especiais mais vantajosos para exportadores. Ele permite suspender ou isentar tributos na importação de insumos usados em produtos exportados, gerando economia de até 40% nos custos.",
          bullets: [
            "Suspensão de II, IPI, PIS e COFINS na importação",
            "Aplicável a insumos incorporados ao produto exportado",
            "Disponível nas modalidades Suspensão, Isenção e Restituição",
          ],
        },
        {
          title: "Sua empresa tem direito?",
          content: "Toda empresa que importa insumos para fabricar produtos posteriormente exportados pode se beneficiar do drawback. Use nossa calculadora para estimar a economia potencial antes de iniciar o processo.",
          bullets: [
            "Ideal para indústrias que exportam",
            "Compatível com drawback intermediário (fornecedor)",
            "Economia proporcional ao volume exportado",
          ],
        },
      ]}
      ctaRoute="/ferramentas/calculadora-drawback"
    />
  );
}
