import { Layers } from 'lucide-react';
import { sectionTitles, uiText, type SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { services: SiteConfig['services'] };

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

export default function Services({ services }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Layers className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={sectionTitles.services}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="bg-surface border-2 border-border p-6 flex flex-col items-center text-center">
              <h3 className="font-display uppercase text-xl">{s.title}</h3>
              <p className="mt-3 text-text/70 leading-relaxed">{s.description}</p>
              <div className="mt-6 pt-6 w-full border-t-2 border-border">
                <span className="font-display text-3xl text-accent whitespace-nowrap">
                  {s.note ? `${s.note} ` : ''}{fmt(s.pricePerM2)} ₽/м²
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted">
          {uiText.services.priceNote}
        </p>
      </div>
    </section>
  );
}
