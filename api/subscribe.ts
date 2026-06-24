/**
 * Vercel serverless — Unified newsletter/subscription handler
 * Endpoint: POST /api/subscribe
 * 
 * Stores email in Supabase + sends notification to help@tradexa.com.br
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || !body.email.includes("@")) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    const source = body.source || "website";
    const name = body.name || body.email.split("@")[0];

    // 1. Store in Supabase (non-blocking)
    const SUPA_URL = process.env.SUPABASE_URL || "https://ocivkbocmywinwqmaqac.supabase.co";
    const SUPA_ANON = process.env.SUPABASE_ANON_KEY || "";
    
    if (SUPA_ANON) {
      try {
        await fetch(`${SUPA_URL}/rest/v1/email_subscriptions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPA_ANON,
            "Authorization": `Bearer ${SUPA_ANON}`,
            "Prefer": "return=minimal",
          },
          body: JSON.stringify({
            email: body.email,
            name: name,
            source: source,
            subscribed_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.error("Supabase insert error:", e);
      }
    }

    // 2. Send notification to help@tradexa.com.br
    const emailBody = [
      `📬 NOVA INSCRIÇÃO NA NEWSLETTER`,
      `═══════════════════════════════`,
      ``,
      `Email: ${body.email}`,
      `Nome: ${name}`,
      `Origem: ${source}`,
      `Data: ${new Date().toLocaleString("pt-BR")}`,
    ].join("\n");

    const res = await fetch("https://www.tradexa.com.br/api/send-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: body.email, message: emailBody }),
    });

    if (!res.ok) {
      console.error("VPS notification failed:", res.status);
    }

    return Response.json({ success: true, message: "Inscrição confirmada!" });

  } catch (err: any) {
    return Response.json(
      { error: "Erro interno do servidor", detail: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ status: "ok", endpoint: "POST /api/subscribe" });
}
