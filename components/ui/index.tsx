'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes } from 'react';
import { useEffect } from 'react';

function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ');
}

type Variant = 'solid' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';
type Tone = 'brand' | 'accent' | 'danger' | 'neutral';

const toneStyles: Record<Tone, string> = {
  brand: 'bg-gradient-to-b from-[#f7d67f] to-[#e8ac1d] text-black border-[#f5cf72] hover:brightness-105 shadow-[0_10px_26px_rgba(247,199,77,0.35)]',
  accent: 'bg-gradient-to-b from-[#ffb36b] to-[#f97316] text-black border-[#ffb36b] hover:brightness-105 shadow-[0_10px_24px_rgba(249,115,22,0.32)]',
  danger: 'bg-gradient-to-b from-[#fb7185] to-[#e11d48] text-white border-[#fb7185] hover:brightness-105 shadow-[0_10px_24px_rgba(225,29,72,0.35)]',
  neutral: 'bg-[#1f0f12]/90 text-text-primary border-[#7a3a2f] hover:border-brand hover:bg-[#2a1418]',
};

const ghostToneStyles: Record<Tone, string> = {
  brand: 'text-brand border-transparent hover:bg-brand/15 hover:text-[#ffe09b]',
  accent: 'text-accent border-transparent hover:bg-accent/15 hover:text-[#ffc084]',
  danger: 'text-danger border-transparent hover:bg-danger/15 hover:text-[#ffc2cb]',
  neutral: 'text-text-secondary border-transparent hover:bg-[#2a1418]/70 hover:text-text-primary',
};

const outlineToneStyles: Record<Tone, string> = {
  brand: 'text-brand border-brand/70 hover:bg-brand/10',
  accent: 'text-accent border-accent/70 hover:bg-accent/10',
  danger: 'text-danger border-danger/70 hover:bg-danger/10',
  neutral: 'text-text-primary border-[#7a3a2f] hover:border-brand hover:bg-[#2a1418]/70',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-sm px-3 py-2 rounded-2xl',
  md: 'text-sm px-4 py-2.5 rounded-2xl',
  lg: 'text-base px-5 py-3 rounded-2xl',
};

interface InteractiveProps {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  state?: 'idle' | 'loading' | 'success' | 'error';
  className?: string;
}

export function Button({
  variant = 'solid',
  size = 'md',
  tone = 'brand',
  state = 'idle',
  className,
  children,
  ...props
}: PropsWithChildren<InteractiveProps & ButtonHTMLAttributes<HTMLButtonElement>>) {
  const variantStyle = variant === 'solid'
    ? toneStyles[tone]
    : variant === 'outline'
      ? outlineToneStyles[tone]
      : ghostToneStyles[tone];

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-semibold tracking-[0.06em] transition duration-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:cursor-not-allowed disabled:opacity-60',
        sizeStyles[size],
        variantStyle,
        state === 'loading' && 'cursor-wait',
        className
      )}
      {...props}
    >
      {state === 'loading' && <Spinner size="sm" />}
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export function Input({ label, helperText, error, className, id, ...props }: InputProps) {
  const elementId = id ?? props.name;
  return (
    <label className="block space-y-2" htmlFor={elementId}>
      {label && <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</span>}
      <input
        id={elementId}
        className={cn(
          'w-full rounded-2xl border border-[#7a3a2f] bg-black/45 px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className
        )}
        {...props}
      />
      {error ? <p className="text-sm text-danger">{error}</p> : helperText ? <p className="text-sm text-text-muted">{helperText}</p> : null}
    </label>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, className, children, error, id, ...props }: SelectProps) {
  const elementId = id ?? props.name;
  return (
    <label className="block space-y-2" htmlFor={elementId}>
      {label && <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</span>}
      <select
        id={elementId}
        className={cn(
          'w-full rounded-2xl border border-[#7a3a2f] bg-black/45 px-4 py-3 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30',
          error && 'border-danger focus:border-danger focus:ring-danger/30',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
    </label>
  );
}

interface ChoiceProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-text-secondary', className)}>
      <input type="checkbox" className="h-4 w-4 rounded border-border-default bg-surface-elevated text-brand focus:ring-brand/40" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Radio({ label, className, ...props }: ChoiceProps) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm text-text-secondary', className)}>
      <input type="radio" className="h-4 w-4 border-border-default bg-surface-elevated text-brand focus:ring-brand/40" {...props} />
      <span>{label}</span>
    </label>
  );
}

