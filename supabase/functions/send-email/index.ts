/**
 * Supabase Edge Function: send-email
 * Envia emails transacionais usando Resend API.
 * Templates premium com design TRADEXA.
 *
 * POST /api/send-email
 * Body: { to, template, subject, props }
 *
 * Inclui verificação de descadastro (unsubscribe) antes de enviar.
 */

import { Resend } from "npm:resend@4.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const FROM_EMAIL = "TRADEXA <noreply@tradexa.com.br>";
const SITE_URL = "https://www.tradexa.com.br";
const LOGO_URL = `${SITE_URL}/logo-email.png`;

const resend = new Resend(RESEND_API_KEY);

// ─── Types ───
type TemplateName =
  | "welcome"
  | "onboarding-dia1"
  | "onboarding-dia3"
  | "newsletter"
  | "newsletter-calculadora"
  | "newsletter-ncm"
  | "newsletter-importadores"
  | "newsletter-smart-rank"
  | "newsletter-rastreamento"
  | "newsletter-portos"
  | "newsletter-semanal"
  | "reengajamento"
  | "confirmacao-contato";

interface EmailRequest {
  to: string;
  template: TemplateName;
  subject?: string;
  props?: Record<string, unknown>;
}

// ─── Default subjects ───
const DEFAULT_SUBJECTS: Record<string, string> = {
  welcome: "Bem-vindo à TRADEXA — Comece a explorar dados reais",
  "onboarding-dia1": "Já classificou seu primeiro NCM?",
  "onboarding-dia3": "Encontre compradores internacionais para seus produtos",
  newsletter: "Newsletter TRADEXA — Inteligência de Comércio Exterior",
  "newsletter-calculadora": "Calcule o custo real da sua importação — TRADEXA",
  "newsletter-ncm": "Classifique seu produto com IA — TRADEXA",
  "newsletter-importadores": "Encontre importadores em 31 países — TRADEXA",
  "newsletter-smart-rank": "Descubra onde exportar — TRADEXA",
  "newsletter-rastreamento": "Rastreie suas cargas em tempo real — TRADEXA",
  "newsletter-portos": "Compare portos e rotas internacionais — TRADEXA",
  "newsletter-semanal": "Resumo semanal de comércio exterior — TRADEXA",
  reengajamento: "Sentimos sua falta — Veja o que há de novo na TRADEXA",
  "confirmacao-contato": "Recebemos sua solicitação — TRADEXA",
};

// ─── Sanitize ───
function s(v: unknown): string {
  return String(v || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Smart name extraction from email ───
function smartName(name: string | unknown, email?: string): string {
  const n = s(name);
  if (n && !n.includes("@") && n.length > 1) {
    return n.split(" ")[0];
  }
  const e = s(email);
  if (e && e.includes("@")) {
    const local = e.split("@")[0].toLowerCase();
    const cleaned = local
      .replace(/^(contato|admin|info|hello|hi|hey|ola|teste|test|user|usuario)/, "")
      .replace(/(adv|inc|ltd|corp|br|sp|rj|mg)$/g, "")
      .replace(/[0-9]+$/g, "");
    const parts = cleaned.split(/[._-]+/).filter((p) => p.length > 1);
    if (parts.length > 0) {
      const first = parts[0];
      return first.charAt(0).toUpperCase() + first.slice(1);
    }
    if (cleaned.length > 1) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  return "la";
}

function displayName(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email);
  return smartName(name || email, email);
}

// ─── Unsubscribe check ───
async function isUnsubscribed(email: string): Promise<boolean> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data } = await supabase
      .from("newsletter_unsubscribers")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();
    return !!data;
  } catch {
    return false; // If table doesn't exist yet, allow sending
  }
}

// ─── Unsubscribe URL helper ───
function unsubUrl(email: string): string {
  const encoded = encodeURIComponent(email);
  return `${SITE_URL}/unsubscribe?email=${encoded}`;
}

// ─── Shared layout ───

