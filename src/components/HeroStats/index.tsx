import type { SiteConfig } from '@/config/site';
import { CountUp } from '@/components/ui/CountUp';

type Props = { stats: SiteConfig['about']['stats'] };

export default function HeroStats({ stats }: Props) {
  if (stats.length === 0) return null;
  return (
    <section className="bg-bg text-text border-y-2 border-border" aria-label="Ключевые цифры">
      <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-border">
        {stats.map((s) => (
          <CountUp key={s.label} target={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </div>
    </section>
  );
}
