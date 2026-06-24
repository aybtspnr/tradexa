"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BarChart3, DollarSign, Activity } from "lucide-react";
import { PageTransition } from "@/components/premium";

const AdminDashboard = () => {
  const stats = [
    { label: "Usuários Ativos", value: "1,234", icon: Users, color: "from-blue-500 to-cyan-600" },
    { label: "Receita Mensal", value: "R$ 45.6K", icon: DollarSign, color: "from-green-500 to-emerald-600" },
    { label: "Consultas NCM", value: "8,921", icon: BarChart3, color: "from-red-500 to-rose-600" },
    { label: "Taxa de Conversão", value: "3.2%", icon: Activity, color: "from-purple-500 to-violet-600" },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <PageTransition>
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-md rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default AdminDashboard;