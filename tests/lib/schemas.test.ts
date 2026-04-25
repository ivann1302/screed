import { describe, it, expect } from 'vitest';
import { leadPayloadSchema, contactSchema } from '@/lib/schemas';

describe('contactSchema', () => {
  it('accepts valid contact', () => {
    const r = contactSchema.safeParse({ phone: '+79991234567', channel: 'whatsapp' });
    expect(r.success).toBe(true);
  });

  it('rejects invalid phone', () => {
    const r = contactSchema.safeParse({ phone: 'abc', channel: 'whatsapp' });
    expect(r.success).toBe(false);
  });

  it('rejects unknown channel', () => {
    const r = contactSchema.safeParse({ phone: '+79991234567', channel: 'fax' });
    expect(r.success).toBe(false);
  });

  it('allows optional name and comment', () => {
    const r = contactSchema.safeParse({
      phone: '+79991234567', channel: 'call', name: 'Иван', comment: 'после 18:00',
    });
    expect(r.success).toBe(true);
  });
});

describe('leadPayloadSchema', () => {
  const okContact = { phone: '+79991234567', channel: 'whatsapp' as const };

  it('accepts quiz payload', () => {
    const r = leadPayloadSchema.safeParse({
      type: 'quiz',
      answers: { roomType: 'apartment', area: '30-60', screedType: 'semidry', timing: 'thisMonth' },
      contact: okContact,
    });
    expect(r.success).toBe(true);
  });

  it('accepts calculator payload', () => {
    const r = leadPayloadSchema.safeParse({
      type: 'calculator',
      params: { area: 75, type: 'semidry', thickness: 60, extras: ['reinforcement'] },
      estimatedPrice: 48750,
      breakdown: { work: 33750, extras: 3000, materials: 12000 },
      contact: okContact,
    });
    expect(r.success).toBe(true);
  });

  it('accepts form payload', () => {
    const r = leadPayloadSchema.safeParse({ type: 'form', contact: okContact });
    expect(r.success).toBe(true);
  });

  it('accepts consultation payload', () => {
    const r = leadPayloadSchema.safeParse({
      type: 'consultation',
      contact: { phone: '+79991234567', channel: 'whatsapp', name: 'Анна' },
    });
    expect(r.success).toBe(true);
  });

  it('rejects unknown type', () => {
    const r = leadPayloadSchema.safeParse({ type: 'something', contact: okContact });
    expect(r.success).toBe(false);
  });

  it('passes through optional honeypot', () => {
    const r = leadPayloadSchema.safeParse({ type: 'form', contact: okContact, _hp: '' });
    expect(r.success).toBe(true);
  });
});
