import { Phone } from 'lucide-react';
import type { SiteConfig } from '@/config/site';

type Props = { master: SiteConfig['master'] };

export default function Header({ master }: Props) {
  const telHref = master.phone ? `tel:${master.phone.replace(/[^+\d]/g, '')}` : null;

  return (
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

        {telHref && (
          <a
            href={telHref}
            className="inline-flex items-center gap-2 border-2 border-bg px-3 sm:px-5 py-2 font-display uppercase tracking-wider text-xs sm:text-sm motion-safe:transition hover:bg-bg hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
          >
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">{master.phone}</span>
            <span className="sm:hidden">Позвонить</span>
          </a>
        )}
      </div>
    </header>
  );
}
