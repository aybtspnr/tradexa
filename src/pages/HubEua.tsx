"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flag } from "lucide-react";

export default function HubEua() {
  return (
    <div className="p-6">
      <Card className="border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-red-500 to-blue-500" />
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <Flag className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Comércio EUA</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Inteligência comercial focada nos Estados Unidos: tarifas, acordos e tendências de mercado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
