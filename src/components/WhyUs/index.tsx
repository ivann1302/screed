import type { ComponentType, SVGProps } from 'react';
import { BadgeCheck, Users, Wallet, Receipt, Clock } from 'lucide-react';
import type { SiteConfig } from '@/config/site';
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
    <section className="bg-accent text-bg py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<BadgeCheck className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Почему мы"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w) => {
            const Icon = iconMap[w.icon];
            return (
              <div key={w.title} className="border-2 border-bg p-6 flex flex-col items-center text-center">
                <Icon className="w-12 h-12 sm:w-14 sm:h-14 text-bg" strokeWidth={2.5} />
                <h3 className="mt-5 font-display uppercase text-xl">{w.title}</h3>
                <p className="mt-3 text-bg/75 leading-relaxed">{w.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
