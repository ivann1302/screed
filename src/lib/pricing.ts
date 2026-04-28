import type { CalcParams, PriceBreakdown } from '@/lib/schemas';
import type { SiteConfig } from '@/config/site';

export function calculatePrice(
  params: CalcParams,
  pricing: SiteConfig['pricing'],
): { estimatedPrice: number; breakdown: PriceBreakdown } {
  const { area, type, thickness, extras } = params;
  const baseRate = pricing.rates[type];
  const multiplier = (pricing.thicknessMultiplier as Record<number, number>)[thickness] ?? 1;
  const work = Math.round(area * baseRate * multiplier);
  const extrasSum = Math.round(
    extras.reduce((sum, key) => sum + (pricing.extras[key] ?? 0), 0) * area,
  );
  const materials = Math.round(area * pricing.materialsPerM2);
  return {
    estimatedPrice: work + extrasSum + materials,
    breakdown: { work, extras: extrasSum, materials },
  };
}
