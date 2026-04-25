import type { ReactNode } from 'react';

type Props = {
  index?: string;
  icon?: ReactNode;
  label?: string;
  title: string;
};

export function SectionIndex({ index, icon, label = 'Раздел', title }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-accent">
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
      <div className="mt-5 text-xs uppercase tracking-widest text-muted">{label}</div>
      <h2 className="mt-3 font-display uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none">
        {title}
      </h2>
    </div>
  );
}
