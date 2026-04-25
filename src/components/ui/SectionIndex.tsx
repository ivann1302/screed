import type { ReactNode } from 'react';

type Props = {
  index?: string;          // optional now (was required)
  icon?: ReactNode;        // new: replaces the index when provided
  label?: string;
  title: string;
};

export function SectionIndex({ index, icon, label = 'Раздел', title }: Props) {
  return (
    <div className="flex items-start gap-5 sm:gap-8">
      <div className="text-accent flex-shrink-0">
        {icon ? (
          <div className="border-2 border-accent w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            {icon}
          </div>
        ) : (
          <div className="font-display text-6xl sm:text-7xl lg:text-8xl leading-none">
            {index}
          </div>
        )}
      </div>
      <div className="border-l-2 border-border pl-4 sm:pl-6 pt-2">
        <div className="text-xs uppercase tracking-widest text-muted">{label}</div>
        <h2 className="font-display uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none mt-2">
          {title}
        </h2>
      </div>
    </div>
  );
}
