import nodemailer from 'nodemailer';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: true,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  });
  return transporter;
}

export async function sendEmail({ subject, html }: { subject: string; html: string }): Promise<void> {
  if (!process.env.SMTP_FROM || !process.env.SMTP_TO) {
    throw new Error('SMTP_FROM and SMTP_TO must be set');
  }
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    subject,
    html,
  });
}
