import { useReducer, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { quizReducer, initialQuizState } from './reducer';
import QuizStep1 from './QuizStep1';
import QuizStep2 from './QuizStep2';
import QuizStep3 from './QuizStep3';
import QuizStep4 from './QuizStep4';
import QuizStep5 from './QuizStep5';
import type { Contact, QuizAnswers } from '@/lib/schemas';
import { postLead } from '@/lib/lead';
import { siteConfig } from '@/config/site';
import { LeadSuccess } from '@/components/LeadSuccess';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { Button } from '@/components/ui/Button';

export default function Quiz() {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [done, setDone] = useState<Contact | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleContact(contact: Contact) {
    setServerError(null);
    setSubmitting(true);
    try {
      await postLead({
        type: 'quiz',
        answers: state.answers as QuizAnswers,
        contact,
        _hp: '',
      });
      setDone(contact);
      try { sessionStorage.setItem('leadSubmitted', '1'); } catch {}
    } catch {
      setServerError('Не удалось отправить. Позвоните: ' + siteConfig.master.phone);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="quiz" className="bg-bg text-text py-16 sm:py-24 lg:py-32 scroll-mt-16">
      <div className="mx-auto max-w-2xl px-6 sm:px-10 lg:px-16">
        <SectionIndex
          icon={<Sparkles className="w-10 h-10 sm:w-12 sm:h-12" strokeWidth={2.5} />}
          title="Подбор стяжки"
        />

        {done ? (
          <div className="mt-10"><LeadSuccess masterName={siteConfig.master.name} channel={done.channel} /></div>
        ) : (
          <div className="mt-10 bg-surface border-2 border-border p-6 sm:p-8">
            <div className="h-1 w-full overflow-hidden bg-border">
              <div className="h-full bg-accent motion-safe:transition-[width] duration-300" style={{ width: `${(state.step - 1) * 25}%` }} />
            </div>
            <div className="mt-3 text-xs uppercase tracking-widest text-muted">Шаг {state.step} из 5</div>

            <div key={state.step} className="mt-8">
              {state.step === 1 && <QuizStep1 onAnswer={(v) => dispatch({ type: 'answer', field: 'roomType', value: v })} />}
              {state.step === 2 && <QuizStep2 onAnswer={(v) => dispatch({ type: 'answer', field: 'area', value: v })} />}
              {state.step === 3 && <QuizStep3 onAnswer={(v) => dispatch({ type: 'answer', field: 'screedType', value: v })} />}
              {state.step === 4 && <QuizStep4 onAnswer={(v) => dispatch({ type: 'answer', field: 'timing', value: v })} />}
              {state.step === 5 && <QuizStep5 onSubmit={handleContact} submitting={submitting} />}
            </div>

            {state.step > 1 && state.step < 5 && (
              <div className="mt-6">
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'back' })}>← Назад</Button>
              </div>
            )}

            {serverError && <p className="mt-4 text-sm text-red-400">{serverError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
