import { PillGroup } from '@/components/ui/PillGroup';
import { quizOptions, uiText } from '@/config/site';

export default function QuizStep3({ onAnswer }: { onAnswer: (v: string) => void }) {
  return (
    <div>
      <h3 className="font-display uppercase text-2xl sm:text-3xl tracking-tight">{uiText.quiz.screedTypeTitle}</h3>
      <div className="mt-6">
        <PillGroup options={quizOptions.screedType} value={undefined} onChange={onAnswer} ariaLabel={uiText.quiz.screedTypeAria} layout="grid-2" />
      </div>
    </div>
  );
}
