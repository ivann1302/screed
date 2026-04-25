import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type Contact } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PillGroup } from '@/components/ui/PillGroup';

const channelOptions = [
  { value: 'whatsapp' as const, label: 'WhatsApp' },
  { value: 'telegram' as const, label: 'Telegram' },
  { value: 'call' as const, label: 'Звонок' },
  { value: 'any' as const, label: 'Без разницы' },
];

export default function QuizStep5({ onSubmit, submitting }: { onSubmit: (c: Contact) => void; submitting: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<Contact>({ resolver: zodResolver(contactSchema), defaultValues: { channel: 'whatsapp' } });
  const channel = watch('channel');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">Куда прислать расчёт?</h3>
      <p className="text-text/70 text-sm">Мастер свяжется в течение 15 минут.</p>

      <Field label="Телефон" error={errors.phone?.message}>
        <Input type="tel" placeholder="+7 (___) ___-__-__" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
      </Field>

      <Field label="Где удобнее связаться">
        <PillGroup options={channelOptions} value={channel} onChange={(v) => setValue('channel', v)} ariaLabel="Канал связи" layout="grid-4" />
      </Field>

      <Field label="Имя (необязательно)">
        <Input autoComplete="given-name" {...register('name', { setValueAs: (v) => (v ? v : undefined) })} />
      </Field>

      <Field label="Комментарий (необязательно)">
        <Textarea rows={2} {...register('comment', { setValueAs: (v) => (v ? v : undefined) })} />
      </Field>

      <Button type="submit" size="lg" block disabled={submitting}>
        {submitting ? 'Отправляем…' : 'Получить расчёт'}
      </Button>
    </form>
  );
}