export function Badge({ children, tone = 'neutral' as Tone }: { children: ReactNode; tone?: Tone }) {
  const style = tone === 'brand'
    ? 'bg-brand/15 text-brand border-brand/40'
    : tone === 'accent'
      ? 'bg-accent/15 text-accent border-accent/40'
      : tone === 'danger'
        ? 'bg-danger/15 text-danger border-danger/40'
        : 'bg-surface-elevated text-text-secondary border-border-default';

  return <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] shadow-[0_0_14px_rgba(247,199,77,0.12)]', style)}>{children}</span>;
}

export function Alert({ children, tone = 'neutral' as Tone }: { children: ReactNode; tone?: Tone }) {
  const style = tone === 'brand'
    ? 'border-brand/60 bg-brand/10 text-brand'
    : tone === 'accent'
      ? 'border-accent/60 bg-accent/10 text-accent'
      : tone === 'danger'
        ? 'border-danger/60 bg-danger/10 text-danger'
        : 'border-border-default bg-surface text-text-secondary';

  return <div className={cn('rounded-2xl border px-4 py-3 text-sm font-medium backdrop-blur-sm', style)}>{children}</div>;
}

export function Toast({ open, children, tone = 'neutral' as Tone }: { open: boolean; children: ReactNode; tone?: Tone }) {
  if (!open) return null;
  return (
    <div className="fixed right-5 top-5 z-50 max-w-sm animate-fade-in-up">
      <Alert tone={tone}>{children}</Alert>
    </div>
  );
}

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('rounded-[1.75rem] border border-amber-300/35 bg-gradient-to-b from-[#241215]/95 to-[#160b0e]/95 p-6 shadow-[0_18px_45px_rgba(18,8,8,0.45)] backdrop-blur-sm md:p-8', className)}>
      {children}
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl border border-amber-300/45 bg-gradient-to-b from-[#251114]/95 to-[#160a0d]/95 p-6 shadow-[0_20px_52px_rgba(18,8,8,0.55)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-text-primary">{title}</h3>
          <Button variant="ghost" tone="neutral" onClick={onClose} aria-label="Close modal">✕</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-amber-300/25 bg-black/35 p-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            item.value === value
              ? 'bg-gradient-to-b from-[#f7d67f] to-[#e8ac1d] text-black shadow-[0_8px_20px_rgba(247,199,77,0.35)]'
              : 'text-text-secondary hover:bg-[#2a1418]/70 hover:text-text-primary'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<ReactNode>>;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-amber-300/25 bg-black/25">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-black/45 text-text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold uppercase tracking-[0.14em]">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="border-t border-amber-300/20">
              {row.map((cell, cellIndex) => (
                <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-text-secondary">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="grid gap-3 md:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
      {steps.map((step, index) => {
        const status = index < current ? 'done' : index === current ? 'active' : 'todo';
        return (
          <li key={step} className={cn(
            'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
            status === 'done' && 'border-success/70 bg-success/10 text-success',
            status === 'active' && 'border-brand/70 bg-brand/10 text-brand shadow-[0_0_16px_rgba(247,199,77,0.18)]',
            status === 'todo' && 'border-amber-300/20 bg-black/35 text-text-muted'
          )}>
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">{index + 1}</span>
            {step}
          </li>
        );
      })}
    </ol>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-2xl bg-[#2a1418]/75', className)} />;
}

export function Spinner({ size = 'md' as Size }: { size?: Size }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  return <span className={cn('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', sizeClass)} aria-hidden="true" />;
}
