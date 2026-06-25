"use client";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { Footer } from "./Index/components/Footer";
import { 
  ArrowLeft, 
  Code, 
  Globe, 
  Zap, 
  Shield, 
  Book, 
  Terminal,
  CheckCircle2,
  Copy
} from "lucide-react";
import { PremiumCard, PremiumButton, PageTransition } from "@/components/premium";
import { useState } from "react";
import { showSuccess } from "@/utils/toast";
import { useSeo } from "@/hooks/use-seo";

const ApiDocs = () => {
  useSeo({
    title: "API — Documentação para Desenvolvedores | TRADEXA",
    description: "Documentação completa da API TRADEXA. Integre-se à plataforma de inteligência comercial para importação e exportação com cotações, rastreamento e dados de comércio exterior.",
    keywords: "api tradexa, documentação api, integração comércio exterior, api frete, api rastreamento",
  });
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    showSuccess("Copiado para a área de transferência!");
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      method: "POST",
      path: "/api/v1/quotes",
      description: "Criar nova cotação",
      auth: true,
      body: `{
  "type": "Importação",
  "modal": "Marítimo",
  "origin": "Shenzhen, China",
  "destination": "Santos, Brasil",
  "weight": 1000,
  "volume": 5.5
}`
    },
    {
      method: "GET",
      path: "/api/v1/quotes/:id",
      description: "Obter detalhes da cotação",
      auth: true,
      response: `{
  "id": "uuid",
  "status": "Pendente",
  "origin": "Shenzhen, China",
  "destination": "Santos, Brasil"
}`
    },
    {
      method: "GET",
      path: "/api/v1/shipments",
      description: "Listar todos os envios",
      auth: true,
      response: `{
  "shipments": [
    {
      "id": "uuid",
      "status": "Em Trânsito",
      "current_location": "Porto de Santos"
    }
  ]
}`
    },
    {
      method: "POST",
      path: "/api/v1/shipments/:id/updates",
      description: "Adicionar atualização de rastreamento",
      auth: true,
      body: `{
  "status": "Em Trânsito",
  "location": "Porto de Santos",
  "notes": "Documento liberado"
}`
    }
  ];

  const features = [
    {
      icon: Zap,
      title: "RESTful API",
      description: "Endpoints REST padronizados com respostas JSON consistentes"
    },
    {
      icon: Shield,
      title: "Autenticação JWT",
      description: "Segurança robusta com tokens de acesso e refresh"
    },
    {
      icon: Globe,
      title: "Webhooks",
      description: "Notificações em tempo real para eventos importantes"
    },
    {
      icon: Book,
      title: "Documentação",
      description: "Documentação completa com exemplos práticos"
    }
  ];

  const CodeBlock = ({ code, language, endpoint }: { code: string; language: string; endpoint: string }) => (
    <div className="relative group">
      <pre className="bg-slate-900 text-slate-50 p-6 rounded-xl overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 hover:bg-slate-700 text-white"
        onClick={() => copyToClipboard(code, endpoint)}
      >
        {copiedEndpoint === endpoint ? (
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

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
      <section className="pt-40 pb-20 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-8">
              <Badge className="bg-red-600 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                <Zap className="w-3 h-3 mr-2 inline" />
                API v1.0
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter">
                API de Integração
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed">
                Conecte seus sistemas diretamente à plataforma TRADEXA. 
                Automatize cotações, envios e rastreamento em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <PremiumButton 
                  onClick={() => navigate("/register")}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700"
                >
                  Obter API Key
                </PremiumButton>
                <PremiumButton 
                  variant="outline"
                  size="lg"
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  Testar no Sandbox
                </PremiumButton>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PremiumCard className="bg-slate-800 border-slate-700">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-600 text-xs font-mono ml-2">curl</span>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
                    <code>{`curl -X POST https://api.tradexa.com/v1/quotes \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "Importação",
    "modal": "Marítimo"
  }'`}</code>
                  </pre>
                </div>
              </PremiumCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-4">
              Recursos da API
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Tudo que você precisa para integrar sua operação
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PremiumCard className="h-full" hoverEffect="lift">
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600 text-sm font-medium">{feature.description}</p>
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 mb-4">
              Endpoints Principais
            </h2>
            <p className="text-slate-600 font-medium text-lg">
              Exemplos de requisições e respostas
            </p>
          </motion.div>

          <div className="space-y-8">
            {endpoints.map((endpoint, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PremiumCard className="overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={
                            endpoint.method === "GET" ? "bg-blue-100 text-blue-700 border-none" :
                            endpoint.method === "POST" ? "bg-green-100 text-green-700 border-none" :
                            "bg-slate-100 text-slate-700 border-none"
                          }>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono text-slate-900 font-bold">{endpoint.path}</code>
                        </div>
                        <p className="text-slate-600 font-medium">{endpoint.description}</p>
                      </div>
                      {endpoint.auth && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Shield className="w-3 h-3 mr-1" />
                          Autenticação Requerida
                        </Badge>
                      )}
                    </div>

                    {endpoint.body && (
                      <div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Request Body</p>
                        <CodeBlock code={endpoint.body} language="json" endpoint={`${endpoint.method}-${endpoint.path}-body`} />
                      </div>
                    )}

                    {endpoint.response && (
                      <div>
                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Response</p>
                        <CodeBlock code={endpoint.response} language="json" endpoint={`${endpoint.method}-${endpoint.path}-response`} />
                      </div>
                    )}
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <PremiumCard className="bg-gradient-to-br from-red-600 to-rose-700 text-white overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">Autenticação</h2>
                    <p className="text-red-100 text-sm">Como proteger suas requisições</p>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <p className="text-sm font-medium text-red-100 mb-3">
                      Todas as requisições devem incluir o header de autorização:
                    </p>
                    <code className="text-white font-mono text-sm">Authorization: Bearer YOUR_API_KEY</code>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
                    <p className="text-sm font-medium text-red-100 mb-3">
                      Para obter sua API Key:
                    </p>
                    <ol className="space-y-2 text-white text-sm font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Acesse o painel administrativo
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Vá para Configurações → API
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Gere uma nova chave de API
                      </li>
                    </ol>
                  </div>
                </div>

                <PremiumButton 
                  onClick={() => navigate("/register")}
                  variant="secondary"
                  size="lg"
                  className="bg-white text-red-600 hover:bg-slate-100"
                >
                  Criar Conta e Obter API Key
                </PremiumButton>
              </div>
            </PremiumCard>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApiDocs;