import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'semidry', label: 'Полусухая' },
  { value: 'wet', label: 'Мокрая' },
  { value: 'selfLevel', label: 'Наливной пол' },
  { value: 'unsure', label: 'Не знаю, посоветуйте' },
];

export default function QuizStep3({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">Тип стяжки?</h3>
      <div className="mt-6">
        <PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Тип стяжки" layout="grid-2" />
      </div>
    </div>
  );
}
