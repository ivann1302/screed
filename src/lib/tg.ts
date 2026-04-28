function getTelegramChatIds(): string[] {
  const raw = process.env.TG_CHAT_IDS || process.env.TG_CHAT_ID;
  if (!raw) throw new Error('TG_CHAT_IDS or TG_CHAT_ID must be set');
  const ids = raw.split(',').map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) throw new Error('TG_CHAT_IDS or TG_CHAT_ID must contain at least one chat id');
  return ids;
}

async function sendTelegramMessageOnce(token: string, chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`Telegram API error for chat ${chatId}: ${(data as any).description ?? res.statusText}`);
  }
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TG_BOT_TOKEN;
  if (!token) throw new Error('TG_BOT_TOKEN is not set');

  const ids = getTelegramChatIds();
  const results = await Promise.allSettled(
    ids.map((chatId) => sendTelegramMessageOnce(token, chatId, text)),
  );
  const delivered = results.filter((r) => r.status === 'fulfilled').length;
  if (delivered === 0) {
    const errors = results
      .map((r) => (r.status === 'rejected' ? String((r.reason as any)?.message ?? r.reason) : null))
      .filter(Boolean)
      .join('; ');
    throw new Error(`Telegram API error: ${errors || 'all recipients failed'}`);
  }
}
