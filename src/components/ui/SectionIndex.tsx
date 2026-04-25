type Props = { index: string; label?: string; title: string };

export function SectionIndex({ index, label = 'Раздел', title }: Props) {
  return (
    <div className="flex items-start gap-5 sm:gap-8">
      <div className="font-display text-6xl sm:text-7xl lg:text-8xl text-accent leading-none flex-shrink-0">
        {index}
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
