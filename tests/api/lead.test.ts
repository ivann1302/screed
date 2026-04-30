// tests/api/lead.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendTelegramMessage, sendEmail, sendVkMessage } = vi.hoisted(() => ({
  sendTelegramMessage: vi.fn(),
  sendEmail: vi.fn(),
  sendVkMessage: vi.fn(),
}));

vi.mock('@/lib/tg', () => ({ sendTelegramMessage }));
vi.mock('@/lib/email', () => ({ sendEmail }));
vi.mock('@/lib/vk', () => ({ sendVkMessage }));

import handler from '../../api/lead';

function makeReq(body: any, method = 'POST', ip = '1.2.3.4') {
  const init: RequestInit = {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
  };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return new Request('http://localhost/api/lead', init);
}

const okContact = { phone: '+79991234567', channel: 'whatsapp' as const };
const validForm = { type: 'form' as const, contact: okContact };

describe('POST /api/lead', () => {
  beforeEach(() => {
    sendTelegramMessage.mockReset().mockResolvedValue(undefined);
    sendEmail.mockReset().mockResolvedValue(undefined);
    sendVkMessage.mockReset().mockResolvedValue(undefined);
  });

  it('rejects non-POST', async () => {
    const res = await handler(makeReq(validForm, 'GET'));
    expect(res.status).toBe(405);
  });

  it('rejects bad JSON', async () => {
    const res = await handler(makeReq('{ broken', 'POST'));
    expect(res.status).toBe(400);
  });

  it('rejects invalid payload', async () => {
    const res = await handler(makeReq({ type: 'unknown' }));
    expect(res.status).toBe(400);
  });

  it('fans out to all 3 channels on valid payload', async () => {
    const res = await handler(makeReq(validForm, 'POST', '5.5.5.5'));
    expect(res.status).toBe(200);
    expect(sendTelegramMessage).toHaveBeenCalledOnce();
    expect(sendEmail).toHaveBeenCalledOnce();
    expect(sendVkMessage).toHaveBeenCalledOnce();
  });

  it('supports Vercel node req/res shape', async () => {
    const res = {
      status: vi.fn(function status() { return res; }),
      json: vi.fn(),
    };
    await handler(
      {
        method: 'POST',
        headers: { 'x-forwarded-for': '5.5.5.6' },
        body: validForm,
      },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
    expect(sendTelegramMessage).toHaveBeenCalledOnce();
  });

  it('returns 200 if at least one channel succeeds', async () => {
    sendTelegramMessage.mockRejectedValueOnce(new Error('tg down'));
    sendVkMessage.mockRejectedValueOnce(new Error('vk down'));
    const res = await handler(makeReq(validForm, 'POST', '6.6.6.6'));
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.delivered).toContain('email');
  });

  it('returns 502 if all channels fail', async () => {
    sendTelegramMessage.mockRejectedValueOnce(new Error('x'));
    sendEmail.mockRejectedValueOnce(new Error('x'));
    sendVkMessage.mockRejectedValueOnce(new Error('x'));
    const res = await handler(makeReq(validForm, 'POST', '7.7.7.7'));
    expect(res.status).toBe(502);
  });

  it('honeypot (_hp non-empty) returns 200 without sending', async () => {
    const res = await handler(makeReq({ ...validForm, _hp: 'spam' }, 'POST', '8.8.8.8'));
    expect(res.status).toBe(200);
    expect(sendTelegramMessage).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(sendVkMessage).not.toHaveBeenCalled();
  });

  it('rate-limits same IP within 10 seconds', async () => {
    const ip = '9.9.9.9';
    const r1 = await handler(makeReq(validForm, 'POST', ip));
    const r2 = await handler(makeReq(validForm, 'POST', ip));
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(429);
  });
});
