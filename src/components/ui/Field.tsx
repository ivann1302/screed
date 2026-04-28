import clsx from 'clsx';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

const inputCls =
  'w-full bg-surface border-2 border-border text-text placeholder:text-muted px-4 py-3 outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 motion-safe:transition';

export function Field({
  label, error, hint, children,
}: { label: string; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
      {!error && hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...rest }, ref,
) {
  return <input ref={ref} className={clsx(inputCls, invalid && 'border-danger/60', className)} {...rest} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, ...rest }, ref,
) {
  return <textarea ref={ref} className={clsx(inputCls, 'resize-y', invalid && 'border-danger/60', className)} {...rest} />;
});
