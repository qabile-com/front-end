'use client';

import { cn } from '@/core/lib/cn';

interface ToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ checked, disabled = false, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-11 shrink-0 justify-self-end rounded-[8px] border transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        checked
          ? 'border-ember bg-[linear-gradient(90deg,var(--color-ember),var(--color-gold))]'
          : 'border-hair bg-black/70',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-5 rounded-[5px] bg-white shadow-[0_6px_12px_-8px_black] transition-[left,right]',
          checked ? 'right-1' : 'left-1',
        )}
      />
    </button>
  );
}
