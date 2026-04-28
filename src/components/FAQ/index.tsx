import { HelpCircle } from 'lucide-react';
import { sectionTitles, type SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { faq: SiteConfig['faq'] };

export default function FAQ({ faq }: Props) {
  if (faq.length === 0) return null;
  return (
    <section id="faq" className="bg-bg text-text py-16 sm:py-20 lg:py-24 scroll-mt-16">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<HelpCircle className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={sectionTitles.faq}
        />
        <div className="mt-12 border-2 border-border">
          {faq.map((q, i) => (
            <details
              key={i}
              className={
                'group ' +
                (i < faq.length - 1 ? 'border-b-2 border-border' : '')
              }
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 list-none font-display uppercase text-base sm:text-lg motion-safe:transition hover:text-accent">
                <span>{q.question}</span>
                <span
                  aria-hidden
                  className="text-accent text-2xl leading-none flex-shrink-0 motion-safe:transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 text-text/75 leading-relaxed">
                {q.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