function wrap(bodyContent: string, emailForUnsub?: string): string {
  const unsubLink = emailForUnsub
    ? `<tr><td style="padding:0 40px 24px;text-align:center">
        <div style="font-size:10px;color:#bbb;line-height:1.6">
          <a href="${unsubUrl(emailForUnsub)}" style="color:#ccc;text-decoration:underline">Não quer mais receber? Descadastrar</a>
        </div>
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>TRADEXA</title>
</head>
<body style="margin:0;padding:0;background:#f0f0f3;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f3">
    <tr><td align="center" style="padding:32px 16px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        ${hdr()}
        ${bodyContent}
        ${ftr()}
        ${unsubLink}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function hdr(): string {
  return `<tr><td style="background:#D80E16;padding:32px 40px;text-align:center">
    <img src="${LOGO_URL}" alt="TRADEXA" width="200" style="display:block;margin:0 auto;height:auto;max-width:200px" />
  </td></tr>`;
}

function ftr(): string {
  return `<tr><td style="background:#FAFAF9;padding:28px 40px;border-top:1px solid rgba(0,0,0,0.06)">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:11px;color:#999;line-height:1.7">
          <div style="font-weight:700;color:#5E6278;margin-bottom:2px">TRADEXA Market Intelligence</div>
          Inteligência comercial para comércio exterior brasileiro.<br>
          <a href="${SITE_URL}" style="color:#D80E16;text-decoration:none">${SITE_URL}</a>
        </td>
        <td align="right" style="vertical-align:middle">
          <a href="${SITE_URL}/pricing" style="display:inline-block;background:#D80E16;color:#ffffff;font-size:11px;font-weight:700;padding:8px 18px;border-radius:6px;text-decoration:none">Ver Planos</a>
        </td>
      </tr>
    </table>
    <div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(0,0,0,0.06);font-size:10px;color:#bbb;text-align:center">
      &copy; 2026 TRADEXA. Todos os direitos reservados.
    </div>
  </td></tr>`;
}

// ─── Reusable blocks ───

function btn(text: string, url: string): string {
  return `<tr><td style="padding:28px 40px;text-align:center">
    <a href="${url}" style="display:inline-block;background:#D80E16;color:#ffffff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:8px;text-decoration:none">${text}</a>
  </td></tr>`;
}

function heading(text: string): string {
  return `<tr><td style="padding:32px 40px 0">
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#0F111A;line-height:1.4">${text}</h1>
  </td></tr>`;
}

function bodyText(html: string): string {
  return `<tr><td style="padding:16px 40px 0">
    <div style="font-size:14px;color:#5E6278;line-height:1.8">${html}</div>
  </td></tr>`;
}

function highlightBox(title: string, rowsHtml: string): string {
  return `<tr><td style="padding:20px 40px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(216,14,22,0.03);border:1px solid rgba(216,14,22,0.1);border-radius:10px">
      <tr><td style="padding:20px 24px">
        <div style="font-size:11px;font-weight:800;color:#D80E16;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px">${title}</div>
        ${rowsHtml}
      </td></tr>
    </table>
  </td></tr>`;
}

function featureRow(icon: string, title: string, desc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px">
    <tr>
      <td width="32" style="vertical-align:top;font-size:18px;line-height:1.4;padding-top:2px">${icon}</td>
      <td style="vertical-align:top">
        <div style="font-size:13px;font-weight:700;color:#0F111A;margin-bottom:2px">${title}</div>
        <div style="font-size:12px;color:#5E6278;line-height:1.5">${desc}</div>
      </td>
    </tr>
  </table>`;
}

function stepRow(num: number, title: string, desc: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px">
    <tr>
      <td width="36" style="vertical-align:top">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr><td style="width:28px;height:28px;border-radius:50%;background:#D80E16;color:#ffffff;font-size:12px;font-weight:800;text-align:center;vertical-align:middle;line-height:28px">${num}</td></tr>
        </table>
      </td>
      <td style="vertical-align:top;padding-top:3px">
        <div style="font-size:13px;font-weight:700;color:#0F111A;margin-bottom:2px">${title}</div>
        <div style="font-size:12px;color:#5E6278;line-height:1.5">${desc}</div>
      </td>
    </tr>
  </table>`;
}

function tipBox(text: string): string {
  return `<tr><td style="padding:16px 40px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-left:3px solid #D80E16;border-radius:0 8px 8px 0">
      <tr><td style="padding:14px 18px;font-size:12px;color:#5E6278;line-height:1.7">${text}</td></tr>
    </table>
  </td></tr>`;
}

function divider(): string {
  return `<tr><td style="padding:24px 40px 0"><div style="border-top:1px solid rgba(0,0,0,0.06)"></div></td></tr>`;
}

function infoRow(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid rgba(0,0,0,0.04);margin-bottom:6px">
    <tr>
      <td style="padding:6px 0;font-size:12px;color:#5E6278">${label}</td>
      <td align="right" style="padding:6px 0;font-size:12px;font-weight:600;color:#0F111A">${value}</td>
    </tr>
  </table>`;
}

