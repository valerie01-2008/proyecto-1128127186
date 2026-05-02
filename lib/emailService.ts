import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY?.trim();
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@agendapro.app";

function getResendClient() {
  if (!apiKey) {
    throw new Error("Resend API key no configurada");
  }
  return new Resend(apiKey);
}

export async function sendReminderEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!apiKey) {
    return { success: false, error: "Resend API key no configurada" };
  }

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function sendTestEmail(to: string): Promise<{ success: boolean; error?: string }> {
  return sendReminderEmail({
    to,
    subject: "AgendaPro — Correo de prueba",
    html: "<p>Este es un correo de prueba enviado desde AgendaPro utilizando Resend.</p>",
  });
}
