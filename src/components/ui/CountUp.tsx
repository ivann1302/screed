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
            const eased = 1 - Math.pow(1 - t, 3);
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
    <div ref={ref} className="p-6 sm:p-8 flex flex-col items-center text-center">
      <div className="font-display text-5xl sm:text-6xl lg:text-7xl leading-none text-accent">
        {val}{suffix}
      </div>
      <div className="mt-3 text-xs uppercase tracking-widest text-muted">{label}</div>
    </div>
  );
}
