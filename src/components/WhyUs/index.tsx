import { BadgeCheck } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { whyUs: SiteConfig['whyUs'] };

export default function WhyUs({ whyUs }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<BadgeCheck className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Почему мы"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => (
            <div key={w.title} className="bg-surface border-2 border-border flex flex-col">
              <img
                src={w.imageUrl}
                alt={w.title}
                loading="lazy"
                className="w-full aspect-[4/3] object-cover border-b-2 border-border"
              />
              <div className="p-6 flex flex-col items-center text-center">
                <h3 className="font-display uppercase text-xl">{w.title}</h3>
                <p className="mt-3 text-text/70 leading-relaxed">{w.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
