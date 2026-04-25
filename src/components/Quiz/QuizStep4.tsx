import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'thisMonth', label: 'В этом месяце' },
  { value: 'within3m', label: 'В течение 3 мес.' },
  { value: 'later', label: 'Позже' },
  { value: 'looking', label: 'Просто смотрю' },
];

export default function QuizStep4({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">Когда планируете?</h3>
      <div className="mt-6">
        <PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Сроки" layout="grid-2" />
      </div>
    </div>
  );
}
