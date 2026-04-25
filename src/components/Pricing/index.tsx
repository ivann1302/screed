import { Tag } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { pricing: SiteConfig['pricing'] };

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

export default function Pricing({ pricing }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Tag className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Цены"
        />
        <div className="mt-12 border-2 border-border">
          {pricing.items.map((p, i) => (
            <div
              key={p.name}
              className={
                'flex items-baseline justify-between gap-4 px-6 py-5 ' +
                (i < pricing.items.length - 1 ? 'border-b-2 border-border' : '')
              }
            >
              <span className="font-display uppercase text-sm sm:text-base text-text">{p.name}</span>
              <span className="font-display text-xl sm:text-2xl text-accent whitespace-nowrap">
                {p.note ? `${p.note} ` : ''}{fmt(p.pricePerM2)}{' ₽/м²'}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">
          Цены ориентировочные. Точную смету пришлю после замера.
        </p>
      </div>
    </section>
  );
}
