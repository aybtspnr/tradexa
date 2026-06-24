"use client";
import { Newspaper } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function NoticiasComexLanding() {
  return (
    <ModuleLandingTemplate
      icon={Newspaper}
      color="#f59e0b"
      title="Noticias do Comercio Exterior"
      subtitle="Trade News"
      heroDesc="Fique por dentro das ultimas noticias de tarifas, acordos comerciais, regulamentacao e mercados."
      seoTitle="Noticias do Comercio Exterior — Ultimas Novidades | TRADEXA"
      seoDescription="Noticias atualizadas sobre comercio exterior: tarifas, acordos, regulamentacao aduaneira, mercados e cambio."
      features={[
        { name: "Tarifas e Acordos", desc: "Acompanhe mudancas tarifarias, acordos comerciais bilaterais e multilaterais." },
        { name: "Regulamentacao Aduaneira", desc: "Novas regras da RFB, DUIMP, licencas obrigatorias e alteracoes normativas." },
        { name: "Mercados e Commodities", desc: "Precos de soja, cafe, carne, minerio e outras commodities de exportacao." },
        { name: "Logistica e Frete", desc: "Indices de frete, capacity dos navios, congestoes portuarias e tendencias." },
        { name: "Cambio e Financas", desc: "Cotacao do dolar, spreads cambiais, credito exportador e financiamento." },
        { name: "Alertas de Mercado", desc: "Notificacoes sobre mudancas que afetam diretamente sua operacao." },
      ]}
      sections={[
        {
          title: "Comercio Exterior em Tempo Real",
          content: "O mercado de comercio exterior esta em constante movimento. Tarifas mudam, acordos sao negociados, regras aduaneiras sao atualizadas. Nossa equipe seleciona as noticias mais relevantes para importadores e exportadores brasileiros.",
          bullets: [
            "Curadoria especializada por profissionais de comex",
            "Foco no impacto pratico para operacoes brasileiras",
            "Fontes oficiais: MDIC, SECEX, Camara do Comercio, Portal SISCOMEX",
          ],
        },
        {
          title: "Fique um passo a frente",
          content: "Empresas que acompanham as noticias de comercio exterior antecipam mudancas regulatórias e oportunidades de mercado. Nossa plataforma organiza as informacoes por categoria para que voce encontre rapido o que importa.",
          bullets: [
            "Categorias organizadas por area de interesse",
            "Resumos executivos para decisao rapida",
            "Links para fontes atualizadas e documentos completos",
          ],
        },
      ]}
      ctaRoute="/noticias"
    />
  );
}
