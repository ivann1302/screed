// tests/lib/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePrice } from '@/lib/pricing';
import { siteConfig } from '@/config/site';

describe('calculatePrice', () => {
  const p = siteConfig.pricing;

  it('semidry 75m² × 60mm with reinforcement', () => {
    const r = calculatePrice(
      { area: 75, type: 'semidry', thickness: 60, extras: ['reinforcement'] },
      p,
    );
    // work: 75 * 450 * 1.15 = 38812.5; extras: 75 * 40 = 3000; materials: 75 * 160 = 12000 (placeholder)
    expect(r.breakdown.work).toBe(38813);            // round
    expect(r.breakdown.extras).toBe(3000);
    expect(r.breakdown.materials).toBe(12000);
    expect(r.estimatedPrice).toBe(38813 + 3000 + 12000);
  });

  it('wet 50m² × 40mm no extras', () => {
    const r = calculatePrice({ area: 50, type: 'wet', thickness: 40, extras: [] }, p);
    expect(r.breakdown.work).toBe(50 * 600 * 1);
    expect(r.breakdown.extras).toBe(0);
  });

  it('selfLevel 100m² × 80mm with all extras', () => {
    const r = calculatePrice(
      { area: 100, type: 'selfLevel', thickness: 80, extras: ['reinforcement', 'overUnderfloor', 'demolition'] },
      p,
    );
    expect(r.breakdown.work).toBe(100 * 750 * 1.3);
    expect(r.breakdown.extras).toBe(100 * (40 + 80 + 100));
  });

  it('rounds to integer rubles', () => {
    const r = calculatePrice({ area: 33, type: 'semidry', thickness: 60, extras: [] }, p);
    expect(Number.isInteger(r.estimatedPrice)).toBe(true);
    expect(Number.isInteger(r.breakdown.work)).toBe(true);
  });

  it('zero area returns zero', () => {
    const r = calculatePrice({ area: 0, type: 'semidry', thickness: 40, extras: [] }, p);
    expect(r.estimatedPrice).toBe(0);
  });
});
