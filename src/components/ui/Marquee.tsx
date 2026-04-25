import clsx from 'clsx';

type Props = { items: string[]; bg?: 'accent' | 'surface'; speed?: number };

export function Marquee({ items, bg = 'accent', speed = 18 }: Props) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];
  return (
    <div
      className={clsx(
        'overflow-hidden border-y-2 border-accent',
        bg === 'accent' ? 'bg-accent text-bg' : 'bg-surface text-text',
      )}
      role="presentation"
      aria-hidden="true"
    >
      <div
        className="flex gap-8 py-3 font-display uppercase tracking-widest text-sm whitespace-nowrap motion-safe:animate-[marquee_var(--marquee-speed)_linear_infinite] motion-reduce:animate-none"
        style={{ ['--marquee-speed' as any]: `${speed}s`, width: 'max-content' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center gap-8">
            <span>{item}</span>
            <span className="opacity-50">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
