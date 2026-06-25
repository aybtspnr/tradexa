"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { Footer } from "./Index/components/Footer";
import { ArrowLeft, CheckCircle2, Scale, Shield, FileText } from "lucide-react";
import { PremiumCard, PageTransition } from "@/components/premium";
import { useSeo } from "@/hooks/use-seo";

const Terms = () => {
  useSeo({
    title: "Termos de Uso — TRADEXA",
    description: "Termos de uso da plataforma TRADEXA. Leia as condições gerais para utilização dos serviços de inteligência comercial e logística internacional.",
    keywords: "termos de uso tradexa, condições serviço, comércio exterior, plataforma importação",
    noIndex: false,
  });
  const navigate = useNavigate();

  const sections = [
    {
      icon: Scale,
      title: "1. Aceitação dos Termos",
      content: "Ao acessar e utilizar a plataforma TRADEXA, você concorda em cumprir estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços."
    },
    {
      icon: Shield,
      title: "2. Uso da Plataforma",
      content: "A TRADEXA é uma plataforma de gestão logística que conecta clientes a parceiros operacionais. Você se compromete a usar a plataforma apenas para fins legítimos e de acordo com todas as leis aplicáveis."
    },
    {
      icon: FileText,
      title: "3. Responsabilidades",
      content: "A TRADEXA atua como intermediária nas operações logísticas. Não nos responsabilizamos por atrasos, danos ou perdas ocorridos durante o transporte, que são de responsabilidade dos parceiros operacionais."
    },
    {
      icon: Scale,
      title: "4. Pagamentos",
      content: "Todos os pagamentos processados através da plataforma estão sujeitos às nossas políticas de pagamento. Valores e taxas serão claramente apresentados antes da confirmação de qualquer operação."
    },
    {
      icon: Shield,
      title: "5. Privacidade e Dados",
      content: "Seus dados são protegidos de acordo com nossa Política de Privacidade. Ao usar a plataforma, você concorda com a coleta e uso de informações conforme descrito em nossa política."
    },
    {
      icon: FileText,
      title: "6. Propriedade Intelectual",
      content: "Todo o conteúdo, marcas registradas, logos e materiais da TRADEXA são de propriedade exclusiva da empresa e protegidos por leis de propriedade intelectual."
    },
    {
      icon: Scale,
      title: "7. Modificações",
      content: "Reservamos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas com antecedência através da plataforma ou email."
    },
    {
      icon: Shield,
      title: "8. Rescisão",
      content: "Podemos suspender ou encerrar sua conta a qualquer momento, com ou sem aviso prévio, por violação destes termos ou por qualquer outro motivo legítimo."
    },
    {
      icon: FileText,
      title: "9. Lei Aplicável",
      content: "Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de Florianópolis/SC."
    },
    {
      icon: Scale,
      title: "10. Contato",
      content: "Para dúvidas sobre estes termos, entre em contato através do email juridico@tradexa.com.br ou pelo telefone +55 48 98802-8025."
    }
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
      <section className="pt-40 pb-16 px-6 bg-gradient-to-br from-slate-50 via-white to-red-50/30">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <Badge className="bg-red-100 text-red-700 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              Termos de Uso
            </Badge>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900">
              Termos e Condições
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Última atualização: Janeiro de 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <PremiumCard className="overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                        <section.icon className="w-6 h-6 text-red-600" />
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

          {/* Acceptance Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 bg-gradient-to-br from-red-600 to-rose-700 rounded-[2rem] text-white text-center"
          >
            <CheckCircle2 className="w-12 h-12 mx-auto mb-6" />
            <h2 className="text-2xl font-black mb-4">Ao utilizar a TRADEXA</h2>
            <p className="text-red-100 font-medium mb-8">
              Você declara que leu, compreendeu e concorda com todos os termos descritos acima.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/register")}
                className="bg-white text-red-600 hover:bg-slate-100 rounded-xl h-12 px-8 font-bold"
              >
                Aceitar e Continuar
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/privacidade")}
                className="bg-red-700 text-white hover:bg-red-800 border-2 border-white/30 rounded-xl h-12 px-8 font-bold"
              >
                Ver Política de Privacidade
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;