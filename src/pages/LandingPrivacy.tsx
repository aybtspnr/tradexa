"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { Footer } from "./Index/components/Footer";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";
import { PremiumCard, PageTransition } from "@/components/premium";
import { useSeo } from "@/hooks/use-seo";

const Privacy = () => {
  useSeo({
    title: "Política de Privacidade — TRADEXA",
    description: "Política de privacidade da TRADEXA. Saiba como coletamos, usamos e protegemos seus dados pessoais na plataforma de inteligência comercial.",
    keywords: "privacidade tradexa, política privacidade, dados pessoais, LGPD, comércio exterior",
    noIndex: false,
  });
  const navigate = useNavigate();

  const sections = [
    {
      icon: Shield,
      title: "1. Coleta de Informações",
      content: "Coletamos informações que você fornece diretamente, como nome, email, CNPJ, e dados operacionais necessários para suas cotações e envios. Também coletamos automaticamente dados de uso da plataforma."
    },
    {
      icon: Lock,
      title: "2. Uso das Informações",
      content: "Suas informações são usadas para: processar cotações, gerenciar envios, comunicar atualizações, melhorar nossos serviços, e cumprir obrigações legais. Não vendemos seus dados para terceiros."
    },
    {
      icon: Database,
      title: "3. Compartilhamento",
      content: "Compartilhamos dados apenas com parceiros operacionais necessários para executar seus envios, e com prestadores de serviços que nos auxiliam na operação da plataforma, todos sob acordos de confidencialidade."
    },
    {
      icon: Eye,
      title: "4. Transparência",
      content: "Você tem direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento. Entre em contato com privacidade@tradexa.com.br para exercer seus direitos."
    },
    {
      icon: UserCheck,
      title: "5. Segurança",
      content: "Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição."
    },
    {
      icon: Mail,
      title: "6. Cookies",
      content: "Utilizamos cookies essenciais para o funcionamento da plataforma e cookies analíticos para entender como você usa nossos serviços. Você pode gerenciar suas preferências nas configurações."
    },
    {
      icon: Shield,
      title: "7. Retenção de Dados",
      content: "Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades descritas, ou conforme exigido por lei. Após esse período, os dados são excluídos ou anonimizados."
    },
    {
      icon: Lock,
      title: "8. LGPD",
      content: "Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018). Nosso Encarregado de Dados (DPO) pode ser contatado em dpo@tradexa.com.br."
    }
  ];

  const rights = [
    "Confirmar a existência de tratamento de dados",
    "Acessar seus dados pessoais",
    "Corrigir dados incompletos, inexatos ou desatualizados",
    "Solicitar anonimização, bloqueio ou eliminação de dados",
    "Portabilidade dos dados a outro fornecedor de serviço",
    "Eliminação dos dados tratados com consentimento",
    "Revogar o consentimento a qualquer momento"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo className="h-10" />
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="rounded-xl gap-2 font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-40 pb-16 px-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-blue-100 text-blue-700 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              Privacidade de Dados
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900">
              Política de Privacidade
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Última atualização: Janeiro de 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Main Sections */}
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-black text-slate-900 mb-4">
                Como Protegemos Seus Dados
              </h2>
              <p className="text-slate-600 font-medium">
                Transparência e segurança são nossos princípios fundamentais
              </p>
            </motion.div>

            <div className="space-y-6">
              {sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <PremiumCard className="overflow-hidden">
                    <div className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                          <section.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900 mb-4">{section.title}</h2>
                          <p className="text-slate-600 font-medium leading-relaxed">{section.content}</p>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <PremiumCard className="bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center">
                    <UserCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Seus Direitos (LGPD)</h2>
                    <p className="text-slate-600 text-sm">Conforme a Lei 13.709/2018</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {rights.map((right, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{right}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm font-medium text-slate-300 mb-2">
                    Para exercer seus direitos, entre em contato:
                  </p>
                  <p className="text-lg font-black text-white">privacidade@tradexa.com.br</p>
                </div>
              </div>
            </PremiumCard>
          </motion.div>

          {/* Contact */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Dúvidas sobre Privacidade?
            </h2>
            <p className="text-slate-600 font-medium mb-8">
              Nosso time de proteção de dados está disponível para ajudar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/termos")}
                className="bg-red-600 hover:bg-red-700 rounded-xl h-12 px-8 font-bold"
              >
                Ver Termos de Uso
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/register")}
                className="border-slate-200 rounded-xl h-12 px-8 font-bold"
              >
                Criar Conta
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Privacy;