"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function HubAdmin() {
  return (
    <div className="p-6">
      <Card className="border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-slate-600 to-slate-400" />
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <Shield className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Administração</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Painel administrativo do Intelligence Hub. Gerencie permissões, fontes de dados e configurações do sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
