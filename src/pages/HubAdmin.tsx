"use client";
import { useState } from "react";
import { useSeo } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Activity } from "lucide-react";

export default function HubAdmin() {
  useSeo({ title: "Admin — TradeXA" });
  const { profile, loading } = useAuth();
  const isAdmin = profile?.is_admin || false;

  if (loading) return null;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold">⚙️ Administração</h2>
      {isAdmin ? (
        <div className="grid gap-3">
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#D80E16]" />
            <div><div className="font-medium">Gestão de NCMs</div><div className="text-xs text-slate-500">Importar, editar e gerenciar códigos NCM</div></div>
          </CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3">
            <Activity className="w-5 h-5 text-amber-500" />
            <div><div className="font-medium">Logs do Sistema</div><div className="text-xs text-slate-500">Visualizar atividades recentes da plataforma</div></div>
          </CardContent></Card>
        </div>
      ) : (
        <Card><CardContent className="p-6 text-center text-slate-500">
          Acesso restrito a administradores.
        </CardContent></Card>
      )}
    </div>
  );
}
