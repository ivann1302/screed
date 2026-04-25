import type { SiteConfig } from '@/config/site';

type Props = { master: SiteConfig['master']; contacts: SiteConfig['contacts'] };

export default function Footer({ master, contacts }: Props) {
  const year = new Date().getFullYear();
  const telHref = master.phone ? `tel:${master.phone.replace(/[^+\d]/g, '')}` : null;

  return (
    <footer className="bg-bg text-text border-t-2 border-border py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 grid gap-8 sm:grid-cols-2">
        <div>
          <div className="font-display uppercase text-xl">{master.name}</div>
          <div className="mt-2 text-sm text-muted">Стяжка пола · {master.city}</div>
          {telHref && (
            <a
              href={telHref}
              className="mt-4 inline-block font-display uppercase text-accent hover:text-accentDark motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {master.phone}
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end items-start">
          {contacts.whatsapp && (
            <a
              href={contacts.whatsapp}
              className="font-display uppercase text-sm tracking-wider hover:text-accent motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              WhatsApp
            </a>
          )}
          {contacts.telegram && (
            <a
              href={contacts.telegram}
              className="font-display uppercase text-sm tracking-wider hover:text-accent motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Telegram
            </a>
          )}
          {contacts.vk && (
            <a
              href={contacts.vk}
              className="font-display uppercase text-sm tracking-wider hover:text-accent motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              VK
            </a>
          )}
          {contacts.email && (
            <a
              href={`mailto:${contacts.email}`}
              className="font-display uppercase text-sm tracking-wider hover:text-accent motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              Email
            </a>
          )}
        </div>
      </div>
      <div className="mt-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <div>© {year} {master.name}. Все права защищены.</div>
        <a href="/privacy/" className="hover:text-text/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Политика конфиденциальности
        </a>
      </div>
    </footer>
  );
}
