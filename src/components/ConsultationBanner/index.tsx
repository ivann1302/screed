import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useScrollProgress } from './useScrollTrigger';
import { ConsultationCard } from './ConsultationCard';
import { uiText } from '@/config/site';

const SHOWN_KEY = 'consultationShown';
const LEAD_KEY = 'leadSubmitted';

export default function ConsultationBanner() {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const progress = useScrollProgress();
  const [fabVisible, setFabVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Initial check: hide entirely if lead already submitted in this session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(LEAD_KEY)) setHidden(true);
  }, []);

  // FAB visibility based on scrollY > 200
  useEffect(() => {
    function onScroll() { setFabVisible(window.scrollY > 200); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-open at 50% scroll, once per session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hidden) return;
    if (progress >= 0.5
      && !sessionStorage.getItem(SHOWN_KEY)
      && !sessionStorage.getItem(LEAD_KEY)) {
      sessionStorage.setItem(SHOWN_KEY, '1');
      setOpen(true);
    }
  }, [progress, hidden]);

  if (hidden) return null;

  function handleClose() { setOpen(false); }
  function handleSuccess() {
    sessionStorage.setItem(LEAD_KEY, '1');
    setSuccess(true);
    setTimeout(() => {
      setOpen(false);
      setHidden(true);
    }, 1800);
  }

  return (
    <>
      {fabVisible && (
        <button
          aria-label={uiText.consultation.fabAria}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-accent text-bg shadow-2xl shadow-accent/40 motion-safe:transition hover:bg-accentDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}
      <ConsultationCard
        open={open}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
      {success && (
        <div role="status" className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-accent text-bg px-6 py-4 font-display uppercase tracking-wider shadow-xl border-2 border-bg">
            {uiText.consultation.successToast}
          </div>
        </div>
      )}
    </>
  );
}