function signOff(custom?: string): string {
  return `<tr><td style="padding:8px 40px 32px"><div style="font-size:13px;color:#5E6278">${custom || "Equipe TRADEXA"}</div></td></tr>`;
}

// ─── Templates ───

function tplWelcome(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading(`Ol&aacute;${name ? ", " + name : ""}!`) +
    bodyText(`Sua conta <strong style="color:#0F111A">TRADEXA</strong> foi criada com sucesso! Agora voc&ecirc; tem acesso a ferramentas de intelig&ecirc;ncia comercial que v&atilde;o transformar suas opera&ccedil;&otilde;es de com&eacute;rcio exterior.`) +
    highlightBox("Seus benef&iacute;cios incluem",
      featureRow("🔍", "Classifica&ccedil;&atilde;o NCM por IA", "Descreva seu produto em portugu&ecirc;s e receba o NCM correto automaticamente") +
      featureRow("🌍", "Tarifas de 31 pa&iacute;ses", "Simule custos de importa&ccedil;&atilde;o em qualquer mercado") +
      featureRow("📊", "Dashboard de trade intelligence", "Visualize dados de com&eacute;rcio exterior em tempo real") +
      featureRow("📦", "Rastreamento de cargas", "Acompanhe suas opera&ccedil;&otilde;es do in&iacute;cio ao fim")
    ) +
    btn("Acessar Plataforma", SITE_URL + "/login") +
    tipBox("💡 <strong>Dica:</strong> comece classificando um produto com NCM. &Eacute; r&aacute;pido e voc&ecirc; vai entender na pr&aacute;tica o poder da plataforma.") +
    divider() +
    bodyText("Se tiver qualquer d&uacute;vida, responda este email. Nossa equipe est&aacute; pronta para ajudar.") +
    signOff("Abra&ccedil;o,<br><strong style='color:#0F111A'>Equipe TRADEXA</strong>"),
    email
  );
}

function tplOnboarding1(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Classifique seu primeiro NCM") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Voc&ecirc; j&aacute; experimentou classificar um produto com nossa IA? &Eacute; o primeiro passo para descobrir tarifas e oportunidades reais.") +
    highlightBox("Como funciona",
      stepRow(1, "Descreva seu produto", "Digite a descri&ccedil;&atilde;o em portugu&ecirc;s normal") +
      stepRow(2, "A IA sugere o NCM", "Nossa intelig&ecirc;ncia artificial identifica o c&oacute;digo correto") +
      stepRow(3, "Veja impostos e tarifas", "Automaticamente calculamos os custos para 31 pa&iacute;ses")
    ) +
    btn("Classificar Agora", SITE_URL + "/login") +
    tipBox("💡 Produtos mais espec&iacute;ficos geram classifica&ccedil;&otilde;es mais precisas. Tente algo como 'cal&ccedil;a jeans masculina' em vez de 'roupa'.") +
    signOff(),
    email
  );
}

function tplOnboarding3(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Encontre compradores internacionais") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Voc&ecirc; sabia que temos dados de importadores de 31 pa&iacute;ses? Essa informa&ccedil;&atilde;o pode abrir portas para novos neg&oacute;cios.") +
    highlightBox("O que voc&ecirc; pode descobrir",
      featureRow("🌍", "Importadores por pa&iacute;s e produto", "Encontre quem est&aacute; comprando o que voc&ecirc; exporta") +
      featureRow("📈", "Volume de importa&ccedil;&atilde;o e tend&ecirc;ncias", "Saiba quanto e quando eles compram") +
      featureRow("🎯", "Filtros por NCM e HS Code", "Busque exatamente no seu segmento") +
      featureRow("🏢", "Dados detalhados da empresa", "Veja porte, categorias e faturamento de cada importador")
    ) +
    btn("Explorar Importadores", SITE_URL + "/login") +
    divider() +
    bodyText("Cada busca que voc&ecirc; faz na plataforma gera insights valiosos. Comece hoje.") +
    signOff(),
    email
  );
}

// ─── NEWSLETTER TEMPLATES ───

function tplNewsletter(p: Record<string, unknown>): string {
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Intelig&ecirc;ncia de Com&eacute;rcio Exterior") +
    bodyText("Fique por dentro das novidades do com&eacute;rcio exterior brasileiro. Dados, an&aacute;lises e oportunidades atualizados para sua opera&ccedil;&atilde;o.") +
    highlightBox("Nesta edi&ccedil;&atilde;o",
      featureRow("📊", "Dados de com&eacute;rcio exterior", "N&uacute;meros atualizados de importa&ccedil;&atilde;o e exporta&ccedil;&atilde;o brasileira") +
      featureRow("🔍", "An&aacute;lise de tend&ecirc;ncias", "Quais setores est&atilde;o crescendo e onde est&atilde;o as oportunidades") +
      featureRow("🌍", "Oportunidades em novos mercados", "Mercados emergentes que valem a pena explorar") +
      featureRow("💡", "Dicas pr&aacute;ticas", "Insights para exportadores e importadores")
    ) +
    btn("Acessar Dashboard", SITE_URL + "/login") +
    divider() +
    tipBox("📌 N&atilde;o perca nenhuma edi&ccedil;&atilde;o. Adicione <strong>newsletter@tradexa.com.br</strong> aos seus contatos para garantir o recebimento.") +
    signOff(),
    email
  );
}

function tplNewsletterCalculadora(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Calcule o custo real da sua importa&ccedil;&atilde;o") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Antes de fechar qualquer opera&ccedil;&atilde;o de importa&ccedil;&atilde;o, voc&ecirc; precisa saber o <strong>custo total real</strong>. Nossa calculadora faz isso em segundos.") +
    highlightBox("O que voc&ecirc; descobre",
      featureRow("💰", "Impostos e tarifas autom&aacute;ticas", "II, IPI, PIS, COFINS, ICMS e TAXA SISCOMEX calculados automaticamente") +
      featureRow("🚢", "Frete mar&iacute;timo", "Estimativa de frete mar&iacute;timo para seu produto e rota") +
      featureRow("📊", "Comparativo entre pa&iacute;ses", "Veja qual destino &eacute; mais vantajoso para seu produto") +
      featureRow("🔍", "Custo total landed", "Veja o custo completo da importa&ccedil;&atilde;o com todos os tributos")
    ) +
    btn("Calcular Agora", SITE_URL + "/login") +
    tipBox("💡 <strong>Cota&ccedil;&atilde;o completa com frete e seguro?</strong> Entre em contato: <strong>freight@tradexa.com.br</strong> ou pelo formul&aacute;rio de cota&ccedil;&atilde;o no site.") +
    divider() +
    tipBox("💡 <strong>Dica:</strong> tenha em m&atilde;o o NCM do produto, o valor FOB e o pa&iacute;s de origem para resultados mais precisos.") +
    signOff(),
    email
  );
}

function tplNewsletterNcm(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Classifique qualquer produto com IA") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("A classifica&ccedil;&atilde;o NCM &eacute; o primeiro passo de toda importa&ccedil;&atilde;o. Erros aqui geram multas e atrasos. Nossa IA resolve isso em segundos.") +
    highlightBox("Como funciona",
      featureRow("🤖", "IA treinada em NCMs", "Descreva o produto em portugu&ecirc;s e receba o c&oacute;digo correto") +
      featureRow("🎯", "Alta precis&atilde;o", "Modelo treinado com milh&otilde;es de classifica&ccedil;&otilde;es reais") +
      featureRow("⚡", "Instant&acirc;neo", "Resultados em menos de 3 segundos") +
      featureRow("📋", "Hist&oacute;rico de buscas", "Acesse todas as classifica&ccedil;&otilde;es anteriores")
    ) +
    btn("Classificar com IA", SITE_URL + "/login") +
    tipBox("💡 Quanto mais espec&iacute;fica a descri&ccedil;&atilde;o, melhor o resultado. Inclua material, dimens&otilde;es e uso do produto.") +
    signOff(),
    email
  );
}

function tplNewsletterImportadores(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Encontre importadores em 31 pa&iacute;ses") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Seu produto tem mercado internacional? Nossa base de <strong>3.8 milh&otilde;es de empresas</strong> pode revelar quem est&aacute; comprando o que voc&ecirc; vende.") +
    highlightBox("O que voc&ecirc; encontra",
      featureRow("🌍", "Cobertura global", "Importadores nos EUA, Europa, &Aacute;sia, Am&eacute;ricas e mais") +
      featureRow("🔍", "Filtros por HS Code", "Busque por c&oacute;digo de produto ou cap&iacute;tulo HS") +
      featureRow("🏢", "Dados da empresa", "Porte, faturamento, categorias comercializadas") +
      featureRow("📊", "Volume de importa&ccedil;&atilde;o", "Saiba quanto e com quem eles compram")
    ) +
    btn("Explorar Importadores", SITE_URL + "/login") +
    tipBox("💡 Comece filtrando por pa&iacute;s e cap&iacute;tulo HS. A IA sugere os melhores mercados para seu perfil.") +
    signOff(),
    email
  );
}

