/**
 * Vercel serverless — Send freight quote request
 * Endpoint: POST /api/send-quote
 * Forwards to VPS contact endpoint → freight@tradexa.com.br
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email) {
      return Response.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
    }

    // Build formatted message
    const message = [
      `📦 SOLICITAÇÃO DE COTAÇÃO DE FRETE MARÍTIMO`,
      `═══════════════════════════════════════`,
      ``,
      `👤 SOLICITANTE`,
      `Nome: ${body.name}`,
      `Email: ${body.email}`,
      `Telefone: ${body.phone || "—"}`,
      ``,
      `🚢 DETALHES DA CARGA`,
      `Origem: ${body.origin || "—"}`,
      `Destino: ${body.destination || "—"}`,
      `Container: ${body.containerType || "—"}`,
      `Tipo de Carga: ${body.cargoType || "—"}`,
      `Valor: ${body.cargoValue || "—"}`,
      `NCM/HS: ${body.ncmHs || "—"}`,
      ``,
      `💰 PREÇO REFERÊNCIA`,
      `${body.referencePrice || "—"}`,
      ``,
      `🚚 TRANSPORTADORA`,
      `${body.carrier || "—"} — ${body.transitDays || "—"}`,
      ``,
      `📝 OBSERVAÇÕES`,
      `${body.notes || "Nenhuma"}`,
    ].join("\n");

    // Forward to VPS contact endpoint (via rewrite)
    const res = await fetch("https://www.tradexa.com.br/api/send-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        message: message,
      }),
    });

    if (res.ok) {
      return Response.json({ success: true, message: "Cotação enviada com sucesso!" });
    }

    return Response.json(
      { error: "Falha ao enviar cotação. Tente novamente." },
      { status: 502 }
    );

  } catch (err: any) {
    return Response.json(
      { error: "Erro interno do servidor", detail: err.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ status: "ok", endpoint: "POST /api/send-quote" });
}
