import { Wrench } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { services: SiteConfig['services'] };

export default function Services({ services }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Wrench className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Услуги"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <div key={s.title} className="bg-surface border-2 border-border p-6">
              <h3 className="font-display uppercase text-xl">{s.title}</h3>
              <p className="mt-3 text-text/70 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
