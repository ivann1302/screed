import { leadPayloadSchema, type LeadPayload } from '@/lib/schemas';
import { sendTelegramMessage } from '@/lib/tg';
import { sendEmail } from '@/lib/email';
import { sendVkMessage } from '@/lib/vk';
import { formatLeadText, maskPhone } from '@/lib/format';

const RATE_WINDOW_MS = 10_000;
const lastByIp = new Map<string, number>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const last = lastByIp.get(ip) ?? 0;
  if (now - last < RATE_WINDOW_MS) return true;
  lastByIp.set(ip, now);
  // best-effort cleanup
  if (lastByIp.size > 1000) {
    for (const [k, v] of lastByIp) if (now - v > RATE_WINDOW_MS) lastByIp.delete(k);
  }
  return false;
}

function getIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  return xf ? xf.split(',')[0].trim() : 'unknown';
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!));
}

function leadHtml(p: LeadPayload, text: string): string {
  const tel = `<a href="tel:${escapeHtml(p.contact.phone)}">${escapeHtml(p.contact.phone)}</a>`;
  return `<pre style="font-family:ui-monospace,monospace;font-size:14px;line-height:1.5">${escapeHtml(text).replace(escapeHtml(p.contact.phone), tel)}</pre>`;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'bad_json' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }

  const parsed = leadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'invalid_payload', issues: parsed.error.issues }), {
      status: 400, headers: { 'content-type': 'application/json' },
    });
  }
  const payload = parsed.data;

  // Honeypot — выглядит как 200 OK, но без отправки.
  if (payload._hp && payload._hp.length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  const ip = getIp(req);
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429, headers: { 'content-type': 'application/json' } });
  }

  const text = formatLeadText(payload);
  const subject = `Лид · ${payload.type} · ${payload.contact.phone}`;
  const html = leadHtml(payload, text);

  const results = await Promise.allSettled([
    sendTelegramMessage(text),
    sendEmail({ subject, html }),
    sendVkMessage(text),
  ]);

  const channels = ['tg', 'email', 'vk'] as const;
  const delivered = results.flatMap((r, i) => (r.status === 'fulfilled' ? [channels[i]] : []));
  const failed = results.flatMap((r, i) => (r.status === 'rejected' ? [{ ch: channels[i], err: String((r.reason as any)?.message ?? r.reason) }] : []));

  console.log(`[lead] type=${payload.type} phone=${maskPhone(payload.contact.phone)} delivered=${delivered.join(',')} failed=${failed.map(f => f.ch).join(',') || '—'}`);

  if (delivered.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'all_channels_failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
  return new Response(JSON.stringify({ ok: true, delivered }), { status: 200, headers: { 'content-type': 'application/json' } });
}
