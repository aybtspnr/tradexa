"use client";
import { FileText } from "lucide-react";
import { ModuleLandingTemplate } from "./ModuleLandingTemplate";

export default function GeradorDocumentosLanding() {
  return (
    <ModuleLandingTemplate
      icon={FileText}
      color="#10b981"
      title="Gerador de Documentos"
      subtitle="Document Generator"
      heroDesc="Gere documentos de importação e exportação: DI, LI, Nota de Compra e mais. Exporte em PDF."
      seoTitle="Gerador de Documentos de Importação e Exportação | TRADEXA"
      seoDescription="Gere Declaração de Importação (DI), Licença de Importação (LI) e documentos aduaneiros prontos para impressão em PDF."
      features={[
        { name: "DI e LI", desc: "Declaração de Importação e Licença de Importação automáticas." },
        { name: "Preenchimento automático", desc: "Campos preenchidos com dados da sua operação." },
        { name: "Exportação PDF", desc: "Documento pronto para impressão e protocolo." },
        { name: "Modelos atualizados", desc: "Formatos conforme exigências da Receita Federal." },
        { name: "Múltiplos documentos", desc: "Proforma Invoice, Packing List, Nota de Compra." },
        { name: "Histórico", desc: "Acesse documentos gerados anteriormente." },
      ]}
      sections={[
        {
          title: "Documentação sem complicação",
          content: "Gerar documentos de importação manualmente é demorado e sujeito a erros. Nossa ferramenta automatiza o preenchimento de campos repetitivos, garantindo consistência e conformidade.",
          bullets: [
            "Preencha os dados da operação uma única vez",
            "Documentos gerados em segundos no formato correto",
            "Compatível com exigências da Receita Federal e Siscomex",
          ],
        },
        {
          title: "Documentos disponíveis",
          content: "A ferramenta gera os principais documentos necessários em operações de comércio exterior, evitando retrabalho e garantindo que todos os campos obrigatórios sejam preenchidos.",
          bullets: [
            "DI (Declaração de Importação) — dados completos da operação",
            "LI (Licença de Importação) — para produtos com anuência",
            "Proforma Invoice, Packing List e Nota de Compra",
          ],
        },
        {
          title: "Como usar no seu negócio",
          content: "O Gerador de Documentos da TRADEXA elimina a necessidade de preencher manualmente formulários repetitivos de comércio exterior. Basta cadastrar os dados da sua empresa uma vez — CNPJ, razão social, endereço — e eles são reaproveitados em todos os documentos. Para cada operação, você informa os dados do importador/exportador, produtos (NCM, quantidade, valor) e condições comerciais (Incoterm, modal, origem e destino). A ferramenta gera automaticamente a DI com todos os tributos calculados, a LI com as anuências aplicáveis, além de Proforma Invoice e Packing List em inglês ou português. Todos os documentos seguem os formatos exigidos pela Receita Federal e pelo Siscomex, reduzindo o risco de erros que podem atrasar o desembaraço. Os PDFs gerados incluem sua logo e dados bancários, prontos para enviar ao fornecedor, despachante ou banco. Ideal para despachantes que precisam gerar dezenas de documentos por dia e para importadores que querem autonomia na preparação da documentação."
        },
      ]}
      ctaRoute="/ferramentas/gerador-documentos"
    />
  );
}
