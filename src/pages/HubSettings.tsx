"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

/**
 * HubSettings — placeholder tab for the Intelligence Hub.
 */
export default function HubSettings() {
  return (
    <div className="p-6">
      <Card className="border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-slate-400 to-slate-300" />
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <Settings className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Configurações</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Personalize sua experiência no Intelligence Hub, configure fontes de dados e preferências de alerta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
