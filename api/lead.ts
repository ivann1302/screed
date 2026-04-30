import { leadPayloadSchema, type LeadPayload } from '@/lib/schemas';
import { sendTelegramMessage } from '@/lib/tg';
import { sendEmail } from '@/lib/email';
import { sendVkMessage } from '@/lib/vk';
import { formatLeadText, maskPhone } from '@/lib/format';

const RATE_WINDOW_MS = 10_000;
const lastByIp = new Map<string, number>();

type JsonResponseBody = { ok?: boolean; error?: string; issues?: unknown; delivered?: string[] };
type ApiResult = { body: JsonResponseBody; status: number };
type VercelLikeRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
  on?: (event: 'data' | 'end' | 'error', cb: (...args: any[]) => void) => void;
};
type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  json: (body: JsonResponseBody) => void;
};

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

function getHeader(req: Request | VercelLikeRequest, name: string): string | undefined {
  if (req instanceof Request) return req.headers.get(name) ?? undefined;
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function getIp(req: Request | VercelLikeRequest): string {
  const xf = getHeader(req, 'x-forwarded-for');
  return xf ? xf.split(',')[0].trim() : 'unknown';
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]!));
}

function leadHtml(p: LeadPayload, text: string): string {
  const tel = `<a href="tel:${escapeHtml(p.contact.phone)}">${escapeHtml(p.contact.phone)}</a>`;
  return `<pre style="font-family:ui-monospace,monospace;font-size:14px;line-height:1.5">${escapeHtml(text).replace(escapeHtml(p.contact.phone), tel)}</pre>`;
}

async function readNodeJson(req: VercelLikeRequest): Promise<unknown> {
  if (typeof req.body === 'string') return JSON.parse(req.body);
  if (req.body instanceof Uint8Array) return JSON.parse(Buffer.from(req.body).toString('utf8'));
  if (req.body && typeof req.body === 'object') return req.body;
  if (!req.on) throw new Error('missing_body');

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    req.on?.('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on?.('end', () => resolve());
    req.on?.('error', reject);
  });
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function handleLead(req: Request | VercelLikeRequest): Promise<ApiResult> {
  if (req.method !== 'POST') {
    return { body: { error: 'method_not_allowed' }, status: 405 };
  }

  let body: unknown;
  try {
    body = req instanceof Request ? await req.json() : await readNodeJson(req);
  } catch {
    return { body: { error: 'bad_json' }, status: 400 };
  }

  const parsed = leadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return { body: { error: 'invalid_payload', issues: parsed.error.issues }, status: 400 };
  }
  const payload = parsed.data;

  // Honeypot — выглядит как 200 OK, но без отправки.
  if (payload._hp && payload._hp.length > 0) {
    return { body: { ok: true }, status: 200 };
  }

  const ip = getIp(req);
  if (rateLimited(ip)) {
    return { body: { error: 'rate_limited' }, status: 429 };
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
    return { body: { ok: false, error: 'all_channels_failed' }, status: 502 };
  }
  return { body: { ok: true, delivered }, status: 200 };
}

export default async function handler(req: Request): Promise<Response>;
export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse): Promise<void>;
export default async function handler(
  req: Request | VercelLikeRequest,
  res?: VercelLikeResponse,
): Promise<Response | void> {
  const result = await handleLead(req);
  if (res) {
    res.status(result.status).json(result.body);
    return;
  }
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'content-type': 'application/json' },
  });
}
