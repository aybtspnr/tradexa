"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, FileText, Search, TrendingUp, BarChart3 } from "lucide-react";
import { PageTransition } from "@/components/premium";
import { motion } from "framer-motion";

const History = () => {
  const [history] = useState([
    { id: 1, action: "Consulta NCM", description: "Código 8517.12.00", date: "2024-01-15", status: "completed" },
    { id: 2, action: "Cálculo de Impostos", description: "USD 50,000.00", date: "2024-01-14", status: "completed" },
    { id: 3, action: "Consulta NCM", description: "Código 8471.30.12", date: "2024-01-13", status: "completed" },
  ]);

  return (
    <DashboardLayout title="Histórico">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8 lg:p-12"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                <Clock className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Histórico de Atividades</h2>
                <p className="text-slate-400 font-medium mt-2">Acompanhe todas as suas consultas e cálculos</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {history.map((item, i) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{item.action}</p>
                          <p className="text-sm text-slate-500 font-medium">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-700 border-none mb-2">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Concluído
                        </Badge>
                        <p className="text-xs text-slate-400 font-bold">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default History;