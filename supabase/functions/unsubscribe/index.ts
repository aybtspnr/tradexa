/**
 * Supabase Edge Function: unsubscribe
 * Processa descadastro de newsletter.
 *
 * GET  /unsubscribe?email=xxx  → Página HTML de confirmação
 * POST /unsubscribe            → Registra descadastro via API
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SITE_URL = "https://www.tradexa.com.br";

function confirmationPage(email: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Descadastro — TRADEXA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #f0f0f3; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #fff; border-radius: 16px; max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 28px; }
    h1 { font-size: 22px; font-weight: 800; color: #0F111A; margin-bottom: 8px; }
    p { font-size: 14px; color: #5E6278; line-height: 1.7; margin-bottom: 20px; }
    .email { font-weight: 700; color: #0F111A; }
    .btn { display: inline-block; background: #D80E16; color: #fff; font-size: 14px; font-weight: 700; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 12px; }
    .btn:hover { background: #b80c12; }
    .footer { font-size: 11px; color: #bbb; margin-top: 24px; }
    .footer a { color: #D80E16; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Descadastro confirmado</h1>
    <p>O e-mail <span class="email">${email}</span> foi removido da nossa lista de newsletter. Você não receberá mais e-mails de marketing da TRADEXA.</p>
    <p>Transacionais (confirmação de cadastro, alterações de plano) continuarão sendo enviados conforme necessário.</p>
    <a href="${SITE_URL}" class="btn">Voltar ao site</a>
    <div class="footer">
      <p>Se mudar de ideia, é só se inscrever novamente em <a href="${SITE_URL}">tradexa.com.br</a></p>
      <p style="margin-top:8px">&copy; 2026 TRADEXA</p>
    </div>
  </div>
</body>
</html>`;
}

function errorPage(msg: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Erro — TRADEXA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background: #f0f0f3; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: #fff; border-radius: 16px; max-width: 480px; width: 100%; padding: 48px 40px; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    h1 { font-size: 22px; font-weight: 800; color: #0F111A; margin-bottom: 8px; }
    p { font-size: 14px; color: #5E6278; line-height: 1.7; }
    .btn { display: inline-block; background: #D80E16; color: #fff; font-size: 14px; font-weight: 700; padding: 12px 32px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Algo deu errado</h1>
    <p>${msg}</p>
    <a href="${SITE_URL}" class="btn">Voltar ao site</a>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);

  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // ── GET: Show confirmation page ──
  if (req.method === "GET") {
    const email = url.searchParams.get("email");
    if (!email || !email.includes("@")) {
      return new Response(errorPage("E-mail inválido."), {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const normalized = email.toLowerCase().trim();

    // Upsert into unsubscribers
    const { error } = await supabase
      .from("newsletter_unsubscribers")
      .upsert({ email: normalized, unsubscribed_at: new Date().toISOString() }, { onConflict: "email" });

    if (error) {
      console.error("Unsubscribe DB error:", error);
      return new Response(errorPage("Erro ao processar descadastro. Tente novamente."), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response(confirmationPage(normalized), {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // ── POST: API descadastro ──
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const email = body.email;
      if (!email || !email.includes("@")) {
        return new Response(JSON.stringify({ error: "E-mail inválido" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const normalized = email.toLowerCase().trim();

      const { error } = await supabase
        .from("newsletter_unsubscribers")
        .upsert({ email: normalized, unsubscribed_at: new Date().toISOString() }, { onConflict: "email" });

      if (error) {
        console.error("Unsubscribe DB error:", error);
        return new Response(JSON.stringify({ error: "Erro ao processar descadastro" }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
