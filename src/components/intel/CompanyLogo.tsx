import React, { useMemo } from "react";

const PALETTE = [
  { bg: "#D80E16", fg: "#ffffff" }, // TRADEXA red
  { bg: "#2563EB", fg: "#ffffff" }, // blue
  { bg: "#059669", fg: "#ffffff" }, // emerald
  { bg: "#D97706", fg: "#ffffff" }, // amber
  { bg: "#7C3AED", fg: "#ffffff" }, // purple
  { bg: "#0891B2", fg: "#ffffff" }, // cyan
  { bg: "#DC2626", fg: "#ffffff" }, // red
  { bg: "#65A30D", fg: "#ffffff" }, // lime
  { bg: "#C026D3", fg: "#ffffff" }, // fuchsia
  { bg: "#EA580C", fg: "#ffffff" }, // orange
];

const SIZES: Record<string, { box: number; font: number }> = {
  sm: { box: 32, font: 12 },
  md: { box: 40, font: 14 },
  lg: { box: 56, font: 18 },
  xl: { box: 72, font: 24 },
};

/** Deterministic hash from string */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Extract initials from company name */
function getInitials(nome: string): string {
  if (!nome || nome === "N/I") return "?";
  const cleaned = nome
    .replace(/^(LTDA|S\/A|S\.A\.|ME|EPP|EIRELI|LIMITADA)/i, "")
    .replace(/\s+(LTDA|S\/A|S\.A\.|ME|EPP|EIRELI|LIMITADA)$/i, "")
    .trim();
  const words = cleaned.split(/\s+/).filter(w => 
    w.length > 1 && !/^(DE|DA|DO|DAS|DOS|E|&)$/i.test(w)
  );
  if (words.length === 0) return nome.substring(0, 2).toUpperCase();
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

interface Props {
  nome: string;
  cnpj?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** Show ring/border */
  ring?: boolean;
}

export const CompanyLogo: React.FC<Props> = ({
  nome,
  cnpj,
  size = "md",
  className = "",
  ring = false,
}) => {
  const { color, initials } = useMemo(() => {
    const seed = cnpj || nome || "?";
    const idx = hashStr(seed) % PALETTE.length;
    return {
      color: PALETTE[idx],
      initials: getInitials(nome),
    };
  }, [nome, cnpj]);

  const { box, font } = SIZES[size];

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${ring ? "ring-2 ring-white shadow-sm" : ""} ${className}`}
      style={{
        width: box,
        height: box,
        borderRadius: box * 0.22,
        background: color.bg,
        color: color.fg,
        fontSize: font,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
      title={nome}
    >
      {initials}
    </div>
  );
};

export default CompanyLogo;
