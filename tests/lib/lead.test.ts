import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { postLead } from '@/lib/lead';

describe('postLead', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true, delivered: ['tg'] }) }) as Response);
  });
  afterEach(() => vi.restoreAllMocks());

  it('POSTs JSON to /api/lead', async () => {
    const r = await postLead({ type: 'form', contact: { phone: '+79991234567', channel: 'whatsapp' } });
    expect(fetch).toHaveBeenCalledWith('/api/lead', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'content-type': 'application/json' }),
      body: expect.stringContaining('"type":"form"'),
    }));
    expect(r.ok).toBe(true);
  });

  it('throws on non-OK response', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: 'invalid_payload' }) });
    await expect(postLead({ type: 'form', contact: { phone: 'bad', channel: 'whatsapp' } })).rejects.toThrow();
  });
});
