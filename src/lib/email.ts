import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
}

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: requireEnv('SMTP_HOST'),
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user: requireEnv('SMTP_USER'), pass: requireEnv('SMTP_PASS') },
  });
  return transporter;
}

export async function sendEmail({ subject, html }: { subject: string; html: string }): Promise<void> {
  await getTransporter().sendMail({
    from: requireEnv('SMTP_FROM'),
    to: requireEnv('SMTP_TO'),
    subject,
    html,
  });
}
