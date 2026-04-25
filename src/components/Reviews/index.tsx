import { useCallback } from 'react';
import { MessageSquareQuote, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { reviews: SiteConfig['reviews'] };

export default function Reviews({ reviews }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (reviews.length === 0) return null;

  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<MessageSquareQuote className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Отзывы"
        />

        <div className="relative mt-12">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {reviews.map((r, i) => (
                <figure
                  key={i}
                  className="flex-shrink-0 basis-full sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)] bg-surface border-2 border-border p-6 flex flex-col items-center text-center"
                >
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

          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Предыдущий отзыв"
            className="absolute left-2 sm:-left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-accent text-bg grid place-items-center shadow-lg motion-safe:transition hover:bg-accentDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Следующий отзыв"
            className="absolute right-2 sm:-right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-accent text-bg grid place-items-center shadow-lg motion-safe:transition hover:bg-accentDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
}
