// Welcome Email — Edge Function
// Triggered by Supabase Auth Hook on user signup.
// Sends a welcome email explaining the Essential plan limits and upgrade path.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const EMAIL_FROM = Deno.env.get("WELCOME_EMAIL_FROM") || "TRADEXA <noreply@tradexa.com.br>";

interface AuthEvent {
  type: "signup" | "login" | "delete";
  user: {
    id: string;
    email: string;
    user_metadata?: { name?: string; full_name?: string };
  };
}

serve(async (req: Request) => {
  // Only accept POST from Supabase Auth
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: AuthEvent = await req.json();

    // Only handle signup events
    if (body.type !== "signup" || !body.user?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: "not_signup" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, user_metadata } = body.user;
    const name = user_metadata?.name || user_metadata?.full_name || "Usuário";

    // If RESEND_API_KEY is not configured, log and skip
    if (!RESEND_API_KEY) {
      console.log(`[welcome-email] No RESEND_API_KEY configured. Would send to: ${email}`);
      return new Response(JSON.stringify({ skipped: true, reason: "no_email_provider" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #D80E16; font-size: 28px; margin: 0;">🚀 Bem-vindo à TRADEXA!</h1>
        </div>

        <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
          Olá <strong>${name}</strong>, sua conta foi criada com sucesso!
        </p>

        <p style="font-size: 16px; color: #1e293b; line-height: 1.6;">
          Você está no plano <strong>Essential (grátis)</strong>, que inclui:
        </p>

        <ul style="font-size: 15px; color: #334155; line-height: 1.8;">
          <li>✅ 2 consultas IA NCM por mês</li>
          <li>✅ Classificação inteligente de produtos</li>
          <li>✅ Acesso ao dashboard</li>
        </ul>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="font-size: 14px; color: #92400e; margin: 0;">
            💡 <strong>Dica:</strong> precise de mais consultas? Faça upgrade para o plano Growth (R$ 497/mês) e tenha acesso ilimitado.
          </p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://tradexa.com.br/#/ai-search"
             style="display: inline-block; background: #D80E16; color: white; padding: 14px 32px;
                    border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Fazer minha 1ª consulta →
          </a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px;">
          TRADEXA Market Intelligence — Comércio Exterior Descomplicado
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: email,
        subject: "🚀 Bem-vindo à TRADEXA — Sua conta Essential está pronta!",
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("[welcome-email] Resend error:", result);
      return new Response(JSON.stringify({ error: "email_send_failed", details: result }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[welcome-email] Sent to ${email}:`, result.id);
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[welcome-email] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
