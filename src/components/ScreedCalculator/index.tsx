import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, Check, Layers, Ruler, Send } from 'lucide-react';
import {
  calculatorContactChannelOptions,
  calculatorScreedOptions,
  calculatorThicknessOptions,
  CALCULATOR_TOTAL_STEPS,
  DEFAULT_CONTACT_CHANNEL,
  sectionTitles,
  screedTypeLabels,
  siteConfig,
  uiText,
  type ScreedType,
  type ThicknessChoice,
} from '@/config/site';
import { contactSchema, type CalcParams, type Contact } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { LeadSuccess } from '@/components/LeadSuccess';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { PillGroup } from '@/components/ui/PillGroup';

type Props = { minAreaM2: number };
type Step = 1 | 2 | 3 | 4 | 5;

export default function ScreedCalculator({ minAreaM2 }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [area, setArea] = useState(String(minAreaM2));
  const [type, setType] = useState<ScreedType>('semidry');
  const [thicknessChoice, setThicknessChoice] = useState<ThicknessChoice>(60);
  const [customThickness, setCustomThickness] = useState('');
  const [reinforcement, setReinforcement] = useState(true);
  const [overUnderfloor, setOverUnderfloor] = useState(false);
  const [materialsIncluded, setMaterialsIncluded] = useState(true);
  const [done, setDone] = useState<Contact | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const areaNumber = Number(area.replace(',', '.'));
  const areaValid = Number.isFinite(areaNumber) && areaNumber >= minAreaM2;
  const customThicknessNumber = Number(customThickness.replace(',', '.'));
  const thickness = thicknessChoice === 'other' ? customThicknessNumber : thicknessChoice;
  const thicknessValid = thicknessChoice !== 'other'
    || (Number.isFinite(customThicknessNumber) && customThicknessNumber > 0 && customThicknessNumber <= 300);

  const params = useMemo<CalcParams>(() => {
    const extras: CalcParams['extras'] = [];
    if (reinforcement) extras.push('reinforcement');
    if (overUnderfloor) extras.push('overUnderfloor');
    return {
      area: areaValid ? areaNumber : minAreaM2,
      type,
      thickness: thicknessValid ? thickness : 60,
      extras,
      materialsIncluded,
    };
  }, [
    areaNumber,
    areaValid,
    minAreaM2,
    type,
    thickness,
    thicknessValid,
    reinforcement,
    overUnderfloor,
    materialsIncluded,
  ]);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<Contact>({
      resolver: zodResolver(contactSchema),
      defaultValues: { channel: DEFAULT_CONTACT_CHANNEL },
    });
  const channel = watch('channel');

  const canGoNext = step !== 1 || areaValid;
  const progress = ((step - 1) / (CALCULATOR_TOTAL_STEPS - 1)) * 100;

  function nextStep() {
    if (!canGoNext) return;
    if (step === 3 && !thicknessValid) return;
    setStep((current) => Math.min(CALCULATOR_TOTAL_STEPS, current + 1) as Step);
  }

  function prevStep() {
    setStep((current) => Math.max(1, current - 1) as Step);
  }

  async function submitContact(contact: Contact) {
    setServerError(null);
    try {
      await postLead({
        type: 'calculator',
        params,
        contact,
        _hp: '',
      });
      setDone(contact);
      try { sessionStorage.setItem('leadSubmitted', '1'); } catch {}
    } catch {
      setServerError(uiText.leadForm.errorPrefix + siteConfig.master.phone);
    }
  }

  if (done) {
    return (
      <section id="calculator" className="bg-bg text-text py-16 sm:py-20 lg:py-24 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-6 sm:px-10 lg:px-16">
          <LeadSuccess masterName={siteConfig.master.name} channel={done.channel} />
        </div>
      </section>
    );
  }

  return (
    <section id="calculator" className="bg-bg text-text py-16 sm:py-20 lg:py-24 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Calculator className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title={sectionTitles.calculator}
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="bg-surface border-2 border-border p-6 sm:p-8">
            <div className="flex items-start gap-4 border-b-2 border-border pb-6">
              <div className="grid h-12 w-12 shrink-0 place-items-center bg-accent text-bg">
                <Ruler className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-display uppercase text-2xl sm:text-3xl leading-tight">
                  {uiText.calculator.introTitle}
                </h2>
                <p className="mt-3 text-text/70">
                  {uiText.calculator.introText}
                </p>
              </div>
            </div>

            <div className="mt-6 h-1 w-full overflow-hidden bg-border">
              <div className="h-full bg-accent motion-safe:transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 text-xs uppercase tracking-widest text-muted">
              {uiText.calculator.stepLabel} {step} {uiText.calculator.totalLabel} {CALCULATOR_TOTAL_STEPS}
            </div>

            <div className="mt-8 min-h-[300px]">
              {step === 1 && (
                <div className="space-y-5">
                  <h3 className="font-display uppercase text-2xl sm:text-3xl">{uiText.calculator.areaTitle}</h3>
                  <Field
                    label={uiText.calculator.areaLabel}
                    error={!areaValid ? `${uiText.calculator.minAreaError} ${minAreaM2} м²` : undefined}
                    hint={`${uiText.calculator.minAreaHint} — ${minAreaM2} м²`}
                  >
                    <Input
                      inputMode="decimal"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      invalid={!areaValid}
                      aria-label={uiText.calculator.areaAria}
                    />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <h3 className="font-display uppercase text-2xl sm:text-3xl">{uiText.calculator.typeTitle}</h3>
                  <PillGroup options={calculatorScreedOptions} value={type} onChange={setType} ariaLabel={uiText.calculator.typeAria} layout="grid-4" />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <h3 className="font-display uppercase text-2xl sm:text-3xl">{uiText.calculator.thicknessTitle}</h3>
                  <PillGroup
                    options={calculatorThicknessOptions}
                    value={thicknessChoice}
                    onChange={setThicknessChoice}
                    ariaLabel={uiText.calculator.thicknessAria}
                    layout="grid-4"
                  />
                  {thicknessChoice === 'other' && (
                    <Field
                      label={uiText.calculator.customThicknessLabel}
                      error={!thicknessValid ? uiText.calculator.customThicknessError : undefined}
                    >
                      <Input
                        inputMode="decimal"
                        placeholder={uiText.calculator.customThicknessPlaceholder}
                        value={customThickness}
                        onChange={(e) => setCustomThickness(e.target.value)}
                        invalid={!thicknessValid}
                      />
                    </Field>
                  )}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5">
                  <h3 className="font-display uppercase text-2xl sm:text-3xl">{uiText.calculator.extrasTitle}</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <CheckOption
                      checked={reinforcement}
                      onChange={setReinforcement}
                      title={uiText.calculator.extras.reinforcement.title}
                      text={uiText.calculator.extras.reinforcement.text}
                    />
                    <CheckOption
                      checked={overUnderfloor}
                      onChange={setOverUnderfloor}
                      title={uiText.calculator.extras.overUnderfloor.title}
                      text={uiText.calculator.extras.overUnderfloor.text}
                    />
                    <CheckOption
                      checked={materialsIncluded}
                      onChange={setMaterialsIncluded}
                      title={uiText.calculator.extras.materialsIncluded.title}
                      text={uiText.calculator.extras.materialsIncluded.text}
                    />
                  </div>
                </div>
              )}

              {step === 5 && (
                <form onSubmit={handleSubmit(submitContact)} className="space-y-5">
                  <input type="text" tabIndex={-1} aria-hidden className="hidden" autoComplete="off" {...register('_hp' as never)} />

                  <div className="bg-bg/60 border-2 border-border p-4 text-sm text-text/75">
                    {uiText.calculator.contactIntro}
                  </div>

                  <Field label={uiText.leadForm.phoneLabel} error={errors.phone?.message}>
                    <Input
                      type="tel"
                      placeholder={uiText.common.phonePlaceholder}
                      autoComplete="tel"
                      invalid={!!errors.phone}
                      {...register('phone')}
                    />
                  </Field>

                  <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{uiText.leadForm.channelLabel}</div>
                    <PillGroup
                      options={calculatorContactChannelOptions}
                      value={channel}
                      onChange={(v) => setValue('channel', v)}
                      ariaLabel="Канал связи"
                      layout="grid-4"
                    />
                  </div>

                  <Field label={uiText.leadForm.nameLabel}>
                    <Input autoComplete="given-name" {...register('name')} />
                  </Field>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? uiText.common.submitSending : uiText.cta.sendParams}
                    </Button>
                    <Button type="button" variant="ghost" size="lg" onClick={prevStep}>
                      {uiText.common.back}
                    </Button>
                  </div>
                  {serverError && <p className="text-sm text-danger">{serverError}</p>}
                </form>
              )}
            </div>

            {step < 5 && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  disabled={!canGoNext || (step === 3 && !thicknessValid)}
                  onClick={nextStep}
                >
                  {step === 4 ? uiText.calculator.showForm : uiText.calculator.next}
                </Button>
                {step > 1 && (
                  <Button type="button" variant="ghost" size="lg" onClick={prevStep}>
                    {uiText.common.back}
                  </Button>
                )}
              </div>
            )}
          </div>

          <aside className="border-2 border-accent bg-accent text-bg p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Layers className="w-7 h-7" strokeWidth={2.5} />
              <div className="font-display uppercase text-xl">{uiText.calculator.summaryTitle}</div>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <SummaryRow label={uiText.calculator.summaryLabels.area} value={areaValid ? `${areaNumber} м²` : `от ${minAreaM2} м²`} />
              <SummaryRow label={uiText.calculator.summaryLabels.type} value={screedTypeLabels[type]} />
              <SummaryRow label={uiText.calculator.summaryLabels.thickness} value={thicknessValid ? `${thickness} мм` : uiText.calculator.summaryLabels.clarify} />
              <SummaryRow label={uiText.calculator.summaryLabels.reinforcement} value={reinforcement ? uiText.calculator.summaryLabels.yes : uiText.calculator.summaryLabels.no} />
              <SummaryRow label={uiText.calculator.summaryLabels.overUnderfloor} value={overUnderfloor ? uiText.calculator.summaryLabels.yes : uiText.calculator.summaryLabels.no} />
              <SummaryRow label={uiText.calculator.summaryLabels.materials} value={materialsIncluded ? uiText.calculator.summaryLabels.masterMaterials : uiText.calculator.summaryLabels.ownMaterials} />
            </div>
            <div className="mt-8 border-2 border-bg bg-bg px-4 py-5 text-text">
              <div className="flex items-center gap-2 font-display uppercase text-sm text-accent">
                <Send className="w-4 h-4" strokeWidth={2.5} />
                {uiText.calculator.nextStepTitle}
              </div>
              <p className="mt-3 text-sm text-text/70">
                {uiText.calculator.nextStepText}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CheckOption({
  checked, onChange, title, text,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="cursor-pointer border-2 border-border bg-bg/45 p-4 motion-safe:transition hover:border-accent">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="flex items-center gap-3">
        <span className="grid h-6 w-6 min-w-6 shrink-0 place-items-center border-2 border-accent bg-bg text-accent">
          {checked && <Check className="w-4 h-4" strokeWidth={3} />}
        </span>
        <span className="font-display uppercase text-sm">{title}</span>
      </span>
      <span className="mt-3 block text-sm text-text/65">{text}</span>
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-bg/25 pb-3">
      <span className="font-semibold uppercase tracking-wider text-xs opacity-75">{label}</span>
      <span className="text-right font-display uppercase text-sm">{value}</span>
    </div>
  );
}
