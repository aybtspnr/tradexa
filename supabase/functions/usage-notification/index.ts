// Usage Limit Notification — Edge Function
// Triggered by database trigger when user_usage.used_percent hits 80% or 100%.
// Sends email alert to the user.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const EMAIL_FROM = Deno.env.get("WELCOME_EMAIL_FROM") || "TRADEXA <noreply@tradexa.com.br>";

interface NotifyPayload {
  user_id: string;
  email: string;
  used_percent: number;
  plan_type: string;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body: NotifyPayload = await req.json();

    if (!body.email || !body.used_percent) {
      return new Response(JSON.stringify({ skipped: true, reason: "missing_data" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    const { email, used_percent, plan_type } = body;
    const isAtLimit = used_percent >= 100;

    if (!RESEND_API_KEY) {
      console.log(`[usage-notification] No RESEND_API_KEY. Would notify ${email} at ${used_percent}%`);
      return new Response(JSON.stringify({ skipped: true, reason: "no_email_provider" }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
    }

    const subject = isAtLimit
      ? "⚠️ Limite de uso atingido — TRADEXA"
      : "⚡ Você está próximo do limite — TRADEXA";

    const html = isAtLimit
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #D80E16;">⚠️ Limite de uso atingido</h2>
          <p style="font-size: 16px; color: #1e293b;">Você atingiu <strong>100%</strong> do seu plano <strong>${plan_type}</strong> este mês.</p>
          <p style="font-size: 15px; color: #334155;">Para continuar usando a plataforma, faça upgrade para um plano superior:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://tradexa.com.br/#/plans"
               style="display: inline-block; background: #D80E16; color: white; padding: 14px 32px;
                      border-radius: 12px; text-decoration: none; font-weight: bold;">
              Ver planos disponíveis →
            </a>
          </div>
        </div>`
      : `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #f59e0b;">⚡ Quase no limite</h2>
          <p style="font-size: 16px; color: #1e293b;">Você já usou <strong>${used_percent}%</strong> do seu plano <strong>${plan_type}</strong>.</p>
          <p style="font-size: 15px; color: #334155;">Considere fazer upgrade para não interromper suas análises:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="https://tradexa.com.br/#/plans"
               style="display: inline-block; background: #D80E16; color: white; padding: 14px 32px;
                      border-radius: 12px; text-decoration: none; font-weight: bold;">
              Ver planos disponíveis →
            </a>
          </div>
        </div>`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: email, subject, html }),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("[usage-notification] Resend error:", result);
      return new Response(JSON.stringify({ error: "email_send_failed" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[usage-notification] Sent to ${email}: ${used_percent}%`);
    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[usage-notification] Error:", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
