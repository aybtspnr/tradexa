"use client";

import { X, Anchor, Plane, AlertTriangle, Ship, Building2, Navigation, Clock } from "lucide-react";
import type { SelectedFeature } from "./SupplyChainMap";

interface Props {
  feature: SelectedFeature;
  onClose: () => void;
}

function headingToCompass(h: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(h / 45) % 8];
}

export function FeatureDetail({ feature, onClose }: Props) {
  const { type, data } = feature;

  return (
    <div className="absolute bottom-20 left-4 right-4 md:right-auto md:w-[360px] z-30 bg-white/95 backdrop-blur-xl rounded-2xl border border-black/[0.06] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/[0.04]">
        <div className="flex items-center gap-2">
          {type === "port" && <Anchor className="w-4 h-4 text-[#D80E16]" />}
          {type === "airport" && <Building2 className="w-4 h-4 text-[#3b82f6]" />}
          {type === "chokepoint" && <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />}
          {type === "cargo_flight" && <Plane className="w-4 h-4 text-[#D80E16]" />}
          {type === "maritime" && <Ship className="w-4 h-4 text-[#0891b2]" />}
          <span className="text-xs font-black uppercase tracking-wider text-[#5E6278]">
            {type === "port" && "Porto"}
            {type === "airport" && "Aeroporto"}
            {type === "chokepoint" && "Chokepoint"}
            {type === "cargo_flight" && "Avião"}
            {type === "maritime" && "Navio"}
          </span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/[0.04]">
          <X className="w-4 h-4 text-[#5E6278]" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {type === "port" && (
          <>
            <h3 className="text-lg font-extrabold text-[#0F111A]">{data.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#5E6278]">País:</span> <span className="font-bold text-[#0F111A]">{data.country}</span></div>
              <div><span className="text-[#5E6278]">Tipo:</span> <span className="font-bold text-[#0F111A]">{data.type}</span></div>
              <div><span className="text-[#5E6278]">Volume:</span> <span className="font-bold text-[#D80E16]">{data.volume}</span></div>
              <div><span className="text-[#5E6278]">Rank Global:</span> <span className="font-bold text-[#0F111A]">#{data.rank}</span></div>
            </div>
          </>
        )}

        {type === "airport" && (
          <>
            <h3 className="text-lg font-extrabold text-[#0F111A]">{data.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#5E6278]">IATA:</span> <span className="font-bold text-[#3b82f6]">{data.iata || "—"}</span></div>
              <div><span className="text-[#5E6278]">ICAO:</span> <span className="font-bold text-[#0F111A]">{data.icao || "—"}</span></div>
              <div><span className="text-[#5E6278]">País:</span> <span className="font-bold text-[#0F111A]">{data.country}</span></div>
              <div><span className="text-[#5E6278]">Tipo:</span> <span className="font-bold text-[#0F111A]">{data.type?.replace("_"," ")}</span></div>
              <div><span className="text-[#5E6278]">Cidade:</span> <span className="font-bold text-[#0F111A]">{data.municipality || "—"}</span></div>
              <div><span className="text-[#5E6278]">Elevação:</span> <span className="font-bold text-[#D80E16]">{data.elevation ? `${data.elevation}ft` : "—"}</span></div>
              {data.scheduled && (
                <div className="col-span-2"><span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold">Voo Regular</span></div>
              )}
            </div>
          </>
        )}

        {type === "chokepoint" && (
          <>
            <h3 className="text-lg font-extrabold text-[#0F111A]">{data.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5E6278]">Risco:</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                data.risk === "LOW" ? "bg-green-100 text-green-700" :
                data.risk === "MODERATE" ? "bg-yellow-100 text-yellow-700" :
                data.risk === "ELEVATED" ? "bg-orange-100 text-orange-700" :
                data.risk === "HIGH" ? "bg-red-100 text-red-700" :
                "bg-red-200 text-red-800"
              }`}>{data.risk}</span>
            </div>
            {data.traffic && <p className="text-xs text-[#5E6278]">Tráfego: {data.traffic}</p>}
            {data.description && <p className="text-xs text-[#5E6278]">{data.description}</p>}
          </>
        )}

        {type === "cargo_flight" && (
          <>
            <h3 className="text-lg font-extrabold text-[#0F111A]">{data.callsign}</h3>
            {data.airline && (
              <p className="text-xs text-[#D80E16] font-bold -mt-1 mb-1">{data.airline}</p>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#5E6278]">Modelo:</span> <span className="font-bold text-[#0F111A]">{data.model}</span></div>
              <div><span className="text-[#5E6278]">Registro:</span> <span className="font-bold text-[#0F111A]">{data.registration}</span></div>
              <div><span className="text-[#5E6278]">Altitude:</span> <span className="font-bold text-[#D80E16]">{data.alt.toLocaleString()} m</span></div>
              <div>
                <span className="text-[#5E6278]">Direção:</span>
                <span className="font-bold text-[#0F111A] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#D80E16]" style={{ transform: `rotate(${data.heading}deg)` }} />
                  {data.heading}° {headingToCompass(data.heading)}
                </span>
              </div>
              <div><span className="text-[#5E6278]">Velocidade:</span> <span className="font-bold text-[#0F111A]">{data.speed_knots ?? "—"} kt</span></div>
              <div><span className="text-[#5E6278]">ICAO24:</span> <span className="font-bold text-[#0F111A]">{data.icao24?.toUpperCase()}</span></div>
            </div>
          </>
        )}

        {type === "maritime" && (
          <>
            <h3 className="text-lg font-extrabold text-[#0F111A]">{data.name || `MMSI ${data.mmsi}`}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-[#5E6278]">MMSI:</span> <span className="font-bold text-[#0F111A]">{data.mmsi}</span></div>
              <div><span className="text-[#5E6278]">Velocidade:</span> <span className="font-bold text-[#0F111A]">{data.speed} kn</span></div>
              <div>
                <span className="text-[#5E6278]">Rumo:</span>
                <span className="font-bold text-[#0F111A] flex items-center gap-1">
                  <Navigation className="w-3 h-3 text-[#0891b2]" style={{ transform: `rotate(${data.heading}deg)` }} />
                  {data.heading}° {headingToCompass(data.heading)}
                </span>
              </div>
              {data.callsign && <div><span className="text-[#5E6278]">Callsign:</span> <span className="font-bold text-[#0F111A]">{data.callsign}</span></div>}
              {data.destination ? (
                <div className="col-span-2 bg-[#0891b2]/5 rounded-lg p-2 border border-[#0891b2]/10">
                  <span className="text-[#5E6278] text-[10px] uppercase tracking-wider font-bold">Destino</span>
                  <p className="font-extrabold text-[#0F111A] text-sm mt-0.5">{data.destination}</p>
                  {data.eta && (
                    <p className="text-[10px] text-[#5E6278] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> ETA: {data.eta}
                    </p>
                  )}
                </div>
              ) : (
                <div className="col-span-2 text-[10px] text-[#5E6278] italic">Destino não disponível (aguardando transmissão)</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
