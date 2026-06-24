"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator as CalcIcon, DollarSign, Percent, ArrowRight, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { PremiumButton, PageTransition } from "@/components/premium";
import { motion } from "framer-motion";

const Calculator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cargoValue: "",
    iiRate: "",
    ipiRate: "",
    pisRate: "",
    cofinsRate: "",
    icmsRate: "",
  });

  const calculateTotal = () => {
    const value = parseFloat(formData.cargoValue) || 0;
    const ii = (parseFloat(formData.iiRate) || 0) / 100;
    const ipi = (parseFloat(formData.ipiRate) || 0) / 100;
    const pis = (parseFloat(formData.pisRate) || 0) / 100;
    const cofins = (parseFloat(formData.cofinsRate) || 0) / 100;
    const icms = (parseFloat(formData.icmsRate) || 0) / 100;

    const iiValue = value * ii;
    const pisValue = value * pis;
    const cofinsValue = value * cofins;
    const ipiValue = (value + iiValue) * ipi;
    const icmsValue = (value + iiValue + ipiValue + pisValue + cofinsValue) / (1 - icms) * icms;

    const total = value + iiValue + ipiValue + pisValue + cofinsValue + icmsValue;

    return {
      ii: iiValue,
      ipi: ipiValue,
      pis: pisValue,
      cofins: cofinsValue,
      icms: icmsValue,
      total,
    };
  };

  const totals = calculateTotal();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess("Cálculo realizado!");
  };

  return (
    <DashboardLayout title="Calculadora de Impostos">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-12"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                <CalcIcon className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Simulador de Importação</h2>
                <p className="text-slate-400 font-medium mt-2">Calcule os impostos de importação para sua mercadoria</p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8 lg:p-12 space-y-8">
                <div className="space-y-4">
                  <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">Valor da Mercadoria (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="rounded-xl h-12 pl-12 bg-white border-slate-200 font-bold"
                      value={formData.cargoValue}
                      onChange={(e) => setFormData({...formData, cargoValue: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { key: "iiRate", label: "II (%)", icon: Percent },
                    { key: "ipiRate", label: "IPI (%)", icon: Percent },
                    { key: "pisRate", label: "PIS (%)", icon: Percent },
                    { key: "cofinsRate", label: "COFINS (%)", icon: Percent },
                    { key: "icmsRate", label: "ICMS (%)", icon: Percent },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label className="font-black text-[10px] uppercase tracking-widest text-slate-400 ml-1">{field.label}</Label>
                      <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="0"
                          className="rounded-xl h-11 pl-10 bg-white border-slate-200 font-bold"
                          value={formData[field.key as keyof typeof formData]}
                          onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <PremiumButton type="submit" size="xl" className="w-full bg-red-600 hover:bg-red-700 gap-2">
                  <CalcIcon className="w-5 h-5" />
                  Calcular Impostos
                </PremiumButton>
              </CardContent>
            </Card>
          </form>

          {formData.cargoValue && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <CardContent className="p-8 lg:p-12">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    Resultado do Cálculo
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {[
                      { label: "II", value: totals.ii, color: "text-blue-400" },
                      { label: "IPI", value: totals.ipi, color: "text-purple-400" },
                      { label: "PIS", value: totals.pis, color: "text-green-400" },
                      { label: "COFINS", value: totals.cofins, color: "text-orange-400" },
                      { label: "ICMS", value: totals.icms, color: "text-red-400" },
                    ].map((tax) => (
                      <div key={tax.label} className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{tax.label}</p>
                        <p className={`text-2xl font-black ${tax.color}`}>USD {tax.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-red-600/20 rounded-2xl border border-red-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Total com Impostos</p>
                        <p className="text-3xl font-black text-white">USD {totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-red-200 uppercase tracking-widest mb-1">Carga Tributária</p>
                        <p className="text-2xl font-black text-red-400">{((totals.total - parseFloat(formData.cargoValue || '0')) / parseFloat(formData.cargoValue || '1') * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button onClick={() => navigate("/market-intelligence")} className="flex-1 bg-white/10 hover:bg-white/20 rounded-xl h-12 font-bold gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Consultar NCM
                    </Button>
                    <Button onClick={() => navigate("/plans")} className="flex-1 bg-red-600 hover:bg-red-700 rounded-xl h-12 font-bold gap-2">
                      Ver Planos
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Calculator;