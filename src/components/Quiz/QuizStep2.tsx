import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'lt30', label: 'до 30 м²' },
  { value: '30-60', label: '30–60 м²' },
  { value: '60-100', label: '60–100 м²' },
  { value: 'gt100', label: '100+ м²' },
];

export default function QuizStep2({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">Площадь?</h3>
      <div className="mt-6">
        <PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Площадь" layout="grid-2" />
      </div>
    </div>
  );
}
