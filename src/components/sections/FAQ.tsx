"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { PremiumCard } from "@/components/premium";
import StructuredData from "@/components/StructuredData";

interface FAQItem {
  question: string;
  answer: string;
  category: "Geral" | "Fretes" | "Importação" | "E-commerce" | "Fulfillment";
}

const faqs: FAQItem[] = [
  {
    category: "Geral",
    question: "Como funciona a plataforma TRADEXA?",
    answer: "A TRADEXA é uma plataforma unificada que conecta sua empresa aos melhores operadores logísticos do mundo. Você abre uma demanda, recebe cotações de parceiros verificados e gerencia toda a operação em um único lugar, com rastreamento em tempo real e suporte dedicado."
  },
  {
    category: "Geral",
    question: "Quais tipos de empresas podem usar a TRADEXA?",
    answer: "Atendemos importadores, exportadores, e-commerces, traders, transportadoras e caminhoneiros autônomos. Temos soluções específicas para cada perfil de cliente."
  },
  {
    category: "Geral",
    question: "A TRADEXA cobra alguma taxa de adesão?",
    answer: "Não cobramos taxa de adesão. Você paga apenas pelos serviços logísticos que contratar. As cotações são gratuitas e sem compromisso."
  },
  {
    category: "Fretes",
    question: "Quais modais de transporte vocês trabalham?",
    answer: "Trabalhamos com frete marítimo (FCL e LCL), frete aéreo, frete rodoviário nacional e internacional, e soluções multimodais combinando diferentes modais para otimizar custo e prazo."
  },
  {
    category: "Fretes",
    question: "Qual o prazo médio para uma cotação?",
    answer: "Cotações de frete marítimo levam de 2-4 horas úteis. Frete aéreo em até 1 hora. Rodoviário nacional em até 30 minutos. Para operações complexas, pode levar até 24 horas."
  },
  {
    category: "Importação",
    question: "O que é necessário para habilitar o Radar?",
    answer: "Para habilitar o Radar Siscomex, precisamos de: contrato social, CNPJ ativo, inscrições estaduais e municipais, e documentação do contador. O processo leva de 5-10 dias úteis."
  },
  {
    category: "Importação",
    question: "Vocês fazem classificação fiscal NCM?",
    answer: "Sim! Nossa equipe de comércio exterior faz a classificação fiscal completa das suas mercadorias, evitando autuações e garantindo a tributação correta."
  },
  {
    category: "E-commerce",
    question: "Quais plataformas de e-commerce vocês integram?",
    answer: "Integramos nativamente com Shopify, WooCommerce, Vtex, Magento, Nuvemshop e outras. Também temos API para integrações customizadas."
  },
  {
    category: "E-commerce",
    question: "Como funciona o cálculo de impostos para e-commerce internacional?",
    answer: "Calculamos automaticamente todos os impostos de importação (II, IPI, PIS/COFINS, ICMS) baseado no NCM, valor da mercadoria e país de origem. Você vê o custo total antes de fechar."
  },
  {
    category: "Fulfillment",
    question: "Em quais países vocês têm hubs de fulfillment?",
    answer: "Temos hubs próprios e parceiros em 7 países: Brasil, Alemanha, Romênia, Turquia, EUA, México e Chile. Podemos armazenar seu estoque próximo aos seus clientes."
  },
  {
    category: "Fulfillment",
    question: "Qual o tempo médio para processamento de pedidos?",
    answer: "Processamos pedidos em até 24 horas úteis. Para e-commerces com alto volume, oferecemos processamento no mesmo dia para pedidos até às 14h."
  },
];

const categories = ["Todos", "Geral", "Fretes", "Importação", "E-commerce", "Fulfillment"];

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredFaqs = activeCategory === "Todos" 
    ? faqs 
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <>
      <StructuredData type="FAQ" faqItems={faqs.map(f => ({ question: f.question, answer: f.answer }))} />
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-6">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Tire suas dúvidas sobre nossos serviços e plataforma
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                activeCategory === category
                  ? "bg-red-600 text-white shadow-lg shadow-red-200"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <PremiumCard className="overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full p-6 lg:p-8 text-left flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2 block">
                      {faq.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 pr-8">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 lg:px-8 pb-6 lg:pb-8"
                  >
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </PremiumCard>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 font-medium mb-4">
            Ainda tem dúvidas?
          </p>
          <a
            href="mailto:contato@tradexa.com.br"
            className="inline-flex items-center gap-2 text-red-600 font-bold hover:underline"
          >
            Fale com nosso time
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </motion.div>
      </div>
    </section>
    </>
  );
}