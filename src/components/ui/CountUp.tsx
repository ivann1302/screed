import { useEffect, useRef, useState } from 'react';

type Props = { target: number; suffix?: string; label: string; duration?: number };

export function CountUp({ target, suffix = '', label, duration = 1500 }: Props) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setVal(target); return; }

    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setVal(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className="border-t-[3px] border-accent pt-2">
      <div className="font-display text-4xl sm:text-5xl leading-none">
        {val}{suffix && <span className="text-accent">{suffix}</span>}
      </div>
      <div className="text-xs uppercase tracking-widest text-muted mt-2">{label}</div>
    </div>
  );
}
