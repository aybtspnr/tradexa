import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Globe2, PackageCheck, Truck, Warehouse, Waypoints } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { operationCountries } from "@/lib/countries";

type DemandRequestRecord = {
  id: string;
  service_key: string;
  origin_country: string | null;
  destination_country: string | null;
  selected_modules: string[] | null;
  summary: string | null;
  request_payload: {
    custom_fields?: Record<string, string>;
  } | null;
  status: string;
  created_at: string;
};

type ShipmentRecord = {
  id: string;
  status: string;
  current_location: string | null;
  quote?: {
    origin: string;
    destination: string;
  } | null;
};

const ClientFulfillmentDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DemandRequestRecord[]>([]);
  const [shipments, setShipments] = useState<ShipmentRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;

      setLoading(true);

      const [{ data: requestData }, { data: shipmentData }] = await Promise.all([
        supabase
          .from("demand_requests")
          .select("*")
          .eq("user_id", profile.id)
          .eq("service_key", "fulfillment")
          .order("created_at", { ascending: false }),
        supabase
          .from("shipments")
          .select("id, status, current_location, quote:quotes!inner(origin,destination,client_id)")
          .eq("quote.client_id", profile.id)
          .neq("status", "Entregue")
          .neq("status", "Cancelado")
          .order("updated_at", { ascending: false }),
      ]);

      setRequests((requestData as DemandRequestRecord[] | null) || []);
      setShipments(
        ((shipmentData as Array<{ id: string; status: string; current_location: string | null; quote: Array<{ origin: string; destination: string }> }> | null) || []).map(
          (shipment) => ({
            id: shipment.id,
            status: shipment.status,
            current_location: shipment.current_location,
            quote: shipment.quote?.[0] || null,
          }),
        ),
      );
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  const mappedMarkets = useMemo(() => {
    const requestMarkets = requests
      .flatMap((request) => [request.destination_country, request.request_payload?.custom_fields?.fulfillment_markets])
      .filter(Boolean)
      .flatMap((entry) => String(entry).split(",").map((item) => item.trim()).filter(Boolean));

    return Array.from(new Set(requestMarkets)).slice(0, 6);
  }, [requests]);

  const totalModules = useMemo(
    () => requests.reduce((acc, request) => acc + (request.selected_modules?.length || 0), 0),
    [requests],
  );

  const stats = [
    { label: "Projetos de fulfillment", value: requests.length, icon: Warehouse },
    { label: "Módulos combinados", value: totalModules, icon: Boxes },
    { label: "Operações em trânsito", value: shipments.length, icon: Truck },
    { label: "Mercados ativos", value: mappedMarkets.length, icon: Globe2 },
  ];

  if (loading) {
    return <DashboardLayout title="Fulfillment"><div className="py-16 text-sm font-medium text-slate-500">Carregando dashboard de fulfillment...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Fulfillment">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">Estoque e distribuição</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">Dashboard de fulfillment</h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-[hsl(var(--muted-foreground))]">
              Organize projetos de armazenagem, hubs no destino, distribuição e integração com a operação logística da conta.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => navigate("/demand?service=fulfillment")} className="rounded-full font-black shadow-[var(--shadow-brand)]">
              Novo projeto de fulfillment
            </Button>
            <Button onClick={() => navigate("/shipments")} variant="outline" className="rounded-full font-black">
              Ver envios ativos
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="surface-card rounded-[2rem] border-0">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="rounded-2xl bg-[hsl(var(--brand-soft))] p-3 text-primary">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                  <p className="mt-1 text-3xl font-black text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="surface-card rounded-[2rem] border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Projetos recentes</p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">Solicitações de armazenagem e distribuição</h3>
                </div>
                <Badge className="bg-[hsl(var(--brand-soft))] text-primary">{requests.length} projetos</Badge>
              </div>

              <div className="mt-6 space-y-4">
                {requests.length === 0 ? (
                  <div className="rounded-[1.5rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] p-6 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                    Nenhum projeto de fulfillment foi registrado ainda para esta conta.
                  </div>
                ) : (
                  requests.slice(0, 5).map((request) => (
                    <div key={request.id} className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-black text-foreground">
                            {request.request_payload?.custom_fields?.storage_goal === "distribution"
                              ? "Distribuição B2B/B2C"
                              : request.request_payload?.custom_fields?.storage_goal === "hybrid"
                                ? "Projeto híbrido"
                                : "Atendimento a e-commerce"}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                            {request.origin_country || "Origem não informada"} → {request.destination_country || "Destino não informado"}
                          </p>
                        </div>
                        <Badge variant="outline" className="w-fit rounded-full uppercase">{request.status}</Badge>
                      </div>

                      {request.request_payload?.custom_fields?.inventory_profile ? (
                        <p className="mt-3 text-sm font-medium text-foreground">
                          Estoque: {request.request_payload.custom_fields.inventory_profile}
                        </p>
                      ) : null}

                      <p className="mt-3 line-clamp-2 text-sm font-medium leading-7 text-[hsl(var(--muted-foreground))]">
                        {request.summary || "Sem resumo adicional."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="surface-card rounded-[2rem] border-0">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Mercados priorizados</p>
                <h3 className="mt-2 text-2xl font-black text-foreground">Hubs e destinos mapeados</h3>
                <div className="mt-5 grid gap-3">
                  {(mappedMarkets.length > 0 ? mappedMarkets : operationCountries.slice(0, 4).map((country) => country.name)).map((market) => (
                    <div key={market} className="flex items-center justify-between rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] px-4 py-3">
                      <span className="text-sm font-bold text-foreground">{market}</span>
                      <Waypoints className="h-4 w-4 text-primary" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card rounded-[2rem] border-0">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Execução atual</p>
                <h3 className="mt-2 text-2xl font-black text-foreground">Operações ligadas à conta</h3>
                <div className="mt-5 space-y-3">
                  {shipments.length === 0 ? (
                    <div className="rounded-[1.4rem] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] p-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      Nenhuma operação ativa no momento.
                    </div>
                  ) : (
                    shipments.slice(0, 4).map((shipment) => (
                      <div key={shipment.id} className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--surface-elevated))] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-foreground">{shipment.status}</p>
                          <PackageCheck className="h-4 w-4 text-primary" />
                        </div>
                        <p className="mt-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                          {shipment.quote?.origin?.split(",")[0]} → {shipment.quote?.destination?.split(",")[0]}
                        </p>
                        <p className="mt-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                          {shipment.current_location || "Aguardando nova atualização"}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="surface-card rounded-[2rem] border-0">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Leitura rápida</p>
                <div className="mt-4 space-y-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  <div className="flex items-start gap-3 rounded-[1.4rem] bg-[hsl(var(--surface-elevated))] p-4">
                    <Warehouse className="mt-0.5 h-4 w-4 text-primary" />
                    Centralize no projeto o perfil do estoque, o objetivo do hub e os mercados prioritários.
                  </div>
                  <div className="flex items-start gap-3 rounded-[1.4rem] bg-[hsl(var(--surface-elevated))] p-4">
                    <Boxes className="mt-0.5 h-4 w-4 text-primary" />
                    Combine distribuição, tracking, impostos ou canais digitais no mesmo fluxo quando o projeto exigir operação híbrida.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientFulfillmentDashboard;
