import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

// Primary CTA: пятиугольник со стрелкой справа через clip-path.
// Внимание: clip-path обрезает focus-ring у некоторых браузеров. Поэтому focus-visible
// ставим на ВНЕШНИЙ wrapper (style={{ clipPath: ... }}), а ring рисуем на родителе.
const PRIMARY_CLIP =
  'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)';

const button = cva(
  'inline-flex items-center justify-center gap-2 font-display tracking-wider uppercase motion-safe:transition focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // primary: оранжевая заливка + стрелка через clip-path. padding-right больше чем left, чтобы текст не наезжал на стрелку.
        primary:   'bg-accent text-onAccent hover:bg-accentDark',
        // secondary: прозрачный с толстой оранжевой рамкой
        secondary: 'bg-transparent border-[3px] border-accent text-accent hover:bg-accent hover:text-onAccent',
        // ghost: бордер-минимал, без заливки
        ghost:     'border-2 border-border text-text hover:bg-surface',
      },
      size: {
        sm: 'text-xs px-4 py-2',
        md: 'text-sm px-6 py-3',
        lg: 'text-sm px-7 py-4',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size, block, className, children, ...rest }, ref,
) {
  const isPrimary = variant === 'primary';

  // Для primary: extra padding-right под стрелку + clip-path. Focus-ring через wrapper.
  if (isPrimary) {
    return (
      <span
        className={clsx(
          'relative inline-block',
          block && 'w-full',
        )}
      >
        <button
          ref={ref}
          className={clsx(
            button({ variant, size, block }),
            'pr-10',          // место под стрелку
            className,
          )}
          style={{ clipPath: PRIMARY_CLIP, WebkitClipPath: PRIMARY_CLIP }}
          {...rest}
        >
          {children}
        </button>
      </span>
    );
  }

  // secondary/ghost — обычный прямоугольный
  return (
    <button
      ref={ref}
      className={clsx(
        button({ variant, size, block }),
        'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
