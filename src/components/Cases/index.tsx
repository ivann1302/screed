import { Camera } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { cases: SiteConfig['cases'] };

export default function Cases({ cases }: Props) {
  if (cases.length === 0) return null;
  return (
    <section id="cases" className="bg-bg text-text py-16 sm:py-24 lg:py-32 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Camera className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Наши работы"
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {cases.map((c) => (
            <article key={c.title} className="bg-surface border-2 border-border overflow-hidden">
              <div className="grid grid-cols-2 border-b-2 border-border">
                <div className="relative">
                  <img
                    src={c.beforeUrl}
                    alt={`${c.title} — до`}
                    loading="lazy"
                    className="h-full w-full object-cover aspect-[4/3]"
                  />
                  <span className="absolute left-2 top-2 bg-bg/80 px-2 py-1 text-xs font-display uppercase tracking-wider">
                    До
                  </span>
                </div>
                <div className="relative">
                  <img
                    src={c.afterUrl}
                    alt={`${c.title} — после`}
                    loading="lazy"
                    className="h-full w-full object-cover aspect-[4/3]"
                  />
                  <span className="absolute left-2 top-2 bg-accent text-bg px-2 py-1 text-xs font-display uppercase tracking-wider">
                    После
                  </span>
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="font-display uppercase text-lg">{c.title}</h3>
                {c.description && <p className="mt-3 text-text/70 leading-relaxed">{c.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
