type Props = { label: string; width?: 'sm' | 'md' };

export function DimensionLine({ label, width = 'sm' }: Props) {
  const w = width === 'sm' ? 'w-48' : 'w-72';
  return (
    <div aria-hidden="true" className={`relative mt-3 h-4 ${w} text-accent`}>
      <span className="absolute left-0 top-1/2 h-3 -translate-y-1/2 border-l border-accent" />
      <span className="absolute right-0 top-1/2 h-3 -translate-y-1/2 border-r border-accent" />
      <span className="absolute left-1.5 right-1.5 top-1/2 -translate-y-1/2 border-t border-accent" />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-2 font-mono text-[10px] tracking-wider">
        {label}
      </span>
    </div>
  );
}
