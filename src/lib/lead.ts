import type { LeadPayload } from '@/lib/schemas';

export async function postLead(payload: LeadPayload): Promise<{ ok: boolean; delivered?: string[] }> {
  const res = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(`lead.failed: ${(data as any).error ?? res.status}`);
  }
  return res.json();
}
