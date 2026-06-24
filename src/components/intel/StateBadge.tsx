import React from "react";

/* ═══ Simplified Brazilian State Flag SVGs ═══ */
/* Each flag captures the essential visual identity: background colors + key symbol */

const SIZES: Record<string, number> = {
  xs: 18,
  sm: 22,
  md: 28,
  lg: 40,
  xl: 56,
};

/* Helper: flag container */
function FlagBox({ children, size }: { children: React.ReactNode; size: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        width: size * 1.4,
        height: size,
        borderRadius: Math.max(2, size * 0.12),
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.1)",
        flexShrink: 0,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </span>
  );
}

/* Helper: solid color flag with optional text */
function SolidFlag({ bg, children }: { bg: string; children?: React.ReactNode }) {
  return (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill={bg} />
      {children}
    </svg>
  );
}

/* Horizontal bands */
function BandsFlag({ colors }: { colors: string[] }) {
  const h = 10 / colors.length;
  return (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      {colors.map((c, i) => (
        <rect key={i} y={i * h} width="14" height={h} fill={c} />
      ))}
    </svg>
  );
}

/* Each state flag — simplified */
const STATE_FLAGS: Record<string, React.FC> = {
  // AC — green with yellow diagonal
  AC: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <path d="M0 10L14 0L14 10Z" fill="#fedf00" />
      <path d="M0 10L14 0" stroke="#002776" strokeWidth="0.8" />
    </svg>
  ),
  // AL — red-white-blue vertical bands
  AL: () => <BandsFlag colors={["#ff0000", "#ffffff", "#0000ff"]} />,
  // AP — blue-green horizontal with white diagonal
  AP: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="5" fill="#009b3a" />
      <rect y="5" width="14" height="5" fill="#0071b9" />
      <path d="M0 0L14 10" stroke="#ffffff" strokeWidth="0.8" />
    </svg>
  ),
  // AM — blue with yellow diagonal
  AM: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#002776" />
      <path d="M0 0L14 10M0 10L14 0" stroke="#ffdf00" strokeWidth="1" fill="none" />
    </svg>
  ),
  // BA — white with red-blue rhombus
  BA: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <path d="M7 2L11 5L7 8L3 5Z" fill="#ed1c24" stroke="#00aeef" strokeWidth="0.5" />
    </svg>
  ),
  // CE — green with yellow lozenge
  CE: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <path d="M2 5L7 2L12 5L7 8Z" fill="#ffdf00" />
      <circle cx="7" cy="5" r="1" fill="#002776" />
    </svg>
  ),
  // DF — green with yellow
  DF: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <rect x="2" y="2" width="10" height="6" fill="#ffdf00" rx="0.5" />
      <rect x="3.5" y="3.5" width="7" height="3" fill="#ffffff" rx="0.3" />
    </svg>
  ),
  // ES — blue-white-pink horizontal
  ES: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="3.3" fill="#009b3a" />
      <rect y="3.3" width="14" height="3.4" fill="#ffffff" />
      <rect y="6.7" width="14" height="3.3" fill="#ec1c24" />
    </svg>
  ),
  // GO — green with yellow
  GO: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <rect x="1.5" y="1.5" width="11" height="7" fill="#ffdf00" rx="0.5" />
      <text x="7" y="6.5" fontSize="3" fill="#009b3a" textAnchor="middle" fontWeight="bold">GO</text>
    </svg>
  ),
  // MA — red-white-red with blue canton
  MA: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <rect width="14" height="2.5" fill="#000" />
      <rect y="7.5" width="14" height="2.5" fill="#c8102e" />
      <rect width="6" height="5" fill="#002776" />
      <text x="3" y="4" fontSize="3" fill="#ffdf00" textAnchor="middle" fontWeight="bold">★</text>
    </svg>
  ),
  // MG — red with white rhombus
  MG: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <path d="M7 1L13 5L7 9L1 5Z" fill="#c8102e" />
      <text x="7" y="6" fontSize="2.5" fill="#ffdf00" textAnchor="middle" fontWeight="bold">MG</text>
    </svg>
  ),
  // MS — green-blue horizontal
  MS: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="5" fill="#009b3a" />
      <rect y="5" width="14" height="5" fill="#002776" />
      <text x="7" y="7" fontSize="3" fill="#ffdf00" textAnchor="middle" fontWeight="bold">MS</text>
    </svg>
  ),
  // MT — green with blue
  MT: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <rect x="1.5" y="1.5" width="11" height="7" fill="#002776" rx="0.3" />
      <text x="7" y="6.5" fontSize="3" fill="#ffdf00" textAnchor="middle" fontWeight="bold">MT</text>
    </svg>
  ),
  // PA — red-white with blue
  PA: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="5" fill="#c8102e" />
      <rect y="5" width="14" height="5" fill="#ffffff" />
      <path d="M0 5L7 1.5L14 5Z" fill="#002776" />
    </svg>
  ),
  // PB — red-blue horizontal with white star
  PB: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="5" fill="#c8102e" />
      <rect y="5" width="14" height="5" fill="#002776" />
      <text x="7" y="7.5" fontSize="4" fill="#ffdf00" textAnchor="middle">★</text>
    </svg>
  ),
  // PE — blue with red-white
  PE: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#002776" />
      <rect x="0" y="3.5" width="14" height="3" fill="#c8102e" />
      <rect x="0" y="4.5" width="14" height="1" fill="#ffffff" />
    </svg>
  ),
  // PI — green-yellow-white
  PI: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <rect x="0" y="3.3" width="14" height="3.4" fill="#ffdf00" />
      <rect x="0" y="6.7" width="14" height="3.3" fill="#ffffff" />
    </svg>
  ),
  // PR — green-white with blue circle
  PR: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <rect x="1.5" y="1.5" width="11" height="7" fill="#ffffff" rx="0.3" />
      <circle cx="7" cy="5" r="2" fill="#002776" />
    </svg>
  ),
  // RJ — blue-white-green horizontal
  RJ: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <rect width="14" height="2.5" fill="#002776" />
      <rect y="7.5" width="14" height="2.5" fill="#009b3a" />
      <text x="7" y="6" fontSize="3" fill="#c8102e" textAnchor="middle" fontWeight="bold">★</text>
    </svg>
  ),
  // RN — green-white-green with yellow
  RN: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <rect width="14" height="2" fill="#009b3a" />
      <rect y="8" width="14" height="2" fill="#009b3a" />
      <text x="7" y="6.5" fontSize="4" fill="#ffdf00" textAnchor="middle">★</text>
    </svg>
  ),
  // RO — green with yellow diagonal
  RO: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <path d="M0 10L14 0" stroke="#ffdf00" strokeWidth="2" />
      <circle cx="7" cy="5" r="1.5" fill="#002776" />
    </svg>
  ),
  // RR — green-white-blue with yellow star
  RR: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="5" fill="#009b3a" />
      <rect y="5" width="14" height="5" fill="#002776" />
      <rect x="0" y="4.5" width="14" height="1" fill="#ffffff" />
      <text x="7" y="5" fontSize="3" fill="#ffdf00" textAnchor="middle">★</text>
    </svg>
  ),
  // RS — green with yellow rhombus
  RS: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <path d="M7 2L12 5L7 8L2 5Z" fill="#ffdf00" />
      <circle cx="7" cy="5" r="1.2" fill="#c8102e" />
    </svg>
  ),
  // SC — white with red-yellow
  SC: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <path d="M0 0L7 5L0 10Z" fill="#009b3a" />
      <path d="M14 0L7 5L14 10Z" fill="#009b3a" />
      <text x="7" y="5.5" fontSize="2.5" fill="#c8102e" textAnchor="middle" fontWeight="bold">SC</text>
    </svg>
  ),
  // SE — green with yellow
  SE: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#009b3a" />
      <rect x="0" y="3" width="14" height="4" fill="#ffdf00" />
      <text x="7" y="6" fontSize="2.5" fill="#002776" textAnchor="middle" fontWeight="bold">SE</text>
    </svg>
  ),
  // SP — black-white horizontal bands
  SP: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#ffffff" />
      <rect width="14" height="3.3" fill="#000" />
      <rect y="6.7" width="14" height="3.3" fill="#000" />
      <rect x="5.5" y="4" width="3" height="2" fill="#c8102e" rx="0.2" />
    </svg>
  ),
  // TO — blue with white sun
  TO: () => (
    <svg viewBox="0 0 14 10" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
      <rect width="14" height="10" fill="#002776" />
      <rect width="14" height="3.3" fill="#009b3a" />
      <rect y="6.7" width="14" height="3.3" fill="#ffdf00" />
      <circle cx="7" cy="5" r="1.5" fill="#ffffff" />
    </svg>
  ),
};

interface Props {
  uf: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Show UF label next to flag */
  withLabel?: boolean;
  /** Rounded badge style (circle with flag inside + UF overlay) */
  badge?: boolean;
}

export const StateBadge: React.FC<Props> = ({
  uf,
  size = "sm",
  className = "",
  withLabel = false,
  badge = false,
}) => {
  const normalizedUf = (uf || "").toUpperCase().trim();
  const FlagComponent = STATE_FLAGS[normalizedUf];
  const px = SIZES[size];

  if (badge) {
    // Circle badge with flag background + UF text overlay
    return (
      <span
        className={`inline-flex items-center justify-center shrink-0 relative ${className}`}
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      >
        {FlagComponent ? (
          <span style={{ width: "100%", height: "100%", display: "block" }}>
            <FlagComponent />
          </span>
        ) : (
          <span style={{ width: "100%", height: "100%", background: "#64748B", display: "block" }} />
        )}
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: px * 0.32,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {normalizedUf}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <FlagBox size={px}>
        {FlagComponent ? <FlagComponent /> : <SolidFlag bg="#64748B" />}
      </FlagBox>
      {withLabel && (
        <span className="text-sm font-medium text-slate-700">{normalizedUf}</span>
      )}
    </span>
  );
};

export default StateBadge;
