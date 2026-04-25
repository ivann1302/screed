type Props = { lines: string[]; rotation?: number };

export function Stamp({ lines, rotation = -4 }: Props) {
  if (lines.length === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="hidden sm:inline-block border-2 border-accent text-accent uppercase font-display tracking-widest text-xs px-3 py-2 bg-accent/5 leading-tight text-center"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {lines.map((l, i) => (
        <div key={i} className={i === 0 ? 'font-bold' : 'opacity-70 text-[10px] tracking-[0.18em] mt-1'}>
          {l}
        </div>
      ))}
    </div>
  );
}
