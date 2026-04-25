import { PillGroup } from '@/components/ui/PillGroup';

const opts = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Дом / коттедж' },
  { value: 'commercial', label: 'Офис / коммерция' },
  { value: 'other', label: 'Другое' },
];

export default function QuizStep1({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">Тип помещения?</h3>
      <div className="mt-6">
        <PillGroup options={opts} value={undefined} onChange={onAnswer} ariaLabel="Тип помещения" layout="grid-2" />
      </div>
    </div>
  );
}
