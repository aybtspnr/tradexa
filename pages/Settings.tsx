"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, Building2, Shield, Bell } from "lucide-react";
import { showSuccess } from "@/utils/toast";
import { PageTransition } from "@/components/premium";
import { motion } from "framer-motion";

const Settings = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showSuccess("Configurações salvas!");
      setLoading(false);
    }, 1000);
  };

  return (
    <DashboardLayout title="Minha Conta">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Informações da Empresa</h3>
                    <p className="text-slate-500 text-sm font-medium">Atualize seus dados cadastrais</p>
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Razão Social</Label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input defaultValue={profile?.company_name} className="rounded-xl h-12 pl-12 bg-white border-slate-200 font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">CNPJ</Label>
                      <Input defaultValue={profile?.cnpj} className="rounded-xl h-12 bg-white border-slate-200 font-bold" />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input defaultValue={profile?.email} type="email" className="rounded-xl h-12 pl-12 bg-white border-slate-200 font-bold" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Tipo de Conta</Label>
                      <Input defaultValue={profile?.role} disabled className="rounded-xl h-12 bg-slate-100 border-slate-200 font-bold" />
                    </div>
                  </div>

                  <Button type="submit" className="bg-red-600 hover:bg-red-700 rounded-xl h-12 px-8 font-bold" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Segurança</h3>
                    <p className="text-slate-500 text-sm font-medium">Altere sua senha de acesso</p>
                  </div>
                </div>

                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Senha Atual</Label>
                    <Input type="password" className="rounded-xl h-12 bg-white border-slate-200 font-bold" />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Nova Senha</Label>
                    <Input type="password" className="rounded-xl h-12 bg-white border-slate-200 font-bold" />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Confirmar Nova Senha</Label>
                    <Input type="password" className="rounded-xl h-12 bg-white border-slate-200 font-bold" />
                  </div>

                  <Button type="submit" className="bg-red-600 hover:bg-red-700 rounded-xl h-12 px-8 font-bold">
                    Alterar Senha
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Settings;