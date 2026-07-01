import React, { useState, useCallback } from 'react';
import {
  Calculator, Loader2, AlertCircle, Info, TrendingUp, TrendingDown,
  DollarSign, Package, Globe, Weight, ArrowRightLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  calculateLandingCost, formatUSD, formatPct, getConfidenceVariant,
  LandingCostResult,
} from '@/services/landingCost';

const POPULAR_NCMS = [
  '300490', '847130', '392690', '870323', '610910',
  '847170', '854231', '620462', '640399', '271012',
];

const NCM_LABELS: Record<string, string> = {
  '300490': 'Medicamentos',
  '847130': 'Notebooks/Tablets',
  '392690': 'Artigos plásticos',
  '870323': 'Automóveis (1500-3000cc)',
  '610910': 'Camisetas algodão',
  '847170': 'HDs/SSDs',
  '854231': 'Processadores',
  '620462': 'Calças jeans',
  '640399': 'Calçados',
  '271012': 'Gasolina',
};

const POPULAR_COUNTRIES = [
  { code: 'ARG', name: 'Argentina' },
  { code: 'USA', name: 'Estados Unidos' },
  { code: 'CHN', name: 'China' },
  { code: 'DEU', name: 'Alemanha' },
  { code: 'CHL', name: 'Chile' },
  { code: 'MEX', name: 'México' },
  { code: 'GBR', name: 'Reino Unido' },
  { code: 'ESP', name: 'Espanha' },
  { code: 'JPN', name: 'Japão' },
  { code: 'IND', name: 'Índia' },
];

function BreakdownBar({ label, value, pct, color }: {
  label: string;
  value: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-28 text-sm text-muted-foreground shrink-0">{label}</div>
      <div className="flex-1">
        <div className="h-6 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, background: color }}
          />
        </div>
      </div>
      <div className="w-28 text-right text-sm font-medium">{formatUSD(value)}</div>
      <div className="w-16 text-right text-xs text-muted-foreground">
        {pct > 0 ? `${pct.toFixed(1)}%` : '-'}
      </div>
    </div>
  );
}

