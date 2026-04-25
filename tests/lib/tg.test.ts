import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelegramMessage } from '@/lib/tg';

describe('sendTelegramMessage', () => {
  beforeEach(() => {
    process.env.TG_BOT_TOKEN = 'tok';
    process.env.TG_CHAT_ID = '123';
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }) as Response);
  });
  afterEach(() => {
    delete process.env.TG_BOT_TOKEN;
    delete process.env.TG_CHAT_ID;
    vi.restoreAllMocks();
  });

  it('calls Telegram Bot API sendMessage with correct payload', async () => {
    await sendTelegramMessage('hello');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        body: expect.stringContaining('"chat_id":"123"'),
      }),
    );
  });

  it('throws if env vars missing', async () => {
    delete process.env.TG_BOT_TOKEN;
    await expect(sendTelegramMessage('x')).rejects.toThrow(/TG_BOT_TOKEN/);
  });

  it('throws on Telegram API error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ description: 'bad' }) });
    await expect(sendTelegramMessage('x')).rejects.toThrow();
  });
});
