"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function HubRankings() {
  return (
    <div className="p-6">
      <Card className="border-slate-200 shadow-sm">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <Award className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Rankings</h3>
          <p className="text-sm text-slate-500 max-w-md">
            Rankings de produtos, países e empresas por volume de comércio exterior.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
