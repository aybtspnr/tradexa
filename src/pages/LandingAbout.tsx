"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { Footer } from "./Index/components/Footer";
import { useSeo } from "@/hooks/use-seo";
import { 
  Globe, 
  Target, 
  Award, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Mail,
  Phone
} from "lucide-react";
import { PremiumCard, PremiumButton, PageTransition, StaggerContainer } from "@/components/premium";

const About = () => {
  const navigate = useNavigate();

  useSeo({
    title: "Sobre a TRADEXA — Inteligência Comercial Brasileira",
    description: "Plataforma brasileira de inteligência comercial que transforma a logística global com tecnologia, transparência e eficiência operacional. Dados de 31 países, IA para NCM/HS, milhões de importadores e mapas logísticos.",
    keywords: "tradexa, sobre, comércio exterior, plataforma exportação, market intelligence Brasil, inteligência comercial",
  });

  const stats = [
    { value: "500+", label: "Empresas Atendidas", icon: Users, color: "from-red-500 to-rose-600" },
    { value: "50+", label: "Países Conectados", icon: Globe, color: "from-blue-500 to-cyan-600" },
    { value: "99.8%", label: "Entregas no Prazo", icon: Award, color: "from-green-500 to-emerald-600" },
    { value: "24/7", label: "Suporte Dedicado", icon: ShieldCheck, color: "from-amber-500 to-orange-600" }
  ];

  const values = [
    {
      icon: Target,
      title: "Missão",
      description: "Revolucionar a logística global com tecnologia, transparência e eficiência operacional.",
      color: "from-red-500 to-rose-600"
    },
    {
      icon: Zap,
      title: "Visão",
      description: "Ser a plataforma líder em gestão logística nas Américas até 2030.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: ShieldCheck,
      title: "Valores",
      description: "Integridade, inovação, excelência operacional e compromisso com resultados.",
      color: "from-green-500 to-emerald-600"
    }
  ];

  const milestones = [
    { year: "2020", title: "Fundação", description: "TRADEXA nasce com foco em simplificar operações de comércio exterior" },
    { year: "2021", title: "Expansão", description: "Primeiros 100 clientes e parceria com carriers internacionais" },
    { year: "2022", title: "Tecnologia", description: "Lançamento da plataforma com IA para otimização de rotas" },
    { year: "2023", title: "Crescimento", description: "Mais de 500 empresas atendidas e expansão para 50+ países" },
    { year: "2025", title: "Inovação", description: "Integração com DHL, FedEx e UPS para cotações automáticas" }
  ];

  const team = [
    { name: "Carlos Mendes", role: "CEO & Founder", background: "20+ anos em logística global" },
    { name: "Ana Paula Silva", role: "COO", background: "Ex-DHL, especialista em operações" },
    { name: "Roberto Chen", role: "CTO", background: "Engenharia de software e IA" }
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

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 bg-gradient-to-br from-slate-50 via-white to-red-50/30">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            <Badge className="bg-red-100 text-red-700 border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              Sobre a TRADEXA
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900">
              Transformando a logística <span className="text-red-600">global</span>
            </h1>
            <p className="text-xl text-slate-600 font-medium leading-relaxed">
              Somos uma plataforma tecnológica que conecta empresas aos melhores operadores logísticos do mundo, 
              com transparência total e eficiência operacional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl`}
                  whileHover={{ rotate: 15 }}
                >
                  <stat.icon className="w-8 h-8 text-white" />
                </motion.div>
                <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 mb-4">
              Nosso Propósito
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Guiados por princípios que definem quem somos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PremiumCard className="h-full" hoverEffect="lift">
                  <div className="p-8 space-y-6">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center`}
                      whileHover={{ scale: 1.1, rotate: 15 }}
                    >
                      <value.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-3">{value.title}</h3>
                      <p className="text-slate-600 font-medium leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 mb-4">
              Nossa Jornada
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Marcos importantes na construção da TRADEXA
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-red-600 via-red-500 to-red-600 rounded-full hidden lg:block" />

            <div className="space-y-12">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex items-center ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg hidden lg:block z-10" />
                  
                  <div className={`w-full lg:w-1/2 ${i % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16 lg:text-left'}`}>
                    <PremiumCard className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-red-100 text-red-700 border-none rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
                          {milestone.year}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">{milestone.title}</h3>
                      <p className="text-slate-600 font-medium">{milestone.description}</p>
                    </PremiumCard>
                  </div>
                  <div className="hidden lg:block lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 mb-4">
              Liderança
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Profissionais experientes dedicados ao seu sucesso
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PremiumCard className="text-center" hoverEffect="scale">
                  <div className="p-8 space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto flex items-center justify-center">
                      <Users className="w-12 h-12 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{member.name}</h3>
                      <p className="text-red-600 font-bold text-sm mb-2">{member.role}</p>
                      <p className="text-slate-600 text-sm font-medium">{member.background}</p>
                    </div>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-red-600 to-rose-700">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
              Vamos conversar?
            </h2>
            <p className="text-red-100 text-lg font-medium mb-8">
              Nossa equipe está pronta para entender suas necessidades e oferecer a melhor solução logística.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <MapPin className="w-8 h-8 text-white mx-auto mb-4" />
              <p className="text-white font-black text-sm">Endereço</p>
              <p className="text-red-100 text-xs mt-2">Florianópolis, SC, Brasil</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <Mail className="w-8 h-8 text-white mx-auto mb-4" />
              <p className="text-white font-black text-sm">Email</p>
              <p className="text-red-100 text-xs mt-2">contato@tradexa.com.br</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl">
              <Phone className="w-8 h-8 text-white mx-auto mb-4" />
              <p className="text-white font-black text-sm">Telefone</p>
              <p className="text-red-100 text-xs mt-2">+55 48 98802-8025</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <PremiumButton 
              onClick={() => navigate("/register")}
              variant="secondary"
              size="xl"
              className="bg-white text-red-600 hover:bg-slate-100"
            >
              Começar Agora
            </PremiumButton>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
