import React, { useState, useMemo } from "react";
import comexToIso from "./data/pais-comex-to-iso.json";

const FLAG_SIZES: Record<string, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 40,
  xl: 56,
};

/** Map ComexStat 3-digit country code to ISO alpha-2 */
export function comexToIso2(codPais: string): string {
  const code = String(codPais).padStart(3, "0");
  return (comexToIso as Record<string, string>)[code] || "";
}

/** Get flag URL from flagcdn.com */
export function flagUrl(iso2: string, size: number = 40): string {
  const code = iso2.toLowerCase();
  if (!code || code === "xx") return "";
  // flagcdn.com supports w20, w40, w80, w160, w320
  const w = size <= 20 ? 20 : size <= 40 ? 40 : size <= 80 ? 80 : 160;
  return `https://flagcdn.com/w${w}/${code}.png`;
}

/** Generate initials from country name */
function countryInitials(nome: string): string {
  if (!nome) return "?";
  const words = nome.trim().split(/\s+/).filter(w => w.length > 2 || w === nome);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Color from ISO2 code (deterministic) */
function codeColor(iso2: string): string {
  const colors = ["#D80E16", "#2563EB", "#059669", "#D97706", "#7C3AED", "#0891B2", "#DC2626", "#65A30D"];
  let hash = 0;
  for (let i = 0; i < iso2.length; i++) hash = ((hash << 5) - hash + iso2.charCodeAt(i)) | 0;
  return colors[Math.abs(hash) % colors.length];
}

interface Props {
  /** ComexStat 3-digit country code (e.g., "249" for USA) */
  codPais?: string;
  /** ISO alpha-2 code (e.g., "US"). Takes priority over codPais */
  iso2?: string;
  /** Country name (used for initials fallback) */
  nome?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Show country name next to flag */
  withName?: boolean;
  /** Rounded (default) or square shape */
  rounded?: boolean;
}

export const CountryFlag: React.FC<Props> = ({
  codPais,
  iso2,
  nome,
  size = "sm",
  className = "",
  withName = false,
  rounded = true,
}) => {
  const [imgError, setImgError] = useState(false);
  const resolvedIso2 = useMemo(() => {
    if (iso2) return iso2.toLowerCase();
    if (codPais) return comexToIso2(codPais);
    return "";
  }, [iso2, codPais]);

  const px = FLAG_SIZES[size];
  const url = flagUrl(resolvedIso2, px);
  const showImg = url && !imgError;
  const initials = countryInitials(nome || resolvedIso2);

  const containerStyle: React.CSSProperties = {
    width: px,
    height: px,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
    borderRadius: rounded ? Math.max(2, px * 0.15) : 0,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#f1f5f9",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span style={containerStyle}>
        {showImg ? (
          <img
            src={url}
            alt={nome || resolvedIso2}
            width={px}
            height={px}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            style={{
              fontSize: px * 0.35,
              fontWeight: 700,
              color: "#fff",
              background: codeColor(resolvedIso2 || "xx"),
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {initials}
          </span>
        )}
      </span>
      {withName && (
        <span className="text-sm font-medium text-slate-700 truncate">{nome || resolvedIso2}</span>
      )}
    </span>
  );
};

export default CountryFlag;
