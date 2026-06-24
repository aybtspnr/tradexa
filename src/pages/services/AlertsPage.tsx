"use client";

import GenericServicePage from "./GenericServicePage";

export default function AlertsPage() {
  return (
    <GenericServicePage
      badge="Alertas Automáticos"
      title="Nunca Perca uma Oportunidade"
      description="Receba notificações personalizadas sobre variações tarifárias, novos mercados e mudanças no cenário de comércio exterior."
      ctaRoute="/seasonal-alerts"
      ctaText="Configurar Alertas"
      features={[
        {"icon": "BellRing", "title": "Variação Tarifária", "desc": "Seja avisado quando alíquotas de importação/exportação mudarem."},
        {"icon": "Target", "title": "Novas Oportunidades", "desc": "Alertas quando mercados emergentes aparecerem para seu produto."},
        {"icon": "TrendingUp", "title": "Tendências", "desc": "Notificações de crescimento ou queda de volumes por mercado."},
        {"icon": "Shield", "title": "Concorrência", "desc": "Monitoramento de novos competidores no mercado brasileiro."},
        {"icon": "Newspaper", "title": "Notícias", "desc": "Alertas sobre acordos comerciais, sanções e regulamentações."},
        {"icon": "FileText", "title": "Relatórios", "desc": "Resumos periódicos com todas as mudanças relevantes para você."},
      ]}
      seoTitle="Alertas Automáticos para Comércio Exterior"
      seoParagraphs={[
        "O mercado de comércio exterior muda constantemente. Novas tarifas, acordos comerciais, sanções e tendências de mercado podem criar ou destruir oportunidades em dias. Nosso sistema de alertas mantém você informado em tempo real.",
        "Configure alertas por produto (NCM), país, faixa de preço ou volume. Quando algo relevante acontece, você recebe notificação por email ou dentro da plataforma. Nunca mais perca uma oportunidade porque 'não sabia que o mercado tinha mudado'.",
        "O monitoramento de concorrência é especialmente útil: quando um novo importador aparece no seu segmento, ou quando um concorrente muda de fornecedor, você é notificado imediatamente. Informação antecipada é vantagem competitiva.",
      ]}
    />
  );
}
