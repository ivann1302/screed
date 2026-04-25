import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { contactSchema } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';

const cardSchema = contactSchema.extend({
  name: z.string().min(1, 'Введите имя').max(80),
});
type CardData = z.infer<typeof cardSchema>;

export function ConsultationCard({
  open, onClose, onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const titleId = 'consultation-title';
  const cardRef = useRef<HTMLDivElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<CardData>({
      resolver: zodResolver(cardSchema),
      defaultValues: { channel: 'whatsapp' },
    });

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  if (!open) return null;

  async function onSubmit(data: CardData) {
    setServerError(null);
    try {
      await postLead({
        type: 'consultation',
        contact: { phone: data.phone, channel: 'whatsapp', name: data.name },
        _hp: '',
      });
      onSuccess();
    } catch {
      setServerError('Не удалось отправить. Попробуйте позже.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(15,15,20,0.25)] cursor-default"
        tabIndex={-1}
      />
      <div ref={cardRef} className="relative mx-6 w-full max-w-sm bg-bg text-text border-2 border-accent p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-3 top-3 border-2 border-border p-1.5 motion-safe:transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <p className="text-xs uppercase tracking-widest text-accent font-display">Бесплатная консультация</p>
        <h3 id={titleId} className="mt-2 font-display uppercase text-xl sm:text-2xl tracking-tight">
          Расскажу о стяжке за 15 минут
        </h3>
        <p className="mt-3 text-sm text-text/70">
          Свяжусь в WhatsApp и отвечу на вопросы по вашему объекту.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3">
          <input type="text" tabIndex={-1} aria-hidden className="hidden" autoComplete="off" {...register('_hp' as never)} />

          <Field label="Имя" error={errors.name?.message}>
            <Input autoComplete="given-name" invalid={!!errors.name} {...register('name')} />
          </Field>

          <Field label="Телефон" error={errors.phone?.message}>
            <Input type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
          </Field>

          <Button type="submit" block size="md" disabled={isSubmitting}>
            {isSubmitting ? 'Отправляем…' : 'Получить консультацию'}
          </Button>

          <p className="text-[10px] text-muted text-center leading-relaxed">
            Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.{' '}
            <a href="/privacy/" className="underline hover:text-text">Политика</a>.
          </p>
          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
        </form>
      </div>
    </div>
  );
}
