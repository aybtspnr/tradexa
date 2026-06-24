import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, AlertTriangle, Cloud, Radio, Loader2 } from "lucide-react";

interface GlobalAlert {
  id: string;
  type: 'news' | 'earthquake';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: string;
  url?: string;
}

interface PortWeather {
  portName: string;
  state: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  weatherDesc: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
};

const TYPE_ICONS: Record<string, any> = {
  news: Radio,
  earthquake: AlertTriangle,
};

function WindArrow(deg: number) {
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return <span className="text-xs">↑ {dirs[Math.round(deg / 45) % 8]}</span>;
}

export default function GlobalAlertsPanel() {
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [ports, setPorts] = useState<PortWeather[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [alertsRes, portsRes] = await Promise.allSettled([
        fetch("/api/global-alerts").then(r => r.json()),
        fetch("/api/port-weather").then(r => r.json()),
      ]);
      if (alertsRes.status === "fulfilled") setAlerts(alertsRes.value.alerts || []);
      if (portsRes.status === "fulfilled") setPorts(portsRes.value.ports || []);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 300000); // 5min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Global Alerts */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-blue-500" />
            Alertas Globais
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin ml-auto" />
            ) : (
              <Badge variant="outline" className="ml-auto text-xs">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto space-y-2">
          {!loading && alerts.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum alerta no momento
            </p>
          )}
          {alerts.slice(0, 15).map((alert) => {
            const Icon = TYPE_ICONS[alert.type] || Globe;
            return (
              <a
                key={alert.id}
                href={alert.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-xs p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
              >
                <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge className={`text-[10px] px-1 py-0 ${SEVERITY_COLORS[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {alert.source}
                    </span>
                  </div>
                  <p className="font-medium truncate mt-0.5">{alert.title}</p>
                  {alert.description && (
                    <p className="text-muted-foreground truncate">{alert.description}</p>
                  )}
                </div>
              </a>
            );
          })}
        </CardContent>
      </Card>

      {/* Brazilian Ports Weather */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cloud className="h-4 w-4 text-cyan-500" />
            Clima nos Portos Brasileiros
            {loading && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[300px] overflow-y-auto">
          {!loading && ports.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Sem dados meteorológicos
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            {ports.map((port) => (
              <div key={port.portName} className="p-2 rounded-lg bg-muted/30 text-xs">
                <div className="font-medium flex items-center justify-between">
                  <span>{port.portName}</span>
                  <span className="text-muted-foreground text-[10px]">{port.weatherDesc}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <span>🌡️ {port.temperature}°C</span>
                  <span>💨 {port.windSpeed} km/h</span>
                  <WindArrow deg={port.windDirection} />
                  {port.precipitation > 0 && (
                    <span>🌧️ {port.precipitation}mm</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
