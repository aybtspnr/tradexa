/**
 * Rastreamento de Container e Carga - Landing Page Publica
 * SEO: "Rastreamento de Container", "Tracking de Frete"
 * carriers reais: Maersk, ZIM, DHL, FedEx, UPS
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Ship, Package, Clock, MapPin,
  CheckCircle, AlertCircle, ArrowRight, Navigation,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useSeo } from "@/hooks/use-seo";

// ─── Types ───
interface Milestone {
  date: string;
  status: string;
  location?: string | null;
}

interface TrackingResult {
  carrier: string;
  tracking: string;
  status: string;
  origin?: string;
  destination?: string;
  lastUpdate?: string;
  deliveredTo?: string;
  vessel?: string;
  message?: string;
  milestones?: Milestone[];
  raw?: string[];
  cached?: boolean;
}

// ─── Carrier detection ───
function detectCarrier(num: string): { carrier: string; label: string } | null {
  const n = num.replace(/\s/g, "").toUpperCase();
  if (/^(MAEU|MRKU|SEGU)\d{7}$/.test(n)) return { carrier: "maersk", label: "Maersk" };
  if (/^(ZIMU|ZCSU)\d{7}$/.test(n)) return { carrier: "zim", label: "ZIM" };
  if (/^1Z[A-Z0-9]{16}$/i.test(n)) return { carrier: "ups", label: "UPS" };
  if (/^JD\d{18}$/i.test(n) || /^\d{10,11}$/.test(n)) return { carrier: "dhl", label: "DHL" };
  if (/^\d{12,22}$/.test(n)) return { carrier: "fedex", label: "FedEx" };
  return null;
}

// ─── API ───
async function trackNumber(number: string): Promise<TrackingResult> {
  const res = await fetch(`/api/track?number=${encodeURIComponent(number)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─── Status Badge ───
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const isDelivered = s.includes("delivered") || s.includes("entregue");
  const isError = s.includes("not_found") || s.includes("error") || s.includes("unsupported");
  const isInTransit = s.includes("transit") || s.includes("trânsito") || s.includes("departed") || s.includes("loading");

  if (isDelivered) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200"><CheckCircle className="w-4 h-4" />Entregue</span>;
  if (isError) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-semibold border border-red-200"><AlertCircle className="w-4 h-4" />Nao encontrado</span>;
  if (isInTransit) return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-200"><Navigation className="w-4 h-4" />Em transito</span>;
  return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold border border-gray-200"><Clock className="w-4 h-4" />{status}</span>;
}

// ─── Timeline Component ───
function TrackingTimeline({ milestones }: { milestones: Milestone[] }) {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="mt-6 mb-2">
      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-400" />
        Historico de Eventos
      </h4>
      <div className="relative ml-3">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

        <div className="space-y-0">
          {milestones.map((m, i) => {
            const isFirst = i === 0;
            const isLast = i === milestones.length - 1;
            const s = (m.status || "").toLowerCase();
            const isDelivered = s.includes("delivered") || s.includes("entregue") || s.includes("received");
            const isError = s.includes("exception") || s.includes("error") || s.includes("delayed");
            const isTransit = s.includes("transit") || s.includes("departed") || s.includes("loaded") || s.includes("discharged");

            return (
              <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Dot */}
                <div className="relative z-10 mt-0.5">
                  <div className={`w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center ${
                    isDelivered ? "bg-emerald-500 border-emerald-500" :
                    isError ? "bg-red-500 border-red-500" :
                    isFirst ? "bg-[#D80E16] border-[#D80E16]" :
                    "bg-white border-gray-300"
                  }`}>
                    {(isFirst || isDelivered) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${
                    isFirst ? "text-gray-900" : "text-gray-700"
                  }`}>
                    {m.status}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{m.date}</span>
                    {m.location && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{m.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main ───
export default function RastreamentoPage() {
  useSeo({
    title: "Rastreamento de Container e Carga | TRADEXA",
    description: "Rastreie containers maritimos e cargas express em tempo real. Maersk, ZIM, DHL, FedEx, UPS. Gratuito e sem cadastro.",
    canonical: "/rastreamento",
  });

  const [input, setInput] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<{ carrier: string; label: string } | null>(null);

  const handleInputChange = useCallback((val: string) => {
    setInput(val);
    setDetected(detectCarrier(val));
  }, []);

  const handleTrack = useCallback(async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await trackNumber(input.trim());
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Erro ao rastrear");
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <SiteLayout>
      {/* Hero - Light */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#D80E16]/10 text-[#D80E16] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Navigation className="w-4 h-4" /> Rastreamento Gratuito
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Rastreie sua <span className="text-[#D80E16]">carga</span> em tempo real
          </h1>
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Containers maritimos e pacotes express.
            Maersk, ZIM, DHL, FedEx e UPS. Sem cadastro.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg shadow-gray-200/50">
              <div className="pl-5 text-gray-400"><Search className="w-5 h-5" /></div>
              <input
                type="text" value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="Digite o numero do container, AWB ou tracking..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 px-4 py-5 text-base md:text-lg outline-none"
                autoFocus
              />
              {detected && (
                <div className="hidden md:flex items-center gap-2 pr-3 bg-gray-50 rounded-lg px-3 py-1.5 mr-2">
                  <span className="text-sm font-bold text-gray-700">{detected.label}</span>
                </div>
              )}
              <button
                onClick={handleTrack}
                disabled={loading || !input.trim()}
                className="bg-[#D80E16] hover:bg-[#b80c12] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 md:px-8 py-5 font-bold transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="hidden md:inline">Buscando...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Rastrear <ArrowRight className="w-4 h-4" /></span>
                )}
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-gray-400">
              <span>Exemplos:</span>
              {["MAEU1234567", "MSCU4875240", "1Z999AA10123456784"].map((ex) => (
                <button key={ex} onClick={() => { setInput(ex); setDetected(detectCarrier(ex)); }}
                  className="hover:text-gray-600 transition-colors font-mono">{ex}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <AnimatePresence>
        {(result || error) && (
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 mb-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {error ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 font-semibold">{error}</p>
                </div>
              ) : result && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        {["maersk", "zim"].includes(result.carrier) ? <Ship className="w-5 h-5 text-gray-600" /> : <Package className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Carrier</p>
                        <p className="font-bold text-gray-900 capitalize">{result.carrier}</p>
                      </div>
                    </div>
                    <StatusBadge status={result.status || "unknown"} />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-500 mb-1">Numero de Rastreamento</p>
                    <p className="font-mono text-lg font-bold text-gray-900">{result.tracking}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {result.origin && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div><p className="text-xs text-gray-500">Origem</p><p className="font-semibold text-gray-900">{result.origin}</p></div>
                      </div>
                    )}
                    {result.destination && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div><p className="text-xs text-gray-500">Destino</p><p className="font-semibold text-gray-900">{result.destination}</p></div>
                      </div>
                    )}
                    {result.lastUpdate && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div><p className="text-xs text-gray-500">Ultima Atualizacao</p><p className="font-semibold text-gray-900">{result.lastUpdate}</p></div>
                      </div>
                    )}
                    {result.deliveredTo && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div><p className="text-xs text-gray-500">Entregue para</p><p className="font-semibold text-gray-900">{result.deliveredTo}</p></div>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {result.milestones && result.milestones.length > 0 && (
                    <TrackingTimeline milestones={result.milestones} />
                  )}
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-4">Como funciona</h2>
          <p className="text-gray-500 text-center max-w-xl mx-auto mb-12">Basta digitar o numero de rastreamento. O sistema identifica o carrier e consulta os dados em tempo real.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Digite o numero", desc: "Container maritimo (ex: MAEU1234567), AWB aereo ou tracking express (ex: 1Z...)." },
              { step: "2", title: "Auto-deteccao", desc: "O sistema identifica automaticamente o carrier e a modalidade de transporte pelo formato do numero." },
              { step: "3", title: "Acompanhe o historico", desc: "Veja a timeline completa de eventos, portos visitados, embarque e desembarque da carga." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#D80E16] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">{s.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported carriers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 text-center mb-12">Carriers suportados</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Maersk", type: "Maritimo", desc: "Container" },
              { name: "ZIM", type: "Maritimo", desc: "Container" },
              { name: "DHL", type: "Express", desc: "Pacote" },
              { name: "FedEx", type: "Express", desc: "Pacote" },
              { name: "UPS", type: "Express", desc: "Pacote" },
            ].map((c) => (
              <div key={c.name} className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  {c.type === "Maritimo" ? <Ship className="w-5 h-5 text-gray-600" /> : <Package className="w-5 h-5 text-gray-600" />}
                </div>
                <p className="font-bold text-sm text-gray-900">{c.name}</p>
                <p className="text-xs text-gray-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">Rastreamento de cargas internacionais</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>O rastreamento de cargas permite acompanhar em tempo real a localizacao e o status de containers maritimos e pacotes express durante todo o trajeto logistico.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6">Container Maritimo</h3>
            <p>Containers maritimos possuem numeracao padronizada pela ISO 6346, composta por 4 letras (prefixo do armador) e 7 digitos. Por exemplo, MAEU1234567 indica um container da Maersk. O rastreamento acompanha eventos como embarque, despacho, chegada ao porto de destino e liberacao alfandegaria.</p>
            <h3 className="text-lg font-bold text-gray-900 mt-6">Rastreamento Express</h3>
            <p>Encomendas express possuem numeracao variavel conforme o carrier. DHL utiliza 10-11 digitos, FedEx 12-22 digitos e UPS utiliza o formato 1Z seguido de 16 caracteres alfanumericos. O rastreamento oferece atualizacoes frequentes incluindo coleta, transito e confirmacao de entrega.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0F111A]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4">Precisa de mais que rastreamento?</h2>
          <p className="text-white/60 mb-8">O TRADEXA oferece inteligencia de mercado, classificacao fiscal por IA e analise de importadores.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="inline-flex items-center justify-center gap-2 bg-[#D80E16] hover:bg-[#b80c12] text-white font-bold px-8 py-4 rounded-xl transition-colors">
              Comecar Gratis <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/landing/ncm-classifier" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold px-8 py-4 rounded-xl border border-white/10 transition-colors">
              Classificador IA NCM
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
