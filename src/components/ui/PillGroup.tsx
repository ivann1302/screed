import clsx from 'clsx';

type Option<V extends string | number> = { value: V; label: string };

type Props<V extends string | number> = {
  options: Option<V>[];
  value: V | undefined;
  onChange: (v: V) => void;
  ariaLabel: string;
  layout?: 'wrap' | 'grid-2' | 'grid-4';
};

export function PillGroup<V extends string | number>({
  options, value, onChange, ariaLabel, layout = 'wrap',
}: Props<V>) {
  const layoutCls = {
    wrap: 'flex flex-wrap gap-2',
    'grid-2': 'grid grid-cols-2 gap-2',
    'grid-4': 'grid grid-cols-2 sm:grid-cols-4 gap-2',
  }[layout];

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={layoutCls}>
      {options.map(o => {
        const active = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={clsx(
              'px-4 py-2 text-sm motion-safe:transition border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
              active
                ? 'bg-accent/10 border-accent text-accent font-semibold'
                : 'bg-surface border-border text-text/80 hover:border-text/30',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
