import React from "react";

type IconProps = {
  className?: string;
  size?: number;
};

const DEFAULT_SIZE = 20;

/* ═══ Marítimo — Navio porta-contêiner com ondas ═══ */
export const ShipIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Hull */}
    <path d="M3 18l1.5 3h15L21 18" />
    <path d="M4 18h16l-1-5H5z" fill="#0EA5E920" />
    {/* Containers */}
    <rect x="7" y="9" width="4" height="4" rx="0.5" fill="#0EA5E940" stroke="#0EA5E9" strokeWidth="1.5" />
    <rect x="11.5" y="9" width="4" height="4" rx="0.5" fill="#0EA5E930" stroke="#0EA5E9" strokeWidth="1.5" />
    {/* Mast */}
    <path d="M12 9V5" />
    <path d="M10 5h4" />
    {/* Waves */}
    <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" opacity="0.6" />
  </svg>
);

/* ═══ Aéreo — Avião de carga com trilha ═══ */
export const PlaneIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Trail */}
    <path d="M2 12c2-1 4-1 6 0" opacity="0.3" strokeDasharray="2 2" />
    {/* Plane body */}
    <path d="M22 16.5l-1.5-6.5L17 8l-1 3.5L8 8 6 9l5 5-2 1.5L6 15l-1 .5L7 18l1 1 2.5-2 1.5-1 5 5 1-1-1.5-3 2-1 2.5 1z" fill="#8B5CF615" />
    <path d="M22 16.5l-1.5-6.5L17 8l-1 3.5L8 8 6 9l5 5-2 1.5L6 15l-1 .5L7 18l1 1 2.5-2 1.5-1 5 5 1-1-1.5-3 2-1 2.5 1z" />
  </svg>
);

/* ═══ Rodoviário — Caminhão com estrada ═══ */
export const TruckIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Cargo box */}
    <rect x="1.5" y="6" width="13" height="10" rx="1.5" fill="#F59E0B15" />
    {/* Cab */}
    <path d="M14.5 9h4l3 3v4h-7z" fill="#F59E0B15" />
    <path d="M14.5 9h4l3 3v4h-7z" />
    {/* Window */}
    <path d="M16 9.5v2.5h4.5" opacity="0.5" />
    {/* Wheels */}
    <circle cx="6" cy="18" r="2" fill="#fff" />
    <circle cx="6" cy="18" r="1" fill="#F59E0B" />
    <circle cx="18" cy="18" r="2" fill="#fff" />
    <circle cx="18" cy="18" r="1" fill="#F59E0B" />
    {/* Road line */}
    <path d="M1 21h22" opacity="0.3" strokeDasharray="3 2" />
  </svg>
);

/* ═══ Porto/URF Marítima — Guindaste de porto ═══ */
export const PortCraneIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Crane tower */}
    <path d="M6 21V8" />
    <path d="M6 8l-1-2M6 8l1-2" />
    {/* Horizontal arm */}
    <path d="M3 8h14" />
    {/* Cable + container */}
    <path d="M14 8v3" />
    <rect x="12" y="11" width="5" height="3.5" rx="0.5" fill="#0EA5E920" />
    {/* Base */}
    <path d="M4 21h4" />
    {/* Ship hint */}
    <path d="M11 21c.5.3 1 .5 2 .5s1.5-.2 2-.5" opacity="0.4" />
  </svg>
);

/* ═══ Aeroporto — Terminal de carga aérea ═══ */
export const AirportIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Terminal building */}
    <path d="M3 21V10l9-5 9 5v11" fill="#8B5CF610" />
    <path d="M3 21V10l9-5 9 5v11" />
    {/* Door */}
    <rect x="10" y="15" width="4" height="6" rx="0.5" fill="#8B5CF620" />
    {/* Runway */}
    <path d="M3 21h18" opacity="0.3" strokeDasharray="4 3" />
  </svg>
);

/* ═══ Fronteira — Posto fronteiriço ═══ */
export const BorderPostIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Barrier pole */}
    <path d="M4 12h16" />
    <path d="M4 12v8M20 12v8" />
    {/* Stripes */}
    <rect x="6" y="10.5" width="3" height="3" fill="#F59E0B30" rx="0.3" />
    <rect x="10" y="10.5" width="3" height="3" fill="#F59E0B40" rx="0.3" />
    <rect x="14" y="10.5" width="3" height="3" fill="#F59E0B30" rx="0.3" />
    {/* Ground */}
    <path d="M2 20h20" opacity="0.3" />
    {/* Sign */}
    <path d="M12 6l-3-3h6z" fill="#F59E0B20" />
  </svg>
);

/* ═══ Generic URF ═══ */
export const WarehouseIcon: React.FC<IconProps> = ({ className, size = DEFAULT_SIZE }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21V8l9-4 9 4v13" fill="#64748B10" />
    <path d="M3 21V8l9-4 9 4v13" />
    <rect x="9" y="13" width="6" height="8" rx="0.5" fill="#64748B15" />
  </svg>
);

/* ═══ Transport mode metadata ═══ */
export type TransportMode = "maritimo" | "aereo" | "rodoviario" | "outros";

export const TRANSPORT_MODES: { key: TransportMode; label: string; color: string; Icon: React.FC<IconProps> }[] = [
  { key: "maritimo", label: "Marítimo", color: "#0EA5E9", Icon: ShipIcon },
  { key: "aereo", label: "Aéreo", color: "#8B5CF6", Icon: PlaneIcon },
  { key: "rodoviario", label: "Rodoviário", color: "#F59E0B", Icon: TruckIcon },
  { key: "outros", label: "Outros", color: "#64748B", Icon: WarehouseIcon },
];

/** Parse via name to determine transport mode */
export function getTransportMode(viaName: string): TransportMode {
  const name = (viaName || "").toLowerCase();
  if (name.includes("mar") || name.includes("maritimo") || name.includes("marítimo") || name.includes("ocean")) return "maritimo";
  if (name.includes("aer") || name.includes("aereo") || name.includes("aéreo") || name.includes("air")) return "aereo";
  if (name.includes("rod") || name.includes("rodoviario") || name.includes("rodoviário") || name.includes("road") || name.includes("truck")) return "rodoviario";
  return "outros";
}

/** Get the right icon for a via name */
export function ViaIcon({ viaName, className, size }: { viaName: string; className?: string; size?: number }) {
  const mode = getTransportMode(viaName);
  const entry = TRANSPORT_MODES.find(m => m.key === mode)!;
  return <entry.Icon className={className} size={size} />;
}

/** Get transport label */
export function getTransportLabel(viaName: string): string {
  const mode = getTransportMode(viaName);
  if (mode === "outros") return viaName || "Outros";
  return TRANSPORT_MODES.find(m => m.key === mode)!.label;
}

/** Get URF-specific icon (port crane for maritime, airport for aerial, etc.) */
export function UrfIcon({ viaName, className, size }: { viaName: string; className?: string; size?: number }) {
  const mode = getTransportMode(viaName);
  if (mode === "maritimo") return <PortCraneIcon className={className} size={size} />;
  if (mode === "aereo") return <AirportIcon className={className} size={size} />;
  if (mode === "rodoviario") return <BorderPostIcon className={className} size={size} />;
  return <WarehouseIcon className={className} size={size} />;
}
