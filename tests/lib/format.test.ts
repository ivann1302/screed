import { describe, it, expect } from 'vitest';
import { formatLeadText, maskPhone } from '@/lib/format';
import type { LeadPayload } from '@/lib/schemas';

describe('formatLeadText', () => {
  it('formats consultation lead', () => {
    const p: LeadPayload = {
      type: 'consultation',
      contact: { phone: '+79991234567', channel: 'whatsapp', name: 'Анна' },
    };
    const t = formatLeadText(p);
    expect(t).toMatch(/КОНСУЛЬТАЦИЯ/);
    expect(t).toMatch(/Анна/);
    expect(t).toMatch(/\+79991234567/);
    expect(t).toMatch(/whatsapp/i);
  });

  it('formats calculator lead with breakdown', () => {
    const p: LeadPayload = {
      type: 'calculator',
      params: { area: 75, type: 'semidry', thickness: 60, extras: ['reinforcement'] },
      estimatedPrice: 53813,
      breakdown: { work: 38813, extras: 3000, materials: 12000 },
      contact: { phone: '+79991234567', channel: 'telegram' },
    };
    const t = formatLeadText(p);
    expect(t).toMatch(/КАЛЬКУЛЯТОР/);
    expect(t).toMatch(/75/);
    expect(t).toMatch(/53\s?813|53,?813|53813/);
  });

  it('formats quiz lead with answers', () => {
    const p: LeadPayload = {
      type: 'quiz',
      answers: { roomType: 'apartment', area: '30-60', screedType: 'semidry', timing: 'thisMonth' },
      contact: { phone: '+79991234567', channel: 'call' },
    };
    const t = formatLeadText(p);
    expect(t).toMatch(/КВИЗ/);
    expect(t).toMatch(/Квартира/);
  });
});

describe('maskPhone', () => {
  it('masks middle digits', () => {
    expect(maskPhone('+79991234567')).toBe('+7***-**-67');
  });

  it('handles short input gracefully', () => {
    expect(maskPhone('abc')).toBe('***');
  });
});
