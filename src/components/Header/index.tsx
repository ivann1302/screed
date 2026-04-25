import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import clsx from 'clsx';
import type { SiteConfig } from '@/config/site';

type Props = { master: SiteConfig['master'] };

const links = [
  { href: '#calculator', label: 'Калькулятор' },
  { href: '#form', label: 'Заказать расчёт' },
  { href: '#faq', label: 'Частые вопросы' },
];

export default function Header({ master }: Props) {
  const telHref = master.phone ? `tel:${master.phone.replace(/[^+\d]/g, '')}` : null;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-accent text-bg border-b-2 border-bg/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-10 lg:px-16 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex flex-col leading-tight min-w-0 flex-shrink-0">
            <span className="font-display uppercase text-base sm:text-lg tracking-tight truncate">
              {master.name}
            </span>
            <span className="hidden lg:inline text-[10px] sm:text-xs uppercase tracking-widest opacity-80">
              Стяжка пола · {master.city}
            </span>
          </div>

          {/* Desktop: nav links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-display uppercase tracking-wider text-xs lg:text-sm motion-safe:transition hover:opacity-70 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop: CTAs */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {telHref && (
              <a
                href={telHref}
                aria-label={`Позвонить ${master.phone}`}
                className="inline-flex items-center gap-2 border-2 border-bg px-3 lg:px-5 py-2 font-display uppercase tracking-wider text-xs lg:text-sm motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
              >
                <Phone className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden lg:inline">{master.phone}</span>
              </a>
            )}
            <a
              href="#form"
              className="inline-flex items-center bg-bg text-accent px-3 lg:px-5 py-2 font-display uppercase tracking-wider text-xs lg:text-sm motion-safe:transition hover:bg-bg/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              Заказать стяжку
            </a>
          </div>

          {/* Mobile: burger toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="md:hidden relative z-50 border-2 border-bg p-2 motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          >
            {open ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Menu className="w-6 h-6" strokeWidth={2.5} />}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen slide-in drawer (from right) */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Меню"
        aria-hidden={!open}
        className={clsx(
          'md:hidden fixed inset-0 z-40 bg-bg text-accent flex flex-col motion-safe:transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        )}
      >
        {/* Top bar inside drawer (matches header height so the close button aligns with the burger) */}
        <div className="h-14 sm:h-16 flex items-center px-4 sm:px-10 border-b-2 border-border">
          <span className="font-display uppercase text-lg tracking-tight truncate text-accent">
            {master.name}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 flex flex-col">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display uppercase text-2xl py-4 border-b-2 border-border hover:text-accentDark motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="px-4 sm:px-10 py-5 border-t-2 border-border flex flex-col gap-3">
          {telHref && (
            <a
              href={telHref}
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 border-2 border-accent px-5 py-3 font-display uppercase tracking-wider text-sm motion-safe:transition hover:bg-accent hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Phone className="w-4 h-4" strokeWidth={2.5} />
              {master.phone}
            </a>
          )}
          <a
            href="#form"
            onClick={() => setOpen(false)}
            className="inline-flex items-center justify-center bg-accent text-bg px-5 py-3 font-display uppercase tracking-wider text-sm motion-safe:transition hover:bg-accentDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Заказать стяжку
          </a>
        </div>
      </div>
    </>
  );
}
