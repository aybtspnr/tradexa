import React, { useMemo, useState } from "react";
import { Trophy, Medal, Award, Building2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Company {
  nome?: string;
  cnae?: string;
  cnae_desc?: string;
  uf?: string;
  municipio?: string;
  nome_municipio?: string;
  capital_social?: number;
  confidence_score?: number;
  confidence_label?: string;
  score?: number;
  evidence?: string[];
  likely_flow?: string;
}

interface CompanyRankingProps {
  companies: Record<string, Company[]>;
  limit?: number;
}

export function CompanyRanking({ companies, limit = 15 }: CompanyRankingProps) {
  const [sortBy, setSortBy] = useState<"score" | "capital">("score");

  const ranked = useMemo(() => {
    const all = Object.values(companies).flat().filter((c) => c.nome && c.nome !== "N/I");
    return all
      .sort((a, b) => {
        if (sortBy === "score") {
          return (b.score || b.confidence_score || 0) - (a.score || a.confidence_score || 0);
        }
        return (b.capital_social || 0) - (a.capital_social || 0);
      })
      .slice(0, limit);
  }, [companies, sortBy, limit]);

  if (!ranked.length) return null;

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (index === 1) return <Medal className="h-4 w-4 text-slate-400" />;
    if (index === 2) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-slate-400 w-4 text-center">#{index + 1}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-700";
    if (score >= 60) return "bg-blue-100 text-blue-700";
    if (score >= 40) return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  const fmtCapital = (n: number) =>
    n >= 1e6 ? `R$ ${(n / 1e6).toFixed(1)}M` :
    n >= 1e3 ? `R$ ${(n / 1e3).toFixed(0)}K` :
    `R$ ${n.toFixed(0)}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
      <div className="p-4 md:p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-[#D80E16]" />
            Ranking de Empresas
          </h3>
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setSortBy("score")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                sortBy === "score"
                  ? "bg-[#D80E16] text-white"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Score
            </button>
            <button
              onClick={() => setSortBy("capital")}
              className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md transition-all",
                sortBy === "capital"
                  ? "bg-[#D80E16] text-white"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Capital
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
        {ranked.map((company, i) => {
          const score = company.score || company.confidence_score || 0;
          return (
            <div key={i} className="p-3 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="shrink-0">{getMedalIcon(i)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {company.nome}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      {company.nome_municipio || company.municipio}/{company.uf}
                    </span>
                    {company.cnae_desc && (
                      <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {company.cnae_desc}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {company.capital_social ? (
                    <span className="text-[10px] font-mono text-slate-500">
                      {fmtCapital(company.capital_social)}
                    </span>
                  ) : null}
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    getScoreColor(score)
                  )}>
                    {score}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
