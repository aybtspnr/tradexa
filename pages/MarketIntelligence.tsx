"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Sparkles, Globe, DollarSign, BarChart3, FileText, CheckCircle2, ArrowRight, Loader2, MessageSquare, Send } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { PremiumCard, PremiumButton, PageTransition } from "@/components/premium";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const MarketIntelligence = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiQuery, setAiQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [hasSubscription] = useState(true);

  // Zapier Integration Search
  const handleAiSearch = async () => {
    if (!aiQuery.trim()) {
      showError("Descreva o que você deseja saber");
      return;
    }

    setAiLoading(true);
    setAiResponse(null);
    try {
      // Call the Zapier Bridge Edge Function
      const { data, error } = await supabase.functions.invoke('zapier-bridge', {
        body: { 
          message: aiQuery,
          userId: profile?.id 
        }
      });

      if (error) throw error;

      if (data && data.reply) {
        setAiResponse(data.reply);
        showSuccess("Resposta recebida!");
      } else {
        setAiResponse("Mensagem enviada com sucesso, mas o assistente não retornou uma resposta imediata.");
      }
    } catch (error: any) {
      console.error("Zapier Search error:", error);
      showError("Erro na comunicação: " + error.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Traditional NCM Search
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      showError("Digite um código para pesquisar");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ncms")
        .select("*")
        .or(`code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(50);

      if (error) throw error;

      setSearchResults(data || []);
      if (data && data.length > 0) {
        showSuccess(`${data.length} códigos encontrados!`);
      }
    } catch (error: any) {
      showError("Erro na pesquisa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Market Intelligence">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Pesquisa de Códigos</h2>
              <p className="text-slate-500 font-medium">Consulte códigos NCM, HS ou HTS com IA</p>
            </div>
            <Badge className="bg-green-100 text-green-700 border-none px-4 py-2 rounded-full font-bold">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Plano Ativo
            </Badge>
          </div>

          <Tabs defaultValue="ai" className="space-y-6">
            <TabsList className="bg-slate-100 p-1 rounded-2xl flex flex-wrap h-auto">
              <TabsTrigger value="ai" className="rounded-xl px-6 py-3 gap-2 font-bold flex-1">
                <Sparkles className="w-4 h-4" />
                Assistente Inteligente
              </TabsTrigger>
              <TabsTrigger value="traditional" className="rounded-xl px-6 py-3 gap-2 font-bold flex-1">
                <Search className="w-4 h-4" />
                Pesquisa Tradicional
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white">
                <CardContent className="p-8 lg:p-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">Assistente de Inteligência</h3>
                        <p className="text-purple-100 text-sm font-medium">Envie sua dúvida e receba a resposta do especialista</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-purple-200">Sua Pergunta</Label>
                      <Textarea
                        placeholder="Ex: Qual o NCM para smartphones de última geração e quais as alíquotas de imposto?"
                        className="rounded-xl min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                      />
                    </div>

                    <PremiumButton 
                      onClick={handleAiSearch} 
                      disabled={aiLoading || !aiQuery.trim()} 
                      size="xl" 
                      className="w-full bg-white text-purple-600 hover:bg-purple-50 gap-2"
                    >
                      {aiLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Processando resposta...</>
                      ) : (
                        <><Send className="w-5 h-5" /> Enviar para Especialista</>
                      )}
                    </PremiumButton>

                    {aiResponse && (
                      <div className="space-y-4 pt-6 border-t border-white/20">
                        <h4 className="font-black text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                          Resposta do Assistente
                        </h4>
                        <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                          <p className="text-white font-medium leading-relaxed whitespace-pre-wrap">
                            {aiResponse}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traditional">
              <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
                <CardContent className="p-8 lg:p-12">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-600/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <Search className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black">Pesquisa por Código</h3>
                        <p className="text-slate-400 text-sm font-medium">Busque por código NCM ou descrição</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Código ou Descrição</Label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          placeholder="Ex: 8517.12.00 ou Telefone celular"
                          className="rounded-xl h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        />
                      </div>
                    </div>

                    <PremiumButton 
                      onClick={handleSearch} 
                      disabled={loading || !searchTerm.trim()} 
                      size="xl" 
                      className="w-full bg-red-600 hover:bg-red-700 gap-2"
                    >
                      {loading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Pesquisando...</>
                      ) : (
                        <><Search className="w-5 h-5" /> Pesquisar Código</>
                      )}
                    </PremiumButton>

                    {searchResults.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-white/10">
                        <h4 className="font-black text-lg">Resultados</h4>
                        <div className="grid gap-3">
                          {searchResults.map((result: any, i: number) => (
                            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-red-600 text-white border-none font-black">
                                      {result.code}
                                    </Badge>
                                  </div>
                                  <p className="text-slate-200 font-medium">{result.description}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="rounded-xl shrink-0"
                                  onClick={() => navigate(`/calculator?ncm=${result.code}`)}
                                >
                                  Calcular
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default MarketIntelligence;