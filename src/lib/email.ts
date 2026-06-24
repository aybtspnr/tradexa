/**
 * Email client — envia emails transacionais via Supabase Edge Function
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ocivkbocmywinwqmaqac.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

type EmailTemplate =
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

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  subject?: string;
  props?: Record<string, unknown>;
}

/**
 * Envia um email transacional via Supabase Edge Function
 */
export async function sendEmail({ to, template, subject, props }: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ to, template, subject, props }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { success: false, error: err.error || `HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/**
 * Envia email de boas-vindas para novo usuário
 */
export function sendWelcomeEmail(email: string, nome?: string) {
  return sendEmail({ to: email, template: "welcome", props: { name: nome } });
}

/**
 * Envia confirmação de formulário de contato
 */
export function sendContactConfirmation(email: string, nome?: string, assunto?: string) {
  return sendEmail({ to: email, template: "confirmacao-contato", props: { name: nome, assunto } });
}

/**
 * Envia newsletter variada divulgando um serviço específico
 */
export function sendServiceNewsletter(email: string, service: "calculadora" | "ncm" | "importadores" | "smart-rank" | "rastreamento" | "portos", nome?: string) {
  return sendEmail({
    to: email,
    template: `newsletter-${service}` as EmailTemplate,
    props: { name: nome },
  });
}

/**
 * Envia newsletter semanal (resumo)
 */
export function sendWeeklyNewsletter(email: string, nome?: string) {
  return sendEmail({ to: email, template: "newsletter-semanal", props: { name: nome } });
}