function tplNewsletterSmartRank(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Descubra onde exportar seu produto") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("N&atilde;o sabe para qual pa&iacute;s exportar? O <strong>Smart Rank</strong> analisa demanda, tarifas e concorr&ecirc;ncia para indicar os melhores destinos.") +
    highlightBox("O que o Smart Rank revela",
      featureRow("🏆", "Ranking de oportunidades", "Pa&iacute;ses ordenados por potencial de exporta&ccedil;&atilde;o do seu produto") +
      featureRow("📈", "Tend&ecirc;ncias de mercado", "Setores em crescimento e demanda por importa&ccedil;&atilde;o") +
      featureRow("📊", "An&aacute;lise competitiva", "Veja quem j&aacute; exporta para esses mercados")
    ) +
    btn("Ver Oportunidades", SITE_URL + "/login") +
    tipBox("💡 Funciona melhor quando voc&ecirc; j&aacute; tem um NCM classificado. O sistema usa o c&oacute;digo para cruzar dados.") +
    signOff(),
    email
  );
}

function tplNewsletterRastreamento(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Acompanhe navios e cargueiros ao vivo") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Saiba onde est&atilde;o os navios de carga e avi&otilde;es cargueiros <strong>em tempo real</strong>. Nosso mapa mostra posicionamento via dados AIS e ADS-B.") +
    highlightBox("Funcionalidades",
      featureRow("🚢", "Navios de carga ao vivo", "Posi&ccedil;&atilde;o, velocidade, destino e ETA de navios mercantes") +
      featureRow("✈️", "Avi&otilde;es cargueiros", "Rastreamento de voos de carga em tempo real") +
      featureRow("🗺️", "Mapa interativo", "Visualize a rota completa no mapa mundi") +
      featureRow("🔍", "Busca por nome", "Encontre navios e aeronaves espec&iacute;ficos")
    ) +
    btn("Acompanhar ao Vivo", SITE_URL + "/track-trace") +
    tipBox("💡 &Uacute;til para monitorar embarca&ccedil;&otilde;es que transportam suas cargas ou analisar movimenta&ccedil;&otilde;es portu&aacute;rias.") +
    signOff(),
    email
  );
}

function tplNewsletterPortos(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Compare portos e rotas internacionais") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Escolher o porto certo pode economizar <strong>at&eacute; 30%</strong> no frete. Nosso comparador analisa tempos, custos e infraestrutura de portos no mundo inteiro.") +
    highlightBox("O que voc&ecirc; compara",
      featureRow("⏱️", "Tempos de tr&acirc;nsito", "Comparativo de dias de navega&ccedil;&atilde;o entre rotas") +
      featureRow("💰", "Custos estimados", "Frete m&eacute;dio por container por rota") +
      featureRow("🏗️", "Infraestrutura", "Profundidade, capacidade e equipamentos do porto") +
      featureRow("📊", "Volume de com&eacute;rcio", "Dados de importa&ccedil;&atilde;o e exporta&ccedil;&atilde;o por rota")
    ) +
    btn("Comparar Portos", SITE_URL + "/login") +
    tipBox("💡 Selecione o pa&iacute;s de origem e destino. O sistema mostra as melhores op&ccedil;&otilde;es de rota automaticamente.") +
    signOff(),
    email
  );
}

