"use client";
import { Shield } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function ConformidadeRegulatoriaLanding() {
  return (
    <ModuleLandingTemplate
      icon={Shield}
      color="#D80E16"
      title="Conformidade Regulatória"
      subtitle="Regulatory Compliance"
      heroDesc="Consulte as regulamentações aplicáveis ao seu produto: ANVISA, INMETRO, MAPA e IBAMA. Saiba quais certificações são obrigatórias."
      seoTitle="Conformidade Regulatória — ANVISA, INMETRO, MAPA | TRADEXA"
      seoDescription="Verifique exigências de ANVISA, INMETRO, MAPA e IBAMA para seu produto. Certificações obrigatórias antes de importar."
      features={[
        { name: "ANVISA", desc: "Regulamentação para produtos de saúde, cosméticos e alimentos." },
        { name: "INMETRO", desc: "Certificação de segurança para produtos industriais." },
        { name: "MAPA", desc: "Regras para produtos agropecuários e alimentos de origem animal." },
        { name: "IBAMA", desc: "Licenças ambientais para produtos com impacto ecológico." },
        { name: "Busca por NCM", desc: "Descubra automaticamente quais órgãos regulam seu produto." },
        { name: "Checklist", desc: "Lista de documentos e certificações exigidas por órgão." },
      ]}
      sections={[
        {
          title: "Evite barreiras regulatórias",
          content: "Muitos importadores têm cargas retidas na alfândega por falta de certificações obrigatórias. Nossa ferramenta identifica todos os órgãos anuentes para o seu NCM antes mesmo de você fechar a compra.",
          bullets: [
            "Descubra quais órgãos regulam seu produto",
            "Veja as certificações exigidas para liberação aduaneira",
            "Evite multas e retenção de carga por não conformidade",
          ],
        },
        {
          title: "Principais órgãos anuentes",
          content: "Cada categoria de produto está sujeita a regulamentações específicas. Um brinquedo precisa do INMETRO, um cosmético da ANVISA, e um produto de madeira do IBAMA. Consulte antes de importar.",
          bullets: [
            "ANVISA: medicamentos, cosméticos, alimentos, equipamentos médicos",
            "INMETRO: brinquedos, eletrodomésticos, pneus, materiais elétricos",
            "MAPA: carnes, laticínios, fertilizantes, sementes",
          ],
        },
      ]}
      ctaRoute="/ferramentas/conformidade-regulatoria"
    />
  );
}
