import type { LeadPayload } from '@/lib/schemas';

const leadEndpoint = import.meta.env.VITE_LEAD_ENDPOINT || '/api/lead';

export async function postLead(payload: LeadPayload): Promise<{ ok: boolean; delivered?: string[] }> {
  const res = await fetch(leadEndpoint, {
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
