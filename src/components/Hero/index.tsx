import type { SiteConfig } from '@/config/site';
import { Button } from '@/components/ui/Button';
import { Stamp } from '@/components/ui/Stamp';

type Props = { hero: SiteConfig['hero']; master: SiteConfig['master'] };

export default function Hero({ hero, master }: Props) {
  const telHref = master.phone ? `tel:${master.phone.replace(/[^+\d]/g, '')}` : null;
  return (
    <section className="relative isolate overflow-hidden bg-bg text-text">
      <div className="absolute inset-0">
        {hero.imageUrl ? (
          <img
              src={hero.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={{ filter: 'grayscale(1) contrast(1.1)' }}
            />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg to-black" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-bg/95 via-bg/80 to-bg/55" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.16),transparent_60%)]" />
      </div>

      {hero.stamp && (
        <div className="absolute top-6 right-6 z-[3]">
          <Stamp lines={hero.stamp.lines} />
        </div>
      )}

      <div className="relative z-[1] mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-24 lg:pb-40">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span className="border border-border bg-surface px-3 py-1.5 inline-flex items-center gap-2 uppercase tracking-wider text-xs">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
            {master.city} · опыт {master.experienceYears}&nbsp;лет
          </span>
        </div>

        <h1 className="mt-6 font-display text-[clamp(2.25rem,6vw,5rem)] leading-[1.02] tracking-tight text-balance">
          {hero.headline}
        </h1>
        <p className="mt-6 max-w-2xl text-lg sm:text-xl text-pretty text-text/75">
          {hero.subheadline}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" onClick={() => document.querySelector('#form')?.scrollIntoView({ behavior: 'smooth' })}>
            {hero.ctaText}
          </Button>
          {telHref && (
            <a
              href={telHref}
              className="inline-flex items-center justify-center border-2 border-border bg-surface px-7 py-4 font-display uppercase tracking-wider text-sm motion-safe:transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {master.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
