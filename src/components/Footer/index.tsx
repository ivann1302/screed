import { uiText, type SiteConfig } from '@/config/site';
import { pagePath, publicPath } from '@/lib/paths';

type Props = { master: SiteConfig['master']; project: SiteConfig['project']; contacts: SiteConfig['contacts'] };

export default function Footer({ master, project, contacts }: Props) {
  const year = new Date().getFullYear();
  const telHref = master.phone ? `tel:${master.phone.replace(/[^+\d]/g, '')}` : null;

  return (
    <footer className="bg-bg text-text border-t-2 border-border py-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 grid gap-8 sm:grid-cols-2 text-center sm:text-left">
        <div>
          <div className="font-display uppercase text-xl">{master.name}</div>
          <div className="mt-2 text-sm text-muted">{project.serviceShortName} · {master.city}</div>
          {telHref && (
            <a
              href={telHref}
              className="mt-4 inline-block font-display uppercase text-accent hover:text-accentDark motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {master.phone}
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-end items-center">
          {contacts.max && (
            <a
              href={contacts.max}
              aria-label="MAX"
              className="inline-flex h-12 w-12 items-center justify-center motion-safe:transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <img src={publicPath('/icons/Max-icon.svg')} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
            </a>
          )}
          {contacts.telegram && (
            <a
              href={contacts.telegram}
              aria-label="Telegram"
              className="inline-flex h-12 w-12 items-center justify-center motion-safe:transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <img src={publicPath('/icons/tg-icon.png')} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
            </a>
          )}
          {contacts.whatsapp && (
            <a
              href={contacts.whatsapp}
              aria-label="WhatsApp"
              className="inline-flex h-12 w-12 items-center justify-center motion-safe:transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <img src={publicPath('/icons/whatsappIcon.png')} alt="" aria-hidden="true" className="h-12 w-12 object-contain" />
            </a>
          )}
        </div>
      </div>
      <div className="mt-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-xs text-muted text-center sm:text-left">
        <div>© {year} {master.name}. {uiText.footer.rights}</div>
        <a href={pagePath('/privacy/')} className="hover:text-text/80 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          {uiText.common.privacyFull}
        </a>
      </div>
      <div className="mt-8 flex justify-center px-6 sm:hidden">
        <a
          href="#form"
          className="inline-flex w-full max-w-xs items-center justify-center bg-accent px-5 py-3 font-display text-sm uppercase tracking-wider text-bg motion-safe:transition hover:bg-accentDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {uiText.cta.orderScreed}
        </a>
      </div>
    </footer>
  );
}
