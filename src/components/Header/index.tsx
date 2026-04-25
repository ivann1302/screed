import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
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
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-display uppercase text-base sm:text-lg tracking-tight truncate">
              {master.name}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-widest opacity-80">
              Стяжка пола · {master.city}
            </span>
          </div>

          {/* Desktop: phone CTA */}
          {telHref && (
            <a
              href={telHref}
              className="hidden md:inline-flex items-center gap-2 border-2 border-bg px-3 sm:px-5 py-2 font-display uppercase tracking-wider text-xs sm:text-sm motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
            >
              <Phone className="w-4 h-4" strokeWidth={2.5} />
              <span>{master.phone}</span>
            </a>
          )}

          {/* Mobile: burger button */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={open}
            className="md:hidden border-2 border-bg p-2 motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          >
            <Menu className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-accent text-bg flex flex-col md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 h-14 border-b-2 border-bg/20">
            <span className="font-display uppercase text-lg tracking-tight truncate">
              {master.name}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть меню"
              className="border-2 border-bg p-2 motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-display uppercase text-2xl py-4 border-b-2 border-bg/20 hover:text-bg/70 motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="px-6 py-6 border-t-2 border-bg/20 flex flex-col gap-3">
            {telHref && (
              <a
                href={telHref}
                className="inline-flex items-center justify-center gap-2 border-2 border-bg px-5 py-3 font-display uppercase tracking-wider text-sm motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
              >
                <Phone className="w-4 h-4" strokeWidth={2.5} />
                {master.phone}
              </a>
            )}
            <a
              href="#form"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center bg-bg text-accent px-5 py-3 font-display uppercase tracking-wider text-sm motion-safe:transition hover:bg-bg/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg"
            >
              Заказать стяжку
            </a>
          </div>
        </div>
      )}
    </>
  );
}
