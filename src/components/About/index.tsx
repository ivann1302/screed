import { HardHat } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { about: SiteConfig['about']; master: SiteConfig['master']; imageUrl?: string };

export default function About({ about, master, imageUrl }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<HardHat className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={about.headline}
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12 items-stretch">
          {imageUrl && (
            <div className="min-h-80 lg:col-span-5 lg:order-1">
              <img
                src={imageUrl}
                alt={`${about.headline} — ${master.name}`}
                className="h-full w-full border-2 border-border object-cover"
              />
            </div>
          )}

          <div className="lg:col-span-7 lg:order-2 space-y-5">
            {about.bio.map((p, i) => (
              <p key={i} className="text-lg text-text/85 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
