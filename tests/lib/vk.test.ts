import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendVkMessage } from '@/lib/vk';

describe('sendVkMessage', () => {
  beforeEach(() => {
    process.env.VK_GROUP_TOKEN = 'tok';
    process.env.VK_OWNER_USER_ID = '111';
    process.env.VK_MASTER_USER_ID = '222';
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ response: 1 }) }) as Response);
  });
  afterEach(() => {
    delete process.env.VK_GROUP_TOKEN;
    delete process.env.VK_OWNER_USER_ID;
    delete process.env.VK_MASTER_USER_ID;
    vi.restoreAllMocks();
  });

  it('sends to both owner and master', async () => {
    await sendVkMessage('hello');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('sends only to owner if master id is empty', async () => {
    process.env.VK_MASTER_USER_ID = '';
    await sendVkMessage('hello');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws if VK_GROUP_TOKEN missing', async () => {
    delete process.env.VK_GROUP_TOKEN;
    await expect(sendVkMessage('x')).rejects.toThrow(/VK_GROUP_TOKEN/);
  });

  it('throws if at least one VK call returns error', async () => {
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ error: { error_msg: 'nope' } }) });
    (fetch as any).mockResolvedValueOnce({ ok: true, json: async () => ({ response: 1 }) });
    await expect(sendVkMessage('x')).rejects.toThrow(/VK API error: nope/);
  });
});
