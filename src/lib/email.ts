import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

let transporter: nodemailer.Transporter | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
}

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const options: SMTPTransport.Options & { family?: number } = {
    host: requireEnv('SMTP_HOST'),
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE !== 'false' : port === 465,
    family: Number(process.env.SMTP_FAMILY ?? 4),
    auth: { user: requireEnv('SMTP_USER'), pass: requireEnv('SMTP_PASS') },
  };
  transporter = nodemailer.createTransport(options);
  return transporter;
}

async function sendResendEmail({ subject, html }: { subject: string; html: string }): Promise<void> {
  const to = requireEnv('RESEND_TO')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);
  if (to.length === 0) throw new Error('RESEND_TO must contain at least one email');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${requireEnv('RESEND_API_KEY')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: requireEnv('RESEND_FROM'),
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = typeof data === 'object' && data && 'message' in data
      ? String((data as { message?: unknown }).message)
      : res.statusText;
    throw new Error(`Resend API error: ${message}`);
  }
}

export async function sendEmail({ subject, html }: { subject: string; html: string }): Promise<void> {
  if (optionalEnv('RESEND_API_KEY')) {
    await sendResendEmail({ subject, html });
    return;
  }

  await getTransporter().sendMail({
    from: requireEnv('SMTP_FROM'),
    to: requireEnv('SMTP_TO'),
    subject,
    html,
  });
}
