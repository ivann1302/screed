import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type Contact } from '@/lib/schemas';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { PillGroup } from '@/components/ui/PillGroup';
import { contactChannelOptions, DEFAULT_CONTACT_CHANNEL, uiText } from '@/config/site';

export default function QuizStep5({ onSubmit, submitting }: { onSubmit: (c: Contact) => void; submitting: boolean }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<Contact>({ resolver: zodResolver(contactSchema), defaultValues: { channel: DEFAULT_CONTACT_CHANNEL } });
  const channel = watch('channel');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">{uiText.quiz.contactTitle}</h3>
      <p className="text-text/70 text-sm">{uiText.quiz.contactHint}</p>

      <Field label={uiText.leadForm.phoneLabel} error={errors.phone?.message}>
        <Input type="tel" placeholder={uiText.common.phonePlaceholder} autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
      </Field>

      <Field label={uiText.leadForm.channelLabel}>
        <PillGroup options={contactChannelOptions} value={channel} onChange={(v) => setValue('channel', v)} ariaLabel="Канал связи" layout="grid-4" />
      </Field>

      <Field label={uiText.leadForm.nameLabel}>
        <Input autoComplete="given-name" {...register('name', { setValueAs: (v) => (v ? v : undefined) })} />
      </Field>

      <Field label={uiText.quiz.commentLabel}>
        <Textarea rows={2} {...register('comment', { setValueAs: (v) => (v ? v : undefined) })} />
      </Field>

      <Button type="submit" size="lg" block disabled={submitting}>
        {submitting ? uiText.common.submitSendingEllipsis : uiText.cta.getEstimate}
      </Button>
    </form>
  );
}
