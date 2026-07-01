// src/components/HubAlertas.tsx
// Painel completo de Alertas de Comércio Exterior
// Exibe alertas reais gerados pela Edge Function + gerenciamento de regras

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Globe,
  Package,
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  CheckCheck,
  X,
  RefreshCw,
  AlertTriangle,
  Activity,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { showError } from "@/utils/toast";
import {
  useTradeAlerts,
  type AlertRule,
  type TradeAlert,
  type AlertFormData,
  type AlertRuleType,
  type DirectionType,
  ALERT_TYPE_LABELS,
  DIRECTION_LABELS,
  DEFAULT_FORM,
} from "@/hooks/useTradeAlerts";

/* ═══════════════════ UTILITIES ═══════════════════ */

function fmt$(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

const ALERT_TYPE_ICONS: Record<string, any> = {
  price_variation: TrendingUp,
  volume_spike: Package,
  new_country: Globe,
  country_growth: Activity,
  new_player: Zap,
  custom: AlertTriangle,
};

const ALERT_TYPE_COLORS: Record<string, string> = {
  price_variation: "text-emerald-600 bg-emerald-50 border-emerald-200",
  volume_spike: "text-blue-600 bg-blue-50 border-blue-200",
  new_country: "text-purple-600 bg-purple-50 border-purple-200",
  country_growth: "text-amber-600 bg-amber-50 border-amber-200",
  new_player: "text-cyan-600 bg-cyan-50 border-cyan-200",
  custom: "text-rose-600 bg-rose-50 border-rose-200",
};

/* ═══════════════════ ALERT CARD ═══════════════════ */

function AlertCard({
  alert,
  onMarkRead,
  onDismiss,
}: {
  alert: TradeAlert;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const type = alert.type as AlertRuleType;
  const Icon = ALERT_TYPE_ICONS[type] || Bell;
  const colorClass = ALERT_TYPE_COLORS[type] || "text-slate-600 bg-slate-50 border-slate-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative px-4 py-3 rounded-xl border transition-all",
        alert.read
          ? "bg-white border-slate-200 opacity-70"
          : "bg-gradient-to-r from-red-50/50 to-amber-50/30 border-red-200/50 shadow-sm",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={cn("text-sm font-bold", alert.read ? "text-slate-600" : "text-slate-800")}>
                {alert.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{alert.description}</p>
            </div>
            {!alert.read && (
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-2" />
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {alert.ncm && (
              <Badge variant="outline" className="text-[9px] font-mono bg-slate-50">
                <Hash className="w-2.5 h-2.5 mr-0.5" />{alert.ncm}
              </Badge>
            )}
            {alert.country_code && (
              <Badge variant="outline" className="text-[9px] bg-slate-50">
                <Globe className="w-2.5 h-2.5 mr-0.5" />{alert.country_code}
              </Badge>
            )}
            {alert.direction && (
              <Badge variant="outline" className="text-[9px] bg-slate-50">
                {alert.direction === "import" ? "Importação" : "Exportação"}
              </Badge>
            )}
            {alert.variation_pct !== 0 && (
              <Badge
                className={cn(
                  "text-[9px] font-bold",
                  alert.variation_pct > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700",
                )}
              >
                {alert.variation_pct > 0 ? "+" : ""}
                {alert.variation_pct.toFixed(1)}%
              </Badge>
            )}
            <span className="text-[10px] text-slate-400 ml-auto">
              {relativeTime(alert.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!alert.read && (
            <button
              onClick={() => onMarkRead(alert.id)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Marcar como lido"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            title="Descartar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════ RULE CARD ═══════════════════ */

function RuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: AlertRule;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const type = rule.type as AlertRuleType;
  const Icon = ALERT_TYPE_ICONS[type] || Bell;
  const colorClass = ALERT_TYPE_COLORS[type] || "text-slate-600 bg-slate-50 border-slate-200";

  return (
    <Card className={cn("border transition-all", rule.enabled ? "border-slate-200" : "border-slate-200/50 opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-800 truncate">{rule.name}</h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <Badge variant="outline" className="text-[9px] bg-slate-50">
                  {ALERT_TYPE_LABELS[type] || rule.type}
                </Badge>
                <Badge variant="outline" className="text-[9px] bg-slate-50">
                  {DIRECTION_LABELS[rule.direction]}
                </Badge>
                {rule.ncm && (
                  <Badge variant="outline" className="text-[9px] font-mono bg-slate-50">
                    <Hash className="w-2.5 h-2.5 mr-0.5" />{rule.ncm}
                  </Badge>
                )}
                {rule.country_code && (
                  <Badge variant="outline" className="text-[9px] bg-slate-50">
                    {rule.country_code}
                  </Badge>
                )}
                <span className="text-[10px] text-slate-400">
                  ≥{rule.threshold_pct}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={rule.enabled}
              onCheckedChange={(v) => onToggle(rule.id, v)}
            />
            <button
              onClick={() => onDelete(rule.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {rule.last_checked_at && (
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Última verificação: {relativeTime(rule.last_checked_at)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ═══════════════════ NEW RULE FORM ═══════════════════ */

function NewRuleForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: AlertFormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<AlertFormData>({ ...DEFAULT_FORM });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showError("Dê um nome para a regra");
      return;
    }
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
  };

  const update = (field: keyof AlertFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-red-200/50 bg-gradient-to-r from-red-50/30 to-amber-50/30">
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Plus className="w-4 h-4 text-red-500" />
              Nova Regra de Alerta
            </h3>
            <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-white/60">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Nome da Regra</label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex: Monitorar preço da soja"
                className="h-9 rounded-xl border-slate-200 text-sm"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm bg-white"
              >
                {Object.entries(ALERT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Direction */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Direção</label>
              <select
                value={form.direction}
                onChange={(e) => update("direction", e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 px-3 text-sm bg-white"
              >
                {Object.entries(DIRECTION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* NCM */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">NCM (opcional)</label>
              <Input
                value={form.ncm}
                onChange={(e) => update("ncm", e.target.value)}
                placeholder="Ex: 12019000"
                className="h-9 rounded-xl border-slate-200 text-sm font-mono"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">País (opcional)</label>
              <Input
                value={form.country_code}
                onChange={(e) => update("country_code", e.target.value)}
                placeholder="Ex: China, EUA, Argentina"
                className="h-9 rounded-xl border-slate-200 text-sm"
              />
            </div>

            {/* Threshold */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                Variação Mínima: {form.threshold_pct}%
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={form.threshold_pct}
                onChange={(e) => update("threshold_pct", Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-red-500"
              />
              <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                <span>5%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold px-5"
            >
              {submitting ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Plus className="w-3 h-3 mr-1" />
              )}
              Criar Regra
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-9 rounded-xl text-xs"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════ RULES TAB ═══════════════════ */

function RulesTab({
  rules,
  onToggle,
  onDelete,
}: {
  rules: AlertRule[];
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  if (rules.length === 0) {
    return (
      <div className="text-center py-10">
        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">Nenhuma regra configurada</p>
        <p className="text-xs text-slate-400 mt-1">
          Crie regras para monitorar preços, volumes e novos parceiros comerciais
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <RuleCard key={rule.id} rule={rule} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}

/* ═══════════════════ ALERTS TAB ═══════════════════ */

function AlertsTab({
  alerts,
  onMarkRead,
  onDismiss,
  onMarkAllRead,
  onCheck,
  checking,
  hasRules,
}: {
  alerts: TradeAlert[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onCheck: () => void;
  checking: boolean;
  hasRules: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Actions bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {alerts.length} alerta{alerts.length !== 1 ? "s" : ""}
          {!hasRules && " (crie regras para gerar alertas)"}
        </p>
        <div className="flex gap-2">
          {alerts.filter((a) => !a.read).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="h-7 text-[10px] font-bold text-slate-500 hover:text-slate-700"
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Marcar todos lidos
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onCheck}
            disabled={checking}
            className="h-7 text-[10px] font-bold"
          >
            {checking ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-3 h-3 mr-1" />
            )}
            Verificar Agora
          </Button>
        </div>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div className="text-center py-10">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Nenhum alerta no momento</p>
          <p className="text-xs text-slate-400 mt-1">
            {hasRules
              ? "Clique em \"Verificar Agora\" para buscar novos alertas"
              : "Crie regras de monitoramento na aba \"Minhas Regras\""}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */

export default function HubAlertas() {
  const {
    rules,
    alerts,
    loading,
    createRule,
    deleteRule,
    updateRule,
    markRead,
    markAllRead,
    dismissAlert,
    checkAlerts,
  } = useTradeAlerts();

  const [showForm, setShowForm] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await checkAlerts();
    setChecking(false);
  };

  const handleCreateRule = async (data: AlertFormData) => {
    const ok = await createRule(data);
    if (ok) setShowForm(false);
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    await updateRule(ruleId, { enabled } as Partial<AlertRule>);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            Alertas Inteligentes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitore variações de preço, volume e novos parceiros comerciais
          </p>
        </div>

        {/* Unread badge */}
        {alerts.filter((a) => !a.read).length > 0 && (
          <Badge className="bg-red-500 text-white text-[10px] px-2.5">
            {alerts.filter((a) => !a.read).length} novo{alerts.filter((a) => !a.read).length !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Tabs: Alertas / Regras */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="bg-slate-100 rounded-xl p-0.5">
          <TabsTrigger
            value="alerts"
            className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5"
          >
            Alertas
            {alerts.filter((a) => !a.read).length > 0 && (
              <Badge className="ml-1.5 bg-red-500 text-white text-[8px] px-1 min-w-[16px] h-4">
                {alerts.filter((a) => !a.read).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="rules"
            className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-1.5"
          >
            Minhas Regras
            {rules.length > 0 && (
              <span className="ml-1.5 text-[10px] text-slate-400">({rules.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-4">
          <AlertsTab
            alerts={alerts}
            onMarkRead={markRead}
            onDismiss={dismissAlert}
            onMarkAllRead={markAllRead}
            onCheck={handleCheck}
            checking={checking}
            hasRules={rules.length > 0}
          />
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <div className="space-y-4">
            {/* New rule button */}
            {!showForm && (
              <Button
                onClick={() => setShowForm(true)}
                className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Nova Regra
              </Button>
            )}

            {/* New rule form */}
            {showForm && (
              <NewRuleForm
                onSubmit={handleCreateRule}
                onCancel={() => setShowForm(false)}
              />
            )}

            {/* Rules list */}
            <RulesTab
              rules={rules}
              onToggle={handleToggleRule}
              onDelete={deleteRule}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Info panel */}
      <Card className="border-slate-200 bg-slate-50/50">
        <CardContent className="p-4">
          <h4 className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Como funciona
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-500">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">1.</span>
              <span><strong>Crie regras</strong> na aba "Minhas Regras" definindo NCM, países e thresholds</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">2.</span>
              <span><strong>Verifique</strong> clicando em "Verificar Agora" — o sistema consulta dados reais de comércio exterior</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">3.</span>
              <span><strong>Receba alertas</strong> quando preços variarem, novos países aparecerem ou volumes dispararem</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">4.</span>
              <span>Alertas ficam salvos na sua conta — marque como lido ou descarte quando não precisar mais</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Hash name to access via navigation or hash
const Hash = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);
