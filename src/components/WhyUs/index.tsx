import type { ComponentType, SVGProps } from 'react';
import { BadgeCheck, Users, Wallet, Receipt, Clock } from 'lucide-react';
import { sectionTitles, type SiteConfig } from '@/config/site';
import { SectionIndex } from '@/components/ui/SectionIndex';

type Props = { whyUs: SiteConfig['whyUs'] };

type IconKey = SiteConfig['whyUs'][number]['icon'];

const iconMap: Record<IconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  team: Users,
  budget: Wallet,
  transparency: Receipt,
  schedule: Clock,
};

export default function WhyUs({ whyUs }: Props) {
  return (
    <section className="bg-bg text-text py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<BadgeCheck className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={sectionTitles.whyUs}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => {
            const Icon = iconMap[w.icon];
            return (
              <div key={w.title} className="bg-surface border-2 border-border p-5 flex flex-col items-center text-center">
                <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-accent" strokeWidth={2.5} />
                <h3 className="mt-4 font-display uppercase text-base sm:text-lg">{w.title}</h3>
                <p className="mt-2 text-sm text-text/70 leading-relaxed">{w.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
