"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { showError, showSuccess } from "@/utils/toast";
import { Building2, Globe, UserPlus, ArrowRight, Mail, Lock, ShieldCheck, Truck, Package } from "lucide-react";
import Logo from "@/components/Logo";

const Register = () => {
  const [role, setRole] = useState<"client" | "client_national" | "partner">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [partnerType, setPartnerType] = useState("");
  const [coverage, setCoverage] = useState("");
  const [selectedModals, setSelectedModals] = useState<string[]>([]);
  const [regions, setRegions] = useState("");

  const navigate = useNavigate();

  const modalsList = ["Aéreo", "Marítimo", "Rodoviário", "Cross Border", "Multimodal"];

  const handleModalToggle = (modal: string) => {
    setSelectedModals(prev => 
      prev.includes(modal) ? prev.filter(m => m !== modal) : [...prev, modal]
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!email || !password || !companyName) {
        throw new Error("Preencha todos os campos obrigatórios.");
      }

      // Prepare metadata - ensure all fields are properly typed as strings or valid JSON
      const metadata: Record<string, any> = {
        role: role,
        company_name: companyName,
        cnpj: cnpj || '',
      };

      // Only add partner-specific fields if role is partner
      if (role === 'partner') {
        if (!partnerType) {
          throw new Error("Selecione o tipo de parceiro.");
        }
        metadata.partner_type = partnerType;
        metadata.coverage_type = coverage || '';
        metadata.modals = selectedModals || [];
        metadata.regions = regions 
          ? regions.split(",").map((r: string) => r.trim()).filter((r: string) => r !== "")
          : [];
      }

      console.log("[Register] Signing up with role:", role);
      console.log("[Register] Metadata:", JSON.stringify(metadata));

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + (role === 'client_national' ? '/national-client' : '/client')
        }
      });

      if (authError) {
        console.error("[Register] Auth error:", authError);
        console.error("[Register] Error details:", JSON.stringify(authError));
        
        // Provide more specific error messages
        let errorMsg = authError.message;
        if (authError.code === 'unexpected_failure') {
          errorMsg = "Erro no servidor. Tente novamente em alguns instantes.";
        } else if (authError.code === 'user_already_exists') {
          errorMsg = "Este e-mail já está cadastrado.";
        } else if (authError.code === 'weak_password') {
          errorMsg = "A senha deve ter pelo menos 6 caracteres.";
        }
        
        throw new Error(errorMsg);
      }

      if (data.user) {
        console.log("[Register] User created successfully:", data.user.id);
        showSuccess(
          role === 'partner' || role === 'trucker'
            ? "Cadastro enviado para aprovação!" 
            : "Cadastro realizado! Verifique seu e-mail."
        );
        
        // Wait a moment then redirect to login
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err: any) {
      console.error("[Register] Error:", err);
      showError(err.message || "Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 py-20">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo className="h-14" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Cadastre sua empresa</h2>
          <p className="text-slate-500 font-medium">Junte-se à rede logística que mais cresce no Brasil.</p>
        </div>

        <Card className="border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-10">
            <Tabs defaultValue="client" className="mb-10" onValueChange={(v) => setRole(v as any)}>
              <TabsList className="grid w-full grid-cols-3 rounded-2xl p-1 bg-slate-100 h-14">
                <TabsTrigger value="client" className="rounded-xl font-black text-xs uppercase tracking-widest">Cliente Global</TabsTrigger>
                <TabsTrigger value="client_national" className="rounded-xl font-black text-xs uppercase tracking-widest">Cliente Nacional</TabsTrigger>
                <TabsTrigger value="partner" className="rounded-xl font-black text-xs uppercase tracking-widest">Parceiro</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleRegister} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Razão Social / Nome Fantasia</Label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input id="company" placeholder="Sua Empresa LTDA" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="rounded-2xl h-14 pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">CNPJ / CPF</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                </div>
              </div>

              {role === 'partner' && (
                <div className="space-y-8 p-8 bg-red-50/30 rounded-[2rem] border border-red-100">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-red-400 ml-1">Tipo de Parceiro</Label>
                    <Select onValueChange={setPartnerType} required>
                      <SelectTrigger className="rounded-2xl bg-white h-14 border-red-100 font-bold">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Agente de Carga">Agente de Carga</SelectItem>
                        <SelectItem value="Trading">Empresa de Trading</SelectItem>
                        <SelectItem value="Transportadora">Transportadora</SelectItem>
                        <SelectItem value="Despachante Aduaneiro">Despachante Aduaneiro</SelectItem>
                        <SelectItem value="Caminhoneiro Autônomo">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4" />
                            Caminhoneiro Autônomo
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {partnerType === 'Caminhoneiro Autônomo' && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <p className="text-sm font-bold text-green-800">
                        🚛 Como caminhoneiro autônomo, você terá acesso ao <strong>Portal do Transportador</strong> para encontrar cargas e fazer propostas de frete.
                      </p>
                    </div>
                  )}

                  {partnerType !== 'Caminhoneiro Autônomo' && partnerType !== '' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-black text-[10px] uppercase tracking-widest text-red-400 ml-1">Abrangência</Label>
                          <Select onValueChange={setCoverage} required>
                            <SelectTrigger className="rounded-2xl bg-white h-14 border-red-100 font-bold">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nacional">Nacional</SelectItem>
                              <SelectItem value="Internacional">Internacional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="font-black text-[10px] uppercase tracking-widest text-red-400 ml-1">Modais de Atendimento</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {modalsList.map((modal) => (
                            <div key={modal} className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-red-50 shadow-sm">
                              <Checkbox 
                                id={modal} 
                                checked={selectedModals.includes(modal)}
                                onCheckedChange={() => handleModalToggle(modal)}
                                className="border-red-200 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                              />
                              <label htmlFor={modal} className="text-xs font-black text-slate-600 uppercase tracking-widest cursor-pointer">{modal}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="regions" className="font-black text-[10px] uppercase tracking-widest text-red-400 ml-1">Países/Regiões de Atendimento</Label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-300" />
                          <Input 
                            id="regions" 
                            placeholder="Ex: Brasil, China, EUA" 
                            className="rounded-2xl bg-white h-14 pl-12 border-red-100 font-bold"
                            value={regions}
                            onChange={(e) => setRegions(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {role === 'client_national' && (
                <div className="p-6 bg-green-50 rounded-[2rem] border border-green-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-green-600" />
                    <p className="font-black text-green-900">Cliente Nacional de Cargas</p>
                  </div>
                  <p className="text-sm text-green-700/80 font-medium">
                    Ideal para empresas que precisam transportar cargas dentro do Brasil. Publique suas cargas e receba propostas de caminhoneiros diretamente pela plataforma.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-green-800">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Publique cargas nacionais com orçamento</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-800">
                      <Truck className="w-4 h-4" />
                      <span>Receba propostas de caminhoneiros verificados</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-green-800">
                      <Globe className="w-4 h-4" />
                      <span>Acompanhe o rastreamento em tempo real</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Email Corporativo</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input id="email" type="email" placeholder="contato@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-2xl h-14 pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" title="Senha" className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Senha de Acesso</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-2xl h-14 pl-12 border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 rounded-2xl h-16 text-lg font-black shadow-2xl shadow-red-100 gap-3 group" disabled={loading}>
                  {loading ? "Processando..." : "Finalizar Cadastro Corporativo"}
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </form>
            
            <div className="mt-10 text-center">
              <p className="text-sm text-slate-400 font-bold">
                Já possui uma conta?{" "}
                <Link to="/login" className="text-red-600 font-black hover:underline underline-offset-4">Fazer Login</Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          Plataforma Segura e Criptografada
        </div>
      </div>
    </div>
  );
};

export default Register;