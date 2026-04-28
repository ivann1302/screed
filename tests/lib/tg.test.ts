import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendTelegramMessage } from '@/lib/tg';

describe('sendTelegramMessage', () => {
  beforeEach(() => {
    process.env.TG_BOT_TOKEN = 'tok';
    process.env.TG_CHAT_IDS = '123, 456';
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }) as Response);
  });
  afterEach(() => {
    delete process.env.TG_BOT_TOKEN;
    delete process.env.TG_CHAT_ID;
    delete process.env.TG_CHAT_IDS;
    vi.restoreAllMocks();
  });

  it('calls Telegram Bot API sendMessage for every configured chat id', async () => {
    await sendTelegramMessage('hello');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        body: expect.stringContaining('"chat_id":"123"'),
      }),
    );
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok/sendMessage',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        body: expect.stringContaining('"chat_id":"456"'),
      }),
    );
  });

  it('falls back to legacy TG_CHAT_ID', async () => {
    delete process.env.TG_CHAT_IDS;
    process.env.TG_CHAT_ID = '789';
    await sendTelegramMessage('hello');
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.telegram.org/bottok/sendMessage',
      expect.objectContaining({
        body: expect.stringContaining('"chat_id":"789"'),
      }),
    );
  });

  it('throws if env vars missing', async () => {
    delete process.env.TG_BOT_TOKEN;
    await expect(sendTelegramMessage('x')).rejects.toThrow(/TG_BOT_TOKEN/);
  });

  it('throws on Telegram API error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ description: 'bad' }) });
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ description: 'bad2' }) });
    await expect(sendTelegramMessage('x')).rejects.toThrow();
  });

  it('does not throw if at least one chat id receives the message', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ description: 'bad' }) });
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });
    await expect(sendTelegramMessage('x')).resolves.toBeUndefined();
  });
});
