"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "O que é a TRADEXA e como funciona?",
    a: "A TRADEXA é uma plataforma de inteligência de mercado para comércio exterior. Organizamos dados de importações e exportações brasileiras e internacionais em dashboards interativos, rankings, mapas e alertas. Você pode pesquisar por NCM, empresa, país ou produto e obter insights em segundos.",
  },
  {
    q: "Os dados são atualizados em tempo real?",
    a: "Os dados são atualizados mensalmente. Também monitoramos mudanças tarifárias e notícias do setor e enviamos alertas quando detectamos variações significativas.",
  },
  {
    q: "A plataforma é gratuita ou paga?",
    a: "Você pode usar a TRADEXA gratuitamente com acesso a dados básicos de importação/exportação, consulta NCM/HS e mapas simplificados. Planos premium desbloqueiam análises avançadas, alertas ilimitados e acesso à API. Veja nossa página de planos para detalhes.",
  },
  {
    q: "Quais países são cobertos na análise de exportação?",
    a: "Atualmente cobrimos todos os parceiros comerciais do Brasil (mais de 250 países e territórios) com dados detalhados. Temos integração especial com dados americanos para comércio Brasil-EUA.",
  },
  {
    q: "Como os alertas funcionam?",
    a: "Você configura critérios personalizados: por exemplo, \"notifique-me quando a importação de café verde da Colômbia subir mais de 10% em um trimestre\". Monitoramos 24/7 e enviamos alertas por e-mail assim que detectamos uma variação que atenda seus critérios.",
  },
  {
    q: "Meus dados estão seguros?",
    a: "Sim. Usamos criptografia SSL/TLS em todas as conexões, autenticação via Supabase Auth com JWT, e nunca vendemos ou compartilhamos seus dados. Você pode excluir sua conta e todos os dados associados a qualquer momento.",
  },
  {
    q: "Posso usar a TRADEXA em consultorias para meus clientes?",
    a: "Sim. A licença permite uso comercial, incluindo consultorias para terceiros. Usuários empresariais e consultorias devem utilizar o plano Growth ou Business para acesso à API e recursos avançados.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-24 md:py-32 bg-slate-50">
      <div className="px-4 sm:px-6 lg:px-12 xl:px-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Tudo que você precisa saber sobre a TRADEXA
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900 text-sm md:text-base pr-4">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Schema.org JSON-LD for FAQPage */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: f.a,
            },
          })),
        })}
      </script>
    </section>
  );
}
