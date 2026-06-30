"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

/**
 * HubReports — placeholder tab for the Intelligence Hub.
 */
export default function HubReports() {
  return (
    <div className="p-6">
      <Card className="border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <FileText className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Relatórios</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Gere relatórios personalizados de inteligência comercial com dados atualizados do comércio exterior.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
