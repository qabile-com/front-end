'use client';

import { cn } from '@/core/lib/cn';
import { CopyButton } from './copy-button';

interface CopyFieldProps {
  value: string;
  label?: string;
  /** What to show inside the field; defaults to `value` (e.g. pass value without its protocol). */
  displayValue?: string;
  placeholder?: string;
  successMessage?: string;
  /** Text for the copy button; defaults to "کپی". */
  copyLabel?: string;
  /** When true, the displayed value opens `value` in a new tab instead of being plain text. */
  openInNewTab?: boolean;
  className?: string;
}

export function CopyField({
  value,
  label,
  displayValue,
  placeholder = 'در حال ساخت',
  successMessage,
  copyLabel = 'کپی',
  openInNewTab = false,
  className,
}: CopyFieldProps) {
  const shownValue = value ? (displayValue ?? value) : placeholder;
  const valueClassName = 'text-ink-2 min-w-0 flex-1 truncate text-left text-xs font-medium';

  return (
    <div className={className}>
      {label && <h3 className="text-ink-3 mb-2 text-xs font-black">{label}</h3>}
      <div className="flex min-h-12 min-w-0 items-center gap-2 rounded-[12px] border border-[rgba(255,98,0,.22)] bg-[rgba(255,98,0,.08)] px-2.5">
        <CopyButton
          value={value}
          idleLabel={copyLabel}
          iconSize={16}
          successMessage={successMessage}
          className="text-gold shrink-0 flex-row-reverse rounded-[8px] px-2 text-xs"
        />
        {openInNewTab && value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            dir="ltr"
            className={cn(valueClassName, 'hover:text-gold transition-colors')}
          >
            {shownValue}
          </a>
        ) : (
          <p dir="ltr" className={valueClassName}>
            {shownValue}
          </p>
        )}
      </div>
    </div>
  );
}
