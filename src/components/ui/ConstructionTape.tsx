export function ConstructionTape() {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="h-10 w-full border-y-2 border-accent"
      style={{
        backgroundImage:
          'repeating-linear-gradient(135deg, var(--tw-color-accent, #ea580c) 0 12px, var(--tw-color-bg, #1f2937) 12px 24px)',
      }}
    />
  );
}
