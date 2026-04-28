import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type Contact } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { LeadSuccess } from '@/components/LeadSuccess';
import { calculatorContactChannelOptions, DEFAULT_CONTACT_CHANNEL, siteConfig, uiText } from '@/config/site';

const formSchema = contactSchema;
type FormData = Contact;

const inputCls =
  'w-full bg-bg border-2 border-bg text-text placeholder:text-text/50 px-4 py-3 outline-none focus-visible:border-text focus-visible:ring-2 focus-visible:ring-text/40 motion-safe:transition';

export default function LeadForm() {
  const [done, setDone] = useState<Contact | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { channel: DEFAULT_CONTACT_CHANNEL },
    });
  const channel = watch('channel');

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await postLead({ type: 'form', contact: data, _hp: '' });
      setDone(data);
      try { sessionStorage.setItem('leadSubmitted', '1'); } catch {}
    } catch {
      setServerError(uiText.leadForm.errorPrefix + siteConfig.master.phone);
    }
  }

  return (
    <section id="form" className="bg-accent text-bg py-12 sm:py-16 lg:py-24 scroll-mt-16">
      <div className="mx-auto max-w-xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none">
            {uiText.leadForm.title}
          </h2>
        </div>

        {done ? (
          <div className="mt-10">
            <LeadSuccess masterName={siteConfig.master.name} channel={done.channel} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
            <input
              type="text"
              tabIndex={-1}
              aria-hidden
              className="hidden"
              autoComplete="off"
              {...register('_hp' as never)}
            />

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-80">
                {uiText.leadForm.phoneLabel}
              </span>
              <input
                type="tel"
                placeholder={uiText.common.phonePlaceholder}
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className={inputCls + (errors.phone ? ' border-text' : '')}
                {...register('phone')}
              />
              {errors.phone?.message && (
                <span className="mt-1 block text-xs text-bg font-bold">{errors.phone.message}</span>
              )}
            </label>

            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-80">
                {uiText.leadForm.channelLabel}
              </span>
              <div role="radiogroup" aria-label="Канал связи" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {calculatorContactChannelOptions.map((o) => {
                  const active = channel === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setValue('channel', o.value)}
                      className={
                        'border-2 px-2 py-2 text-xs font-display uppercase tracking-wider motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg ' +
                        (active
                          ? 'bg-accent text-bg border-bg font-bold'
                          : 'bg-bg text-text border-bg hover:bg-bg/85')
                      }
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-80">
                {uiText.leadForm.nameLabel}
              </span>
              <input className={inputCls} autoComplete="given-name" {...register('name')} />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-bg text-accent font-display uppercase tracking-wider py-4 text-sm motion-safe:transition hover:bg-bg/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent disabled:opacity-60"
            >
              {isSubmitting ? uiText.common.submitSendingEllipsis : uiText.cta.getEstimate}
            </button>

            {serverError && <p className="text-sm font-bold">{serverError}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
