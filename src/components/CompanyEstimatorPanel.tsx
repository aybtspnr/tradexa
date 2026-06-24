"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, MapPin, Loader2, AlertTriangle, TrendingUp,
  ChevronDown, ChevronRight, Factory, ShieldAlert, Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { estimateCompanies, groupByMunicipio, EstimatedCompany } from "@/services/companyInference";
import { showError, showSuccess } from "@/utils/toast";

interface Registro {
  co_ano: string;
  co_mes: string;
  mes_nome: string;
  co_pais: string;
  pais_nome: string;
  sg_uf: string;
  uf_nome: string;
  co_via: string;
  via_nome: string;
  co_urf: string;
  urf_nome: string;
  co_unid: string;
  unid_nome: string;
  qt_estat: number;
  kg_liquido: number;
  vl_fob: number;
  municipios: {
    co_mun: string;
    mun_nome: string;
    kg_liquido: number;
    vl_fob: number;
  }[];
}

interface Props {
  registros: Registro[];
  ncm: string;
  descricaoNcm?: string;
  tipo: "export" | "import";
  accentColor?: "emerald" | "blue" | "amber";
}

const ACCENT = {
  emerald: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    text: "text-blue-700",
    textLight: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
    icon: "text-amber-500",
    rowHover: "hover:bg-blue-50",
    expandedBg: "bg-blue-50/50",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    textLight: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
    icon: "text-blue-500",
    rowHover: "hover:bg-blue-50",
    expandedBg: "bg-blue-50/50",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    textLight: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700",
    icon: "text-amber-500",
    rowHover: "hover:bg-amber-50",
    expandedBg: "bg-amber-50/50",
  },
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const CompanyEstimatorPanel: React.FC<Props> = ({
  registros,
  ncm,
  descricaoNcm = "",
  tipo,
  accentColor = "emerald",
}) => {
  const c = ACCENT[accentColor];
  const [expandedMun, setExpandedMun] = useState<string | null>(null);
  const [companiesByMun, setCompaniesByMun] = useState<Record<string, EstimatedCompany[]>>({});
  const [loadingMun, setLoadingMun] = useState<string | null>(null);

  const topMunicipios = useMemo(() => {
    return groupByMunicipio(registros).slice(0, 15);
  }, [registros]);

  const handleExpandMunicipio = useCallback(
    async (mun: typeof topMunicipios[0]) => {
      const key = `${mun.mun_nome}-${mun.uf}`;
      if (expandedMun === key) {
        setExpandedMun(null);
        return;
      }
      setExpandedMun(key);

      if (companiesByMun[key]) return;

      setLoadingMun(key);
      try {
        const companies = await estimateCompanies(
          mun.mun_nome,
          mun.uf,
          ncm,
          descricaoNcm,
          mun.total_fob,
          tipo
        );
        setCompaniesByMun((prev) => ({ ...prev, [key]: companies }));
        if (companies.length > 0) {
          showSuccess(`${companies.length} empresas estimadas para ${mun.mun_nome}`);
        }
      } catch (err: any) {
        showError("Erro ao estimar empresas: " + err.message);
      } finally {
        setLoadingMun(null);
      }
    },
    [expandedMun, companiesByMun, ncm, descricaoNcm, tipo]
  );

  if (!registros.length) return null;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <Card className={`border-none shadow-lg rounded-2xl ${c.bg} border ${c.border}`}>
        <CardContent className="p-4 flex items-start gap-3">
          <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${c.icon}`} />
          <div>
            <p className={`text-sm font-black ${c.text}`}>Estimativa baseada em IA — dados podem não corresponder a empresas reais</p>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              As empresas listadas são inferências baseadas em dados atualizados de comércio exterior geradas por IA.
              Não são dados reais de importação/exportação por CNPJ. Para dados reais, consulte o
              Radar Comercial Sebrae ou Siscomex.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3">
        <Card className={`border-none shadow-lg rounded-xl ${c.bg} border ${c.border}`}>
          <CardContent className="p-4">
            <p className={`text-xs font-black ${c.textLight} opacity-70 uppercase tracking-widest`}>
              Municípios analisados
            </p>
            <p className={`text-2xl font-black ${c.text} mt-1`}>{topMunicipios.length}</p>
          </CardContent>
        </Card>
        <Card className={`border-none shadow-lg rounded-xl ${c.bg} border ${c.border}`}>
          <CardContent className="p-4">
            <p className={`text-xs font-black ${c.textLight} opacity-70 uppercase tracking-widest`}>
              Empresas estimadas
            </p>
            <p className={`text-2xl font-black ${c.text} mt-1`}>
              {Object.values(companiesByMun).reduce((s, arr) => s + arr.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Municípios + Empresas */}
      <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Factory className={`w-5 h-5 ${c.icon}`} />
              Empresas Estimadas por Município
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Clique em um município para ver empresas prováveis ({tipo === "export" ? "exportadoras" : "importadoras"})
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Município</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead className="text-right">Volume FOB</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topMunicipios.map((mun) => {
                  const key = `${mun.mun_nome}-${mun.uf}`;
                  const expanded = expandedMun === key;
                  const companies = companiesByMun[key];
                  const isLoading = loadingMun === key;

                  return (
                    <React.Fragment key={key}>
                      <TableRow
                        className={`cursor-pointer ${c.rowHover} transition-colors`}
                        onClick={() => handleExpandMunicipio(mun)}
                      >
                        <TableCell>
                          {expanded ? (
                            <ChevronDown className={`w-4 h-4 ${c.icon}`} />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-600" />
                            <span className="font-bold text-sm">{mun.mun_nome}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={c.badge}>{mun.uf}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-black text-slate-700">
                          {formatCurrency(mun.total_fob)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className={`rounded-lg text-xs font-bold border ${c.border} ${c.text} hover:${c.bg}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpandMunicipio(mun);
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : companies ? (
                              "Ver empresas"
                            ) : (
                              <>
                                <Building2 className="w-3 h-3 mr-1" />
                                Estimar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      <AnimatePresence>
                        {expanded && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className={`${c.expandedBg}`}
                              >
                                <div className="p-4">
                                  {isLoading ? (
                                    <div className="flex items-center gap-2 py-4">
                                      <Loader2 className={`w-4 h-4 animate-spin ${c.icon}`} />
                                      <span className={`text-sm font-bold ${c.text}`}>
                                        Consultando IA sobre empresas em {mun.mun_nome}...
                                      </span>
                                    </div>
                                  ) : companies && companies.length > 0 ? (
                                    <div className="space-y-2">
                                      {companies.map((comp, idx) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 8 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: idx * 0.05 }}
                                          className="bg-white rounded-xl border border-slate-100 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                        >
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <Building2 className="w-4 h-4 text-slate-600" />
                                              <span className="font-black text-sm text-slate-900 truncate">
                                                {comp.nome}
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className={`text-[10px] font-black ${c.badge}`}
                                              >
                                                {comp.porte}
                                              </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                              <span className="text-[11px] text-slate-600">
                                                {comp.cidade} - {comp.uf}
                                              </span>
                                              {comp.cnae_primario && (
                                                <Badge
                                                  variant="secondary"
                                                  className="text-[10px] font-medium"
                                                >
                                                  CNAE {comp.cnae_primario}
                                                </Badge>
                                              )}
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1">
                                                      <TrendingUp className="w-3 h-3 text-slate-600" />
                                                      <span className="text-[11px] font-bold text-slate-600">
                                                        {comp.confianca}% confiança
                                                      </span>
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent className="max-w-xs">
                                                    <p className="text-xs">{comp.fonte}</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          </div>
                                          <div className="text-right shrink-0">
                                            <Badge
                                              variant="outline"
                                              className="text-[10px] font-black border-amber-200 text-amber-700 bg-amber-50"
                                            >
                                              <AlertTriangle className="w-3 h-3 mr-1" />
                                              Estimado por IA
                                            </Badge>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  ) : companies && companies.length === 0 ? (
                                    <div className="py-4 text-center">
                                      <p className="text-sm text-slate-600 font-medium">
                                        Nenhuma empresa estimada para este município.
                                      </p>
                                      <p className="text-xs text-slate-600 mt-1">
                                        Pode ser um município com baixa atividade no setor ou
                                        poucos dados disponíveis.
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="py-4 text-center">
                                      <Button
                                        size="sm"
                                        className={`${c.button} rounded-xl font-bold text-white`}
                                        onClick={() => handleExpandMunicipio(mun)}
                                        disabled={isLoading}
                                      >
                                        {isLoading ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Consultar IA
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </TableCell>
                          </TableRow>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyEstimatorPanel;
