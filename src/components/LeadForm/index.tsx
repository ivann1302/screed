import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { contactSchema, type Contact } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { LeadSuccess } from '@/components/LeadSuccess';
import { siteConfig } from '@/config/site';

const formSchema = contactSchema;
type FormData = Contact;

const channelOptions = [
  { value: 'whatsapp' as const, label: 'WhatsApp' },
  { value: 'telegram' as const, label: 'Telegram' },
  { value: 'call' as const, label: 'Звонок' },
  { value: 'any' as const, label: 'Без разницы' },
];

const inputCls =
  'w-full bg-bg/15 border-2 border-bg/30 text-bg placeholder:text-bg/50 px-4 py-3 outline-none focus-visible:border-bg focus-visible:ring-2 focus-visible:ring-bg/40 motion-safe:transition';

export default function LeadForm() {
  const [done, setDone] = useState<Contact | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: { channel: 'whatsapp' },
    });
  const channel = watch('channel');

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await postLead({ type: 'form', contact: data, _hp: '' });
      setDone(data);
    } catch {
      setServerError('Не удалось отправить. Позвоните напрямую: ' + siteConfig.master.phone);
    }
  }

  return (
    <section id="form" className="bg-accent text-bg py-16 sm:py-24 lg:py-32 scroll-mt-16">
      <div className="mx-auto max-w-xl px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center text-center">
          <div className="border-2 border-bg w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
            <Send className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />
          </div>
          <div className="mt-5 text-xs uppercase tracking-widest opacity-70">Раздел</div>
          <h2 className="mt-3 font-display uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none">
            Получить расчёт
          </h2>
          <p className="mt-4 max-w-md opacity-85">
            Перезвоним и бесплатно рассчитаем стоимость работ по вашему объекту.
          </p>
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
                Телефон
              </span>
              <input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                className={inputCls + (errors.phone ? ' border-bg' : '')}
                {...register('phone')}
              />
              {errors.phone?.message && (
                <span className="mt-1 block text-xs text-bg font-bold">{errors.phone.message}</span>
              )}
            </label>

            <div>
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-80">
                Где удобнее связаться
              </span>
              <div role="radiogroup" aria-label="Канал связи" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {channelOptions.map((o) => {
                  const active = channel === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setValue('channel', o.value)}
                      className={
                        'border-2 px-3 py-2 text-sm font-display uppercase tracking-wider motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg ' +
                        (active ? 'bg-bg text-accent border-bg font-bold' : 'border-bg/40 hover:border-bg')
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
                Имя (необязательно)
              </span>
              <input className={inputCls} autoComplete="given-name" {...register('name')} />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest opacity-80">
                Комментарий (необязательно)
              </span>
              <textarea rows={3} className={inputCls + ' resize-y'} {...register('comment')} />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-bg text-accent font-display uppercase tracking-wider py-4 text-sm motion-safe:transition hover:bg-bg/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg focus-visible:ring-offset-2 focus-visible:ring-offset-accent disabled:opacity-60"
            >
              {isSubmitting ? 'Отправляем…' : 'Получить расчёт'}
            </button>

            {serverError && <p className="text-sm font-bold">{serverError}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
