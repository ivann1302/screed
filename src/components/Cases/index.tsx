import { Camera } from 'lucide-react';
import { sectionTitles, uiText, type SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { cases: SiteConfig['cases'] };

export default function Cases({ cases }: Props) {
  if (cases.length === 0) return null;
  return (
    <section id="cases" className="bg-bg text-text py-16 sm:py-20 lg:py-24 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Camera className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={sectionTitles.cases}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cases.map((c) => (
            <article key={c.title} className="grid overflow-hidden border-2 border-border bg-surface md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-64 border-b-2 border-border md:border-b-0 md:border-r-2">
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute left-3 top-3 bg-accent px-3 py-1.5 text-xs font-display uppercase tracking-wider text-bg">
                  {c.area}
                </span>
              </div>
              <div className="flex min-h-64 flex-col p-6 sm:p-7">
                <div className="text-xs font-semibold uppercase tracking-widest text-accent">
                  {c.location}
                </div>
                <h3 className="mt-3 font-display uppercase text-2xl leading-tight">{c.title}</h3>
                <p className="mt-4 text-text/70 leading-relaxed">{c.description}</p>
                <dl className="mt-auto grid grid-cols-2 gap-3 pt-6">
                  <CaseMetric label={uiText.cases.workLabel} value={c.workType} />
                  <CaseMetric label={uiText.cases.durationLabel} value={c.duration} />
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CaseMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-border bg-bg/45 p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 font-display uppercase text-sm text-text">{value}</dd>
    </div>
  );
}
