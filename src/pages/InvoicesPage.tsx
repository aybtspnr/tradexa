"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useSeo } from "@/hooks/use-seo";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  CreditCard,
  CircleCheck,
  CircleAlert,
  CircleX,
  RotateCcw,
  ExternalLink,
  Loader2,
  CalendarDays,
  Banknote,
  Hash,
  Sparkles,
  FileText,
} from "lucide-react";

/* ─── Tipos ─── */
interface Payment {
  id: string;
  user_id: string;
  plan_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  mercado_pago_id: string | null;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
}

/* ─── Helpers ─── */
const formatBRL = (cents: number) => {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateShort = (dateStr: string | null | undefined) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CircleCheck }
> = {
  paid: { label: "Pago", variant: "default", icon: CircleCheck },
  approved: { label: "Aprovado", variant: "default", icon: CircleCheck },
  pending: { label: "Pendente", variant: "secondary", icon: CircleAlert },
  in_process: { label: "Em Processamento", variant: "secondary", icon: CircleAlert },
  failed: { label: "Falhou", variant: "destructive", icon: CircleX },
  rejected: { label: "Rejeitado", variant: "destructive", icon: CircleX },
  cancelled: { label: "Cancelado", variant: "destructive", icon: CircleX },
  refunded: { label: "Reembolsado", variant: "outline", icon: RotateCcw },
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || {
    label: status,
    variant: "outline" as const,
    icon: CircleAlert,
  };
};

const PLAN_LABELS: Record<string, string> = {
  essential: "Essencial",
  growth: "Growth",
  business: "Business",
  professional: "Growth",
};

/* ─── Componente ─── */
const InvoicesPage = () => {
  const { profile, loading: authLoading } = useAuth();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSeo({
    title: "Faturas — TRADEXA",
    description: "Histórico de faturas, pagamentos e assinatura da sua conta TRADEXA.",
    keywords: "faturas, pagamentos, assinatura, histórico",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    loadData();
  }, [profile?.id, authLoading]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userId = profile!.id;

      // Buscar pagamentos
      const { data: paymentsData, error: paymentsErr } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (paymentsErr) throw paymentsErr;
      setPayments(paymentsData || []);

      // Buscar assinatura ativa
      const { data: subData, error: subErr } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "past_due"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subErr && subErr.code !== "PGRST116") {
        console.warn("[Invoices] Erro ao buscar assinatura:", subErr);
      }
      setSubscription(subData || null);
    } catch (err: any) {
      console.error("[Invoices] Erro ao carregar dados:", err);
      setError(err.message || "Erro ao carregar faturamento.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Loading ─── */
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ─── Sem usuário ─── */
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-500">Faça login para ver suas faturas.</p>
      </div>
    );
  }

  /* ─── Erro ─── */
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Faturas"
          subtitle="Histórico de pagamentos da sua conta."
          variant="red"
          badges={[{ label: "Erro", icon: <CircleAlert className="w-3 h-3 mr-1" /> }]}
        />
        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardContent className="p-6 text-center">
            <CircleX className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">Não foi possível carregar os dados.</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <Button
              variant="outline"
              onClick={loadData}
              className="mt-4 rounded-xl"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSubscription = subscription;
  const hasPayments = payments.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturas"
        subtitle="Histórico de pagamentos e assinatura da sua conta."
        variant="red"
        badges={[
          {
            label: hasPayments ? `${payments.length} fatura${payments.length !== 1 ? "s" : ""}` : "Faturamento",
            icon: <Receipt className="w-3 h-3 mr-1" />,
          },
        ]}
      />

      {/* ═══════ Assinatura Ativa ═══════ */}
      {activeSubscription && (
        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 flex items-center gap-2">
                    Assinatura Ativa
                    <Badge
                      variant="default"
                      className="bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest border-none"
                    >
                      {PLAN_LABELS[activeSubscription.plan] || activeSubscription.plan}
                    </Badge>
                  </h3>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {activeSubscription.current_period_end
                      ? `Válida até ${formatDate(activeSubscription.current_period_end)}`
                      : "Assinatura ativa"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5"
                onClick={() => window.open("https://www.mercadopago.com.br/subscriptions", "_blank")}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Gerenciar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════ Lista de Faturas ═══════ */}
      {hasPayments ? (
        <div className="space-y-3">
          {payments.map((payment) => {
            const statusCfg = getStatusConfig(payment.status);
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={payment.id}
                className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Esquerda — info principal */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge
                          variant={statusCfg.variant}
                          className={`
                            text-[10px] font-black uppercase tracking-widest border-none
                            ${statusCfg.variant === "default" ? "bg-emerald-500 text-white" : ""}
                            ${statusCfg.variant === "secondary" ? "bg-amber-100 text-amber-800" : ""}
                            ${statusCfg.variant === "destructive" ? "bg-red-500 text-white" : ""}
                            ${statusCfg.variant === "outline" ? "bg-blue-100 text-blue-700 border-blue-200" : ""}
                          `}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusCfg.label}
                        </Badge>

                        <span className="text-lg font-black text-slate-900">
                          {formatBRL(payment.amount_cents)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {formatDate(payment.created_at)}
                        </span>

                        {payment.payment_method && (
                          <span className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" />
                            {payment.payment_method}
                          </span>
                        )}

                        {payment.mercado_pago_id && (
                          <span className="flex items-center gap-1.5">
                            <Hash className="w-3.5 h-3.5" />
                            ID: {payment.mercado_pago_id.slice(0, 12)}…
                          </span>
                        )}

                        {payment.paid_at && (
                          <span className="flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5" />
                            Pago em {formatDateShort(payment.paid_at)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Direita — action */}
                    {payment.mercado_pago_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl shrink-0"
                        onClick={() =>
                          window.open(
                            `https://www.mercadopago.com.br/payments/${payment.mercado_pago_id}`,
                            "_blank"
                          )
                        }
                        title="Ver no Mercado Pago"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* ═══════ Empty State ═══════ */
        <Card className="rounded-2xl overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-700 mb-1">
              Nenhuma fatura encontrada
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Você ainda não possui nenhum pagamento registrado. Ao contratar um
              plano, todas as faturas aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoicesPage;
