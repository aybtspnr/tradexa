"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";
import { 
  ArrowLeft, 
  Briefcase, 
  Mail, 
  MapPin,
  Users,
  Zap,
  Sparkles,
  Target,
  Heart
} from "lucide-react";

const TrabalheConosco = () => {
  useSeo({
    title: "Trabalhe Conosco — Faça parte da TRADEXA",
    description: "Junte-se à equipe TRADEXA em Florianópolis. Envie seu currículo e venha transformar o comércio exterior com tecnologia e dados reais.",
    keywords: "trabalhe conosco tradexa, vagas tradexa, carreira comércio exterior, trabalhar com tradexa",
    canonical: "https://www.tradexa.com.br/trabalhe-conosco",
  });

  const beneficios = [
    { icon: Zap, title: "Ambiente Dinâmico", desc: "Trabalhe com tecnologia de ponta em um ambiente que valoriza inovação e agilidade." },
    { icon: Users, title: "Equipe Incrível", desc: "Colabore com profissionais talentosos e apaixonados por comércio exterior e tecnologia." },
    { icon: MapPin, title: "Florianópolis, SC", desc: "Escritório em Florianópolis, um dos melhores polos de tecnologia do Brasil, com opção de trabalho remoto." },
    { icon: Sparkles, title: "Impacto Real", desc: "Seu trabalho ajuda empresas brasileiras a competir globalmente com inteligência de mercado." },
    { icon: Target, title: "Crescimento", desc: "Oportunidades reais de desenvolvimento profissional em uma empresa em expansão." },
    { icon: Heart, title: "Qualidade de Vida", desc: "Equilíbrio entre vida pessoal e profissional. Flexibilidade de horários e ambiente colaborativo." },
  ];

  return (
    <SiteLayout>
      <div className="sr-only">
        <h2>Trabalhe Conosco na TRADEXA</h2>
        <p>A TRADEXA está sempre em busca de talentos nas áreas de tecnologia, dados e comércio exterior. Nossa equipe é formada por engenheiros de software, cientistas de dados, especialistas em comércio internacional e profissionais de marketing digital. Trabalhamos com tecnologias modernas como React, Node.js, Python, bancos de dados geoespaciais, APIs de tracking marítimo e inteligência artificial aplicada ao comércio exterior. Oferecemos trabalho remoto, horários flexíveis e um ambiente de aprendizado constante. Envie seu currículo e venha fazer parte do time que está transformando o market intelligence no Brasil.</p>
      </div>
      {/* Hero */}
      <section className="relative pt-20 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-4 font-bold text-[11px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-0 bg-[#D80E16]/8 text-[#D80E16]">
              <Briefcase className="w-3.5 h-3.5 mr-1.5 inline" />
              Carreiras
            </Badge>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0F111A] mb-4">
              Trabalhe <span className="text-[#D80E16]">Conosco</span>
            </h1>
            <p className="text-lg text-[#5E6278] max-w-xl mx-auto">
              Faça parte da plataforma que está transformando o comércio exterior brasileiro com inteligência de mercado e tecnologia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAF9]">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
          >
            {beneficios.map((b, i) => (
              <div key={i} className="bg-white border border-black/[0.06] rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#D80E16]/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-[#D80E16]" />
                </div>
                <h3 className="text-lg font-bold text-[#0F111A] mb-2">{b.title}</h3>
                <p className="text-[#5E6278] text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[#D80E16] to-red-700 rounded-3xl p-10 text-center text-white"
          >
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-3">Envie seu currículo</h2>
            <p className="text-red-100 mb-6 max-w-md mx-auto">
              Estamos sempre em busca de talentos. Envie seu currículo e portfólio para nosso email e entraremos em contato.
            </p>
            <a 
              href="mailto:carreiras@tradexa.com.br?subject=Currículo — Trabalhe Conosco" 
              className="inline-flex items-center gap-2 bg-white text-[#D80E16] font-semibold px-8 py-3 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              carreiras@tradexa.com.br
            </a>
          </motion.div>
        </div>
      </section>

      {/* Location */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-[#5E6278]">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Florianópolis, SC — Brasil</span>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default TrabalheConosco;
