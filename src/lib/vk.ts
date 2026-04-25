const VK_API_VERSION = '5.199';

async function sendOnce(token: string, userId: string, text: string): Promise<void> {
  const url = new URL('https://api.vk.com/method/messages.send');
  url.searchParams.set('user_id', userId);
  url.searchParams.set('message', text);
  url.searchParams.set('random_id', String(Date.now() + Math.floor(Math.random() * 1e6)));
  url.searchParams.set('access_token', token);
  url.searchParams.set('v', VK_API_VERSION);

  const res = await fetch(url.toString(), { method: 'POST' });
  const data: any = await res.json();
  if (data.error) throw new Error(`VK API error: ${data.error.error_msg}`);
}

export async function sendVkMessage(text: string): Promise<void> {
  const token = process.env.VK_GROUP_TOKEN;
  if (!token) throw new Error('VK_GROUP_TOKEN is not set');
  const owner = process.env.VK_OWNER_USER_ID;
  const master = process.env.VK_MASTER_USER_ID;
  if (!owner) throw new Error('VK_OWNER_USER_ID is not set');

  // Если ошибка — кидаем; в api/lead это поймает Promise.allSettled и не уронит другие каналы.
  await sendOnce(token, owner, text);
  if (master) await sendOnce(token, master, text);
}
