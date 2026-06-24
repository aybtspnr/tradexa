/**
 * MarkdownRenderer — renders blog content with react-markdown + remark-gfm.
 * Supports custom callout blocks (::info, ::warning, ::tip) and inline CTAs.
 */
import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import {
  Sparkles, ArrowRight, Check, Info, AlertTriangle,
  Lightbulb, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Callout preprocessor ───
// Converts ::type[title] ... :: blocks into <callout> markers that
// a custom component picks up.

type CalloutType = "info" | "warning" | "tip";

function preprocessCallouts(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inCallout: CalloutType | null = null;
  let calloutLines: string[] = [];
  let calloutTitle = "";

  for (const line of lines) {
    const match = line.match(/^:::(info|warning|tip)\s*(.*)/);
    if (match) {
      inCallout = match[1] as CalloutType;
      calloutTitle = match[2] || "";
      calloutLines = [];
      continue;
    }
    if (line.trim() === ":::" && inCallout) {
      // End of callout
      const body = calloutLines.join("\n").trim();
      out.push(
        `<callout type="${inCallout}" title="${escapeAttr(calloutTitle)}">`,
        body,
        "</callout>",
      );
      inCallout = null;
      calloutLines = [];
      calloutTitle = "";
      continue;
    }
    if (inCallout) {
      calloutLines.push(line);
    } else {
      out.push(line);
    }
  }
  // Unclosed callout → treat as regular text
  if (inCallout && calloutLines.length > 0) {
    out.push("> **" + calloutTitle + "**");
    out.push(">");
    out.push(...calloutLines.map((l) => "> " + l));
  }
  return out.join("\n");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ─── Styles ───

const calloutConfig: Record<CalloutType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  iconColor: string;
  label: string;
}> = {
  info: {
    icon: Info,
    bg: "bg-blue-50 border-blue-200",
    border: "border-l-blue-500",
    text: "text-blue-900",
    iconColor: "text-blue-600",
    label: "Informação",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200",
    border: "border-l-amber-500",
    text: "text-amber-900",
    iconColor: "text-amber-600",
    label: "Atenção",
  },
  tip: {
    icon: Lightbulb,
    bg: "bg-emerald-50 border-emerald-200",
    border: "border-l-emerald-500",
    text: "text-emerald-900",
    iconColor: "text-emerald-600",
    label: "Dica",
  },
};

// ─── CTA Inline (same as existing) ───
function CTAInline() {
  return (
    <div className="not-prose my-8 bg-[#D80E16]/[0.04] border border-[#D80E16]/10 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-[#D80E16] shrink-0" />
        <p className="text-sm text-[#0F111A] font-semibold">
          Quer testar na prática?{" "}
          <span className="text-[#5E6278] font-normal">
            Crie sua conta grátis na TRADEXA.
          </span>
        </p>
      </div>
      <Button
        size="sm"
        className="gap-1.5 bg-[#D80E16] hover:bg-[#b80c12] text-white rounded-xl border-0 shrink-0"
        asChild
      >
        <Link to="/register">
          Começar <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </Button>
    </div>
  );
}

// ─── ReactMarkdown components ───

function createComponents(enableCTA: boolean): Components {
  let paragraphCount = 0;
  let h2Count = 0;

  return {
    // ── Callout (custom HTML tag injected by preprocessor) ──
    callout({ node, children, ...props }: any) {
      const type = (node?.properties?.["type"] || "info") as CalloutType;
      const title = node?.properties?.["title"] || "";
      const cfg = calloutConfig[type] || calloutConfig.info;
      const Icon = cfg.icon;

      return (
        <div className={`not-prose my-8 rounded-xl border ${cfg.bg} border-l-4 ${cfg.border} p-5 md:p-6`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              {title && (
                <p className={`text-sm font-extrabold uppercase tracking-wide mb-2 ${cfg.iconColor}`}>
                  {title}
                </p>
              )}
              <div className={`text-sm leading-relaxed ${cfg.text} space-y-2`}>
                {children}
              </div>
            </div>
          </div>
        </div>
      );
    },

    // ── Headings (H1 downgraded to H2 since page already has an H1) ──
    h1({ children, ...props }) {
      return (
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F111A] mt-12 mb-5 leading-tight" {...props}>
          {children}
        </h2>
      );
    },
    h2({ children, ...props }) {
      h2Count++;
      if (h2Count > 10) {
        return (
          <h3 className="text-xl font-bold text-[#0F111A] mt-8 mb-3 scroll-mt-24" {...props}>
            {children}
          </h3>
        );
      }
      return (
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0F111A] mt-12 mb-5 leading-tight scroll-mt-24" id={children?.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")} {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3 className="text-xl font-bold text-[#0F111A] mt-8 mb-3 scroll-mt-24" {...props}>
          {children}
        </h3>
      );
    },

    // ── Paragraph + inline CTA ──
    p({ children, ...props }) {
      paragraphCount++;
      const shouldShowCTA = enableCTA && paragraphCount > 0 && paragraphCount % 12 === 0;

      return (
        <>
          <p className="text-[#5E6278] leading-relaxed mb-5 text-base md:text-lg" {...props}>
            {children}
          </p>
          {shouldShowCTA && <CTAInline />}
        </>
      );
    },

    // ── Links ──
    a({ children, href, ...props }) {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-[#D80E16] font-semibold underline decoration-[#D80E16]/30 underline-offset-2 hover:decoration-[#D80E16] transition-all"
          {...props}
        >
          {children}
          {isExternal && <ExternalLink className="inline w-3 h-3 ml-0.5 -mt-0.5" />}
        </a>
      );
    },

    // ── Lists ──
    ul({ children, ...props }) {
      return (
        <ul className="space-y-2 my-4 ml-2" {...props}>
          {children}
        </ul>
      );
    },
    ol({ children, ...props }) {
      return (
        <ol className="space-y-2 my-4 ml-2 list-decimal list-inside" {...props}>
          {children}
        </ol>
      );
    },
    li({ children, ...props }) {
      return (
        <li className="flex items-start gap-2.5 text-[#5E6278] pl-2 text-sm md:text-base leading-relaxed" {...props}>
          <Check className="w-4 h-4 mt-1 shrink-0 text-[#10b981]" />
          <span>{children}</span>
        </li>
      );
    },

    // ── Blockquote ──
    blockquote({ children, ...props }) {
      return (
        <blockquote className="my-6 pl-5 py-4 border-l-4 border-[#D80E16] bg-[#D80E16]/[0.03] rounded-r-xl text-[#0F111A] font-semibold text-sm leading-relaxed not-prose" {...props}>
          {children}
        </blockquote>
      );
    },

    // ── Tables ──
    table({ children, ...props }) {
      return (
        <div className="my-8 overflow-x-auto rounded-xl border border-black/[0.06] shadow-sm">
          <table className="w-full text-sm" {...props}>
            {children}
          </table>
        </div>
      );
    },
    thead({ children, ...props }) {
      return (
        <thead className="bg-[#F8F8F7] border-b border-black/[0.06]" {...props}>
          {children}
        </thead>
      );
    },
    th({ children, ...props }) {
      return (
        <th className="px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-[#0F111A]" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td className="px-4 py-3 border-t border-black/[0.04] text-[#5E6278]" {...props}>
          {children}
        </td>
      );
    },

    // ── Code ──
    code({ children, className, ...props }: any) {
      const isInline = !className;
      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded-md bg-[#D80E16]/[0.06] text-[#D80E16] text-sm font-mono" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={`block my-6 p-4 rounded-xl bg-[#0F111A] text-emerald-400 text-sm font-mono overflow-x-auto ${className || ""}`} {...props}>
          {children}
        </code>
      );
    },
    pre({ children, ...props }) {
      return (
        <pre className="not-prose my-6 rounded-xl bg-[#0F111A] p-4 overflow-x-auto" {...props}>
          {children}
        </pre>
      );
    },

    // ── Images ──
    img({ src, alt, ...props }) {
      return (
        <img
          src={src}
          alt={alt || ""}
          className="my-8 w-full rounded-2xl border border-black/[0.06] shadow-md"
          loading="lazy"
          {...props}
        />
      );
    },

    // ── Horizontal rule ──
    hr(props) {
      return <hr className="my-10 border-t border-black/[0.06]" {...props} />;
    },

    // ── Strong / Emphasis ──
    strong({ children, ...props }) {
      return <strong className="font-extrabold text-[#0F111A]" {...props}>{children}</strong>;
    },
    em({ children, ...props }) {
      return <em className="italic text-[#5E6278]" {...props}>{children}</em>;
    },
  };
}

// ─── Main component ───

interface MarkdownRendererProps {
  content: string;
  /** Whether to inject inline CTAs every 12 paragraphs (default: true) */
  enableCTA?: boolean;
}

export function MarkdownRenderer({ content, enableCTA = true }: MarkdownRendererProps) {
  const processed = useMemo(() => preprocessCallouts(content), [content]);
  const components = useMemo(() => createComponents(enableCTA), [enableCTA]);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={components as any}
    >
      {processed}
    </ReactMarkdown>
  );
}

export { CTAInline };
