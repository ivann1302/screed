import type { QuizAnswers, Contact } from '@/lib/schemas';

export type QuizState = {
  step: 1 | 2 | 3 | 4 | 5;
  answers: Partial<QuizAnswers>;
  contact?: Contact;
};

export type QuizAction =
  | { type: 'answer'; field: keyof QuizAnswers; value: string }
  | { type: 'back' }
  | { type: 'reset' };

export const initialQuizState: QuizState = { step: 1, answers: {} };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer': {
      const answers = { ...state.answers, [action.field]: action.value } as Partial<QuizAnswers>;
      const nextStep = (state.step + 1) as QuizState['step'];
      return { ...state, answers, step: nextStep <= 5 ? nextStep : 5 };
    }
    case 'back':
      return { ...state, step: (Math.max(1, state.step - 1) as QuizState['step']) };
    case 'reset':
      return initialQuizState;
  }
}