function tplNewsletterSemanal(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Resumo Semanal de Com&eacute;rcio Exterior") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Separamos as principais novidades e oportunidades da semana para voc&ecirc; n&atilde;o perder nada.") +
    highlightBox("Destaques da semana",
      featureRow("📊", "Dados do com&eacute;rcio exterior", "Indicadores de importa&ccedil;&atilde;o e exporta&ccedil;&atilde;o atualizados") +
      featureRow("📰", "Not&iacute;cias regulat&oacute;rias", "Mudan&ccedil;as em tarifas, acordos comerciais e legisla&ccedil;&atilde;o") +
      featureRow("🌍", "Oportunidades de mercado", "Novos destinos e setores em crescimento") +
      featureRow("💡", "Dicas pr&aacute;ticas", "Insights para otimizar suas opera&ccedil;&otilde;es")
    ) +
    highlightBox("Ferramentas para usar agora",
      featureRow("🔍", "Classificador NCM", "Classifique seus produtos com IA") +
      featureRow("💰", "Calculadora de Importa&ccedil;&atilde;o", "Simule custos reais em segundos") +
      featureRow("🌍", "Mapa de Importadores", "Encontre novos compradores internacionais")
    ) +
    btn("Acessar Plataforma", SITE_URL + "/login") +
    divider() +
    tipBox("📌 Adicione <strong>newsletter@tradexa.com.br</strong> aos seus contatos para garantir o recebimento.") +
    signOff(),
    email
  );
}

function tplReengagement(p: Record<string, unknown>): string {
  const name = s(p.name);
  const email = s(p.email) || s(p.to);
  return wrap(
    heading("Sentimos sua falta") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Percebemos que voc&ecirc; n&atilde;o acessa a TRADEXA h&aacute; algum tempo. Nossa plataforma evoluiu bastante &mdash; venha conferir as novidades!") +
    highlightBox("O que mudou",
      featureRow("🆕", "Dashboard de trade intelligence", "Visualize dados de com&eacute;rcio exterior em gr&aacute;ficos interativos") +
      featureRow("📦", "Rastreamento de cargas", "Acompanhe suas opera&ccedil;&otilde;es em tempo real") +
      featureRow("🤖", "IA aprimorada", "Classifica&ccedil;&otilde;es NCM ainda mais precisas")
    ) +
    btn("Ver Novidades", SITE_URL + "/login") +
    tipBox("💡 Sua conta continua ativa com todos os seus dados preservados. Basta fazer login.") +
    signOff(),
    email
  );
}

function tplContato(p: Record<string, unknown>): string {
  const name = s(p.name);
  const assunto = s(p.assunto) || "Sua mensagem";
  return wrap(
    heading("Recebemos sua mensagem") +
    bodyText(`Ol&aacute;${name ? " <strong>" + name + "</strong>" : ""},`) +
    bodyText("Obrigado por entrar em contato com a TRADEXA. Recebemos sua mensagem e nossa equipe j&aacute; est&aacute; analisando.") +
    highlightBox("Detalhes da solicita&ccedil;&atilde;o",
      infoRow("Assunto", assunto) +
      infoRow("Status", "<span style='color:#D80E16'>Em an&aacute;lise</span>")
    ) +
    bodyText("Respondemos em at&eacute; 24 horas &uacute;teis. Se sua mensagem for urgente, acesse nossa plataforma para suporte priorit&aacute;rio.") +
    btn("Acessar Suporte", SITE_URL + "/login") +
    divider() +
    signOff("Abra&ccedil;o,<br><strong style='color:#0F111A'>Equipe TRADEXA</strong>")
  );
}

// ─── Template registry ───
const TEMPLATES: Record<string, (p: Record<string, unknown>) => string> = {
  welcome: tplWelcome,
  "onboarding-dia1": tplOnboarding1,
  "onboarding-dia3": tplOnboarding3,
  newsletter: tplNewsletter,
  "newsletter-calculadora": tplNewsletterCalculadora,
  "newsletter-ncm": tplNewsletterNcm,
  "newsletter-importadores": tplNewsletterImportadores,
  "newsletter-smart-rank": tplNewsletterSmartRank,
  "newsletter-rastreamento": tplNewsletterRastreamento,
  "newsletter-portos": tplNewsletterPortos,
  "newsletter-semanal": tplNewsletterSemanal,
  reengajamento: tplReengagement,
  "confirmacao-contato": tplContato,
};

// ─── Handler ───
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const body: EmailRequest = await req.json();
    const { to, template, subject, props } = body;

    if (!to || !template) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, template" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // ── Check unsubscribe list (skip for transactional emails) ──
    const transactional = ["welcome", "confirmacao-contato"];
    if (!transactional.includes(template)) {
      const unsubscribed = await isUnsubscribed(to);
      if (unsubscribed) {
        return new Response(JSON.stringify({ success: true, skipped: "unsubscribed" }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    }

    const renderFn = TEMPLATES[template];
    if (!renderFn) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template}` }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const allProps = { ...props, to };
    const html = renderFn(allProps);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: subject ?? DEFAULT_SUBJECTS[template] ?? "TRADEXA",
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
