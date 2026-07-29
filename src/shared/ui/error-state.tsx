'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from './icon';
import { cn } from '@/core/lib/cn';

type ErrorStateTone = 'danger' | 'warning' | 'info';

interface ErrorStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: IconName;
}

interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  action?: ErrorStateAction;
  secondaryAction?: ErrorStateAction;
  icon?: IconName;
  tone?: ErrorStateTone;
  compact?: boolean;
  className?: string;
}

const TONE_CLASS: Record<ErrorStateTone, string> = {
  danger: 'text-danger [background:rgba(255,90,90,.1)] border-[rgba(255,90,90,.2)]',
  warning: 'text-gold [background:rgba(243,186,99,.1)] border-[rgba(243,186,99,.22)]',
  info: 'text-ember [background:rgba(255,98,0,.1)] border-[rgba(255,98,0,.2)]',
};

export function ErrorState({
  title = 'مشکلی پیش آمد',
  message = 'لطفاً دوباره تلاش کن. اگر مشکل ادامه داشت، کمی بعد برگرد.',
  action,
  secondaryAction,
  icon = 'shield',
  tone = 'danger',
  compact = false,
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        'border-hair relative mx-auto flex w-full max-w-lg flex-col items-center overflow-hidden rounded-3xl border text-center [background:var(--glass)]',
        compact ? 'gap-3 px-5 py-5' : 'gap-4 px-6 py-8',
        className,
      )}
    >
      <span
        className={cn(
          'grid place-items-center rounded-2xl border',
          compact ? 'size-11' : 'size-14',
          TONE_CLASS[tone],
        )}
      >
        <Icon name={icon} size={compact ? 20 : 24} />
      </span>
      <div>
        <h2 className={cn('font-black', compact ? 'text-base' : 'text-xl')}>{title}</h2>
        <p className="text-ink-3 mt-2 text-sm leading-7">{message}</p>
      </div>
      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap justify-center gap-3">
          {action && <ErrorStateButton action={action} primary />}
          {secondaryAction && <ErrorStateButton action={secondaryAction} />}
        </div>
      )}
    </section>
  );
}

function ErrorStateButton({
  action,
  primary = false,
}: {
  action: ErrorStateAction;
  primary?: boolean;
}) {
  const className = cn(
    'inline-flex h-11 min-w-28 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black transition-[transform,opacity,border-color] hover:-translate-y-0.5',
    primary
      ? 'text-[#1a0a00] shadow-[0_8px_28px_-12px_var(--glow)] [background:var(--fire-grad)]'
      : 'text-ink border-hair hover:border-hair-2 border [background:var(--glass-2)]',
  );

  const content = (
    <>
      {action.icon && <Icon name={action.icon} size={16} />}
      {action.label}
    </>
  );

  if (action.href) {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  );
}

export function getErrorMessage(error: unknown, fallback = 'ارتباط برقرار نشد. لطفاً دوباره تلاش کن.') {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error.trim()) return error;
  return fallback;
}
