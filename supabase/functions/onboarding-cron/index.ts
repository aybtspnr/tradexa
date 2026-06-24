/**
 * Supabase Edge Function: onboarding-cron
 * Executado diariamente via pg_cron ou chamada externa.
 *
 * Verifica usuários recentes e envia emails de onboarding automáticos:
 * - Dia 1: onboarding-dia1 (classificar NCM)
 * - Dia 3: onboarding-dia3 (encontrar compradores)
 * - 30 dias sem login: reengajamento
 *
 * POST /onboarding-cron
 * Header: Authorization: Bearer <SERVICE_KEY>
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM_EMAIL = "TRADEXA <noreply@tradexa.com.br>";
const SITE_URL = "https://www.tradexa.com.br";
const LOGO_URL = `${SITE_URL}/logo-email.png`;

const resend = new Resend(RESEND_API_KEY);

// ─── Shared email helpers (same as send-email) ───
function s(v: unknown): string {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function smartName(name: string | unknown, email?: string): string {
  const n = s(name);
  if (n && !n.includes("@") && n.length > 1) return n.split(" ")[0];
  const e = s(email);
  if (e && e.includes("@")) {
    const local = e.split("@")[0].toLowerCase();
    const cleaned = local
      .replace(/^(contato|admin|info|hello|hi|hey|ola|teste|test|user|usuario)/, "")
      .replace(/(adv|inc|ltd|corp|br|sp|rj|mg)$/g, "")
      .replace(/[0-9]+$/g, "");
    const parts = cleaned.split(/[._-]+/).filter((p) => p.length > 1);
    if (parts.length > 0) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    if (cleaned.length > 1) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return "la";
}

function unsubUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
}

// ─── Email layout (simplified) ───
function wrap(bodyContent: string, emailForUnsub: string): string {
  const unsubLink = `<tr><td style="padding:0 40px 24px;text-align:center">
    <div style="font-size:10px;color:#bbb;line-height:1.6">
      <a href="${unsubUrl(emailForUnsub)}" style="color:#ccc;text-decoration:underline">Não quer mais receber? Descadastrar</a>
    </div>
  </td></tr>`;

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f3">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <tr><td style="background:#D80E16;padding:32px 40px;text-align:center">
          <img src="${LOGO_URL}" alt="TRADEXA" width="200" style="display:block;margin:0 auto;height:auto;max-width:200px" />
        </td></tr>
        ${bodyContent}
        <tr><td style="background:#FAFAF9;padding:28px 40px;border-top:1px solid rgba(0,0,0,0.06)">
          <div style="font-size:11px;color:#999;line-height:1.7">
            <div style="font-weight:700;color:#5E6278;margin-bottom:2px">TRADEXA Market Intelligence</div>
            <a href="${SITE_URL}" style="color:#D80E16;text-decoration:none">${SITE_URL}</a>
          </div>
          <div style="margin-top:14px;padding-top:14px;border-top:1px solid rgba(0,0,0,0.06);font-size:10px;color:#bbb;text-align:center">&copy; 2026 TRADEXA</div>
        </td></tr>
        ${unsubLink}
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function btn(text: string, url: string): string {
  return `<tr><td style="padding:28px 40px;text-align:center">
    <a href="${url}" style="display:inline-block;background:#D80E16;color:#fff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">${text}</a>
  </td></tr>`;
}

function heading(text: string): string {
  return `<tr><td style="padding:32px 40px 0"><h1 style="margin:0;font-size:20px;font-weight:800;color:#0F111A;line-height:1.4">${text}</h1></td></tr>`;
}

function bodyText(html: string): string {
  return `<tr><td style="padding:16px 40px 0"><div style="font-size:14px;color:#5E6278;line-height:1.8">${html}</div></td></tr>`;
}

function featureRow(icon: string, title: string, desc: string): string {
  return `<table role="presentation" width="100%" style="margin-bottom:8px"><tr>
    <td width="32" style="vertical-align:top;font-size:18px;line-height:1.4;padding-top:2px">${icon}</td>
    <td style="vertical-align:top"><div style="font-size:13px;font-weight:700;color:#0F111A;margin-bottom:2px">${title}</div><div style="font-size:12px;color:#5E6278;line-height:1.5">${desc}</div></td>
  </tr></table>`;
}

function highlightBox(title: string, rowsHtml: string): string {
  return `<tr><td style="padding:20px 40px 0"><table role="presentation" width="100%" style="background:rgba(216,14,22,0.03);border:1px solid rgba(216,14,22,0.1);border-radius:10px"><tr><td style="padding:20px 24px">
    <div style="font-size:11px;font-weight:800;color:#D80E16;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">${title}</div>
    ${rowsHtml}
  </td></tr></table></td></tr>`;
}

function stepRow(num: number, title: string, desc: string): string {
  return `<table role="presentation" width="100%" style="margin-bottom:10px"><tr>
    <td width="36" style="vertical-align:top"><table cellpadding="0" cellspacing="0"><tr><td style="width:28px;height:28px;border-radius:50%;background:#D80E16;color:#fff;font-size:12px;font-weight:800;text-align:center;line-height:28px">${num}</td></tr></table></td>
    <td style="vertical-align:top;padding-top:3px"><div style="font-size:13px;font-weight:700;color:#0F111A;margin-bottom:2px">${title}</div><div style="font-size:12px;color:#5E6278;line-height:1.5">${desc}</div></td>
  </tr></table>`;
}

function tipBox(text: string): string {
  return `<tr><td style="padding:16px 40px 0"><table role="presentation" width="100%" style="background:#f8f9fa;border-left:3px solid #D80E16;border-radius:0 8px 8px 0"><tr><td style="padding:14px 18px;font-size:12px;color:#5E6278;line-height:1.7">${text}</td></tr></table></td></tr>`;
}

function divider(): string {
  return `<tr><td style="padding:24px 40px 0"><div style="border-top:1px solid rgba(0,0,0,0.06)"></div></td></tr>`;
}

// ─── Onboarding email HTML ───
function htmlOnboarding1(name: string, email: string): string {
  return wrap(
    heading("Classifique seu primeiro NCM") +
    bodyText(`Olá${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Você já experimentou classificar um produto com nossa IA? É o primeiro passo para descobrir tarifas e oportunidades reais.") +
    highlightBox("Como funciona",
      stepRow(1, "Descreva seu produto", "Digite a descrição em português normal") +
      stepRow(2, "A IA sugere o NCM", "Nossa inteligência artificial identifica o código correto") +
      stepRow(3, "Veja impostos e tarifas", "Automaticamente calculamos os custos para 31 países")
    ) +
    btn("Classificar Agora", SITE_URL + "/login") +
    tipBox("💡 Produtos mais específicos geram classificações mais precisas. Tente algo como 'calça jeans masculina' em vez de 'roupa'.") +
    `<tr><td style="padding:8px 40px 32px"><div style="font-size:13px;color:#5E6278">Equipe TRADEXA</div></td></tr>`,
    email
  );
}

function htmlOnboarding3(name: string, email: string): string {
  return wrap(
    heading("Encontre compradores internacionais") +
    bodyText(`Olá${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Você sabia que temos dados de importadores de 31 países? Essa informação pode abrir portas para novos negócios.") +
    highlightBox("O que você pode descobrir",
      featureRow("🌍", "Importadores por país e produto", "Encontre quem está comprando o que você exporta") +
      featureRow("📈", "Volume de importação e tendências", "Saiba quanto e quando eles compram") +
      featureRow("🎯", "Filtros por NCM e HS Code", "Busque exatamente no seu segmento") +
      featureRow("🏢", "Dados detalhados da empresa", "Veja porte, categorias e faturamento de cada importador")
    ) +
    btn("Explorar Importadores", SITE_URL + "/login") +
    divider() +
    bodyText("Cada busca que você faz na plataforma gera insights valiosos. Comece hoje.") +
    `<tr><td style="padding:8px 40px 32px"><div style="font-size:13px;color:#5E6278">Equipe TRADEXA</div></td></tr>`,
    email
  );
}

function htmlReengagement(name: string, email: string): string {
  return wrap(
    heading("Sentimos sua falta") +
    bodyText(`Olá${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Percebemos que você não acessa a TRADEXA há algum tempo. Nossa plataforma evoluiu bastante — venha conferir as novidades!") +
    highlightBox("O que mudou",
      featureRow("🆕", "Dashboard de trade intelligence", "Visualize dados de comércio exterior em gráficos interativos") +
      featureRow("📦", "Rastreamento de cargas", "Acompanhe suas operações em tempo real") +
      featureRow("🤖", "IA aprimorada", "Classificações NCM ainda mais precisas")
    ) +
    btn("Ver Novidades", SITE_URL + "/login") +
    tipBox("💡 Sua conta continua ativa com todos os seus dados preservados. Basta fazer login.") +
    `<tr><td style="padding:8px 40px 32px"><div style="font-size:13px;color:#5E6278">Equipe TRADEXA</div></td></tr>`,
    email
  );
}

// ─── Main handler ───
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  // Verify authorization
  const auth = req.headers.get("Authorization");
  if (!auth || auth !== `Bearer ${SUPABASE_SERVICE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const results = { onboarding_dia1: 0, onboarding_dia3: 0, reengajamento: 0, errors: 0 };

  try {
    const now = new Date();

    // ── 1. Onboarding Dia 1: signed up 1 day ago ──
    const oneDayAgo = new Date(now.getTime() - 25 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 49 * 60 * 60 * 1000);

    const { data: dia1Users } = await supabase.auth.admin.listUsers();
    if (dia1Users?.users) {
      for (const user of dia1Users.users) {
        const created = new Date(user.created_at);
        const daysSinceCreation = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);

        // Dia 1: between 0.9 and 1.1 days
        if (daysSinceCreation >= 0.9 && daysSinceCreation <= 1.1) {
          const email = user.email;
          if (!email) continue;

          // Check if already sent
          const { data: existing } = await supabase
            .from("onboarding_log")
            .select("id")
            .eq("user_id", user.id)
            .eq("template", "onboarding-dia1")
            .single();

          if (existing) continue;

          const name = smartName(user.user_metadata?.full_name || user.user_metadata?.name || "", email);

          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: [email],
              subject: "Já classificou seu primeiro NCM?",
              html: htmlOnboarding1(name, email),
            });

            await supabase.from("onboarding_log").insert({
              user_id: user.id,
              email,
              template: "onboarding-dia1",
              sent_at: now.toISOString(),
            });

            results.onboarding_dia1++;
          } catch (e) {
            console.error(`Failed to send onboarding-dia1 to ${email}:`, e);
            results.errors++;
          }
        }

        // Dia 3: between 2.9 and 3.1 days
        if (daysSinceCreation >= 2.9 && daysSinceCreation <= 3.1) {
          const email = user.email;
          if (!email) continue;

          const { data: existing } = await supabase
            .from("onboarding_log")
            .select("id")
            .eq("user_id", user.id)
            .eq("template", "onboarding-dia3")
            .single();

          if (existing) continue;

          const name = smartName(user.user_metadata?.full_name || user.user_metadata?.name || "", email);

          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: [email],
              subject: "Encontre compradores internacionais para seus produtos",
              html: htmlOnboarding3(name, email),
            });

            await supabase.from("onboarding_log").insert({
              user_id: user.id,
              email,
              template: "onboarding-dia3",
              sent_at: now.toISOString(),
            });

            results.onboarding_dia3++;
          } catch (e) {
            console.error(`Failed to send onboarding-dia3 to ${email}:`, e);
            results.errors++;
          }
        }

        // Reengagement: 30+ days since creation, check last sign-in
        if (daysSinceCreation >= 29 && daysSinceCreation <= 31) {
          const email = user.email;
          if (!email) continue;

          // Only send if user hasn't been active recently
          const lastSignIn = user.last_sign_in_at ? new Date(user.last_sign_in_at) : null;
          if (lastSignIn && (now.getTime() - lastSignIn.getTime()) < 7 * 24 * 60 * 60 * 1000) {
            continue; // User was active in last 7 days, skip
          }

          const { data: existing } = await supabase
            .from("onboarding_log")
            .select("id")
            .eq("user_id", user.id)
            .eq("template", "reengajamento")
            .single();

          if (existing) continue;

          const name = smartName(user.user_metadata?.full_name || user.user_metadata?.name || "", email);

          try {
            await resend.emails.send({
              from: FROM_EMAIL,
              to: [email],
              subject: "Sentimos sua falta — Veja o que há de novo na TRADEXA",
              html: htmlReengagement(name, email),
            });

            await supabase.from("onboarding_log").insert({
              user_id: user.id,
              email,
              template: "reengajamento",
              sent_at: now.toISOString(),
            });

            results.reengajamento++;
          } catch (e) {
            console.error(`Failed to send reengagement to ${email}:`, e);
            results.errors++;
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Onboarding cron error:", err);
    return new Response(JSON.stringify({ error: "Internal error", ...results }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
