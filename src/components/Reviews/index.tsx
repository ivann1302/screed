import { MessageSquareQuote } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { reviews: SiteConfig['reviews'] };

export default function Reviews({ reviews }: Props) {
  if (reviews.length === 0) return null;
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<MessageSquareQuote className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Отзывы"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {reviews.map((r, i) => (
            <figure key={i} className="bg-surface border-2 border-border p-6 flex flex-col items-center text-center">
              <div className="text-accent text-lg" aria-label={`${r.rating} из 5`}>
                {'★'.repeat(r.rating)}
                <span className="text-text/20">{'★'.repeat(5 - r.rating)}</span>
              </div>
              <blockquote className="mt-4 text-text/85 leading-relaxed">«{r.text}»</blockquote>
              <figcaption className="mt-4 text-sm text-muted font-display uppercase tracking-wider">— {r.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