export default function LandingCostTab() {
  const [ncm, setNcm] = useState('300490');
  const [pais, setPais] = useState('ARG');
  const [vlFob, setVlFob] = useState('100000');
  const [pesoKg, setPesoKg] = useState('500');
  const [direction, setDirection] = useState<'export' | 'import'>('export');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LandingCostResult | null>(null);

  const handleCalculate = useCallback(async () => {
    if (!ncm || !pais || !vlFob) {
      setError('Preencha NCM, País e Valor FOB');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await calculateLandingCost({
        ncm,
        pais_destino: pais,
        vl_fob: parseFloat(vlFob),
        peso_kg: pesoKg ? parseFloat(pesoKg) : undefined,
        direction,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular');
    } finally {
      setLoading(false);
    }
  }, [ncm, pais, vlFob, pesoKg, direction]);

  const bd = result?.breakdown;
  const pct = result?.breakdown_pct;
  const maxVal = bd ? Math.max(bd.fob, bd.freight, bd.insurance, bd.tariff, bd.vat) : 1;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Calculator className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calculadora de Custo Total</h2>
          <p className="text-sm text-muted-foreground">
            Estime o custo total (landing cost) para exportar ou importar
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="w-4 h-4" />
            Parâmetros da Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* NCM */}
            <div className="space-y-2">
              <label className="text-sm font-medium">NCM (8 dígitos)</label>
              <Input
                value={ncm}
                onChange={(e) => setNcm(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="300490"
                maxLength={8}
              />
              <div className="flex flex-wrap gap-1">
                {POPULAR_NCMS.slice(0, 5).map((code) => (
                  <button
                    key={code}
                    onClick={() => setNcm(code)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      ncm === code
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'hover:bg-slate-100 border-slate-200 text-muted-foreground'
                    }`}
                  >
                    {code} {NCM_LABELS[code] ? `· ${NCM_LABELS[code].slice(0, 12)}` : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* País */}
            <div className="space-y-2">
              <label className="text-sm font-medium">País Destino (código ISO3)</label>
              <Input
                value={pais}
                onChange={(e) => setPais(e.target.value.toUpperCase().slice(0, 3))}
                placeholder="ARG"
                maxLength={3}
              />
              <div className="flex flex-wrap gap-1">
                {POPULAR_COUNTRIES.slice(0, 6).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setPais(c.code)}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      pais === c.code
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'hover:bg-slate-100 border-slate-200 text-muted-foreground'
                    }`}
                  >
                    {c.code} · {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Direção</label>
              <div className="flex gap-2">
                <Button
                  variant={direction === 'export' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDirection('export')}
                  className="flex-1"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Exportar
                </Button>
                <Button
                  variant={direction === 'import' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDirection('import')}
                  className="flex-1"
                >
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Importar
                </Button>
              </div>
            </div>

            {/* FOB */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor FOB (USD)</label>
              <Input
                value={vlFob}
                onChange={(e) => setVlFob(e.target.value.replace(/\D/g, ''))}
                placeholder="100000"
              />
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg) — opcional</label>
              <Input
                value={pesoKg}
                onChange={(e) => setPesoKg(e.target.value.replace(/\D/g, ''))}
                placeholder="500"
              />
              <p className="text-xs text-muted-foreground">
                Se omitido, estimado pela média de preço/kg do NCM
              </p>
            </div>

            {/* Calculate button */}
            <div className="flex items-end">
              <Button
                onClick={handleCalculate}
                disabled={loading || !ncm || !pais || !vlFob}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calcular Custo Total
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-2 pt-6">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && bd && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs text-muted-foreground">FOB</div>
                <div className="text-xl font-bold">{formatUSD(bd.fob)}</div>
              </CardContent>
            </Card>
            <Card className="border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-blue-600">
                    {result.inputs.direction === 'export' || result.freight.total_ops_reference === 0
                      ? 'Frete estimado'
                      : 'Frete médio real'}
                  </div>
                  {(result.inputs.direction === 'export' || result.freight.total_ops_reference === 0) && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-amber-300 text-amber-600">
                      Estimativa
                    </Badge>
                  )}
                </div>
                <div className="text-xl font-bold text-blue-700">{formatUSD(bd.freight)}</div>
                {result.freight.total_ops_reference > 0 && (
                  <div className="text-xs text-blue-500">
                    {result.freight.total_ops_reference} ops · conf. {result.freight.confidence}
                  </div>
                )}
                {result.freight.total_ops_reference === 0 && (
                  <div className="text-xs text-amber-500">
                    Frete não disponível para este NCM+país
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-amber-200">
              <CardContent className="pt-4">
                <div className="text-xs text-amber-600">Tarifa II</div>
                <div className="text-xl font-bold text-amber-700">{formatUSD(bd.tariff)}</div>
                <div className="text-xs text-amber-500">
                  {formatPct(result.tariff_destination.rate_pct)}
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-200">
              <CardContent className="pt-4">
                <div className="text-xs text-emerald-600">Custo Total</div>
                <div className="text-xl font-bold text-emerald-700">{formatUSD(bd.total_landing_cost)}</div>
                <div className="text-xs text-emerald-500">
                  {pct ? `${(bd.total_landing_cost / bd.fob * 100 - 100).toFixed(1)}% sobre FOB` : ''}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart className="w-4 h-4" />
                Breakdown de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <BreakdownBar
                  label="FOB"
                  value={bd.fob}
                  pct={bd.fob / maxVal * 100}
                  color="#3b82f6"
                />
                <BreakdownBar
                  label="Frete"
                  value={bd.freight}
                  pct={bd.freight / maxVal * 100}
                  color="#06b6d4"
                />
                <BreakdownBar
                  label="Seguro"
                  value={bd.insurance}
                  pct={bd.insurance / maxVal * 100}
                  color="#8b5cf6"
                />
                <BreakdownBar
                  label="II (Tarifa)"
                  value={bd.tariff}
                  pct={bd.tariff / maxVal * 100}
                  color="#f59e0b"
                />
                <BreakdownBar
                  label="VAT (Imposto)"
                  value={bd.vat}
                  pct={bd.vat / maxVal * 100}
                  color="#ef4444"
                />
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <BreakdownBar
                    label="TOTAL"
                    value={bd.total_landing_cost}
                    pct={100}
                    color="#22c55e"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Freight info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4" />
                  Dados do Frete
                  {(result.inputs.direction === 'export' || result.freight.total_ops_reference === 0) && (
                    <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600">
                      Estimativa
                    </Badge>
                  )}
                  {result.freight.total_ops_reference > 0 && result.inputs.direction === 'export' && (
                    <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-600">
                      Proxy (import)
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fonte</span>
                  <span className="font-medium">COMEXSTAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operações de referência</span>
                  <span className="font-medium">{result.freight.total_ops_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confiança</span>
                  <Badge variant={getConfidenceVariant(result.freight.confidence)}>
                    {result.freight.confidence === 'high' ? 'Alta' : result.freight.confidence === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ano referência</span>
                  <span className="font-medium">{result.freight.year_reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">USD/kg</span>
                  <span className="font-medium">{result.freight.avg_frete_usd_per_kg.toFixed(4)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{result.freight.data_source_note}</p>
                {result.inputs.direction === 'export' && result.freight.total_ops_reference > 0 && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    ⚠️ Frete baseado em importações do país (rota reversa). Use como referência.
                  </p>
                )}
                {result.freight.total_ops_reference === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Sem dados de frete para este NCM + país. Valor estimado em 0.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tariff info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Tarifa no Destino
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fonte</span>
                  <span className="font-medium">{result.tariff_destination.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Alíquota</span>
                  <span className="font-bold text-lg">
                    {formatPct(result.tariff_destination.rate_pct)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ano referência</span>
                  <span className="font-medium">{result.tariff_destination.year || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">País</span>
                  <span className="font-medium">{result.inputs.pais_destino}</span>
                </div>
              </CardContent>
            </Card>

            {/* VAT & Exchange Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  Impostos Locais
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VAT padrão</span>
                  <span className="font-bold text-lg">
                    {formatPct(result.vat_destination.rate_pct)}
                  </span>
                </div>
                {result.vat_destination.reduced_rate !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT reduzido</span>
                    <span className="font-medium">{formatPct(result.vat_destination.reduced_rate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Câmbio (USD/BRL)</span>
                  <span className="font-medium">{result.exchange_rate.usd_brl.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fonte câmbio</span>
                  <span className="font-medium">{result.exchange_rate.source}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <ul className="text-xs text-muted-foreground space-y-1">
                  {result.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Calculator className="w-12 h-12 text-slate-300 mb-4" />
            <p className="text-muted-foreground text-center">
              Preencha os parâmetros e clique em "Calcular Custo Total"
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Dados reais de frete (COMEXSTAT) + tarifas (WITS 160 países) + VAT
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
