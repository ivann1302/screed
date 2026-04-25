import { HardHat } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { CountUp } from '@/components/ui/CountUp';

type Props = { about: SiteConfig['about']; master: SiteConfig['master'] };

export default function About({ about, master }: Props) {
  return (
    <section className="bg-bg text-text py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<HardHat className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={about.headline}
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <ul className="space-y-4">
              {about.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-lg text-text/85">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                  {b}
                </li>
              ))}
            </ul>

            {about.stats.length > 0 && (
              <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
                {about.stats.map((s) => (
                  <CountUp key={s.label} target={s.value} suffix={s.suffix} label={s.label} />
                ))}
              </div>
            )}
          </div>

          {master.photoUrl && (
            <div className="lg:col-span-5">
              <img
                src={master.photoUrl}
                alt={master.name}
                className="w-full border-2 border-border"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
