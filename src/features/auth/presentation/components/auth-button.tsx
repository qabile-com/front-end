import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

interface AuthButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'ghost' | 'alt';
  loading?: boolean;
  children: ReactNode;
}

export function AuthButton({
  variant = 'primary',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: AuthButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl py-3.5 text-[15px] font-extrabold transition-[transform,box-shadow,opacity,background] duration-300 ease-[var(--ease-out-soft)] disabled:cursor-not-allowed disabled:opacity-55 [&>svg]:size-[18px] [&>svg]:shrink-0',
        variant === 'primary' &&
          'text-[#1a0a00] shadow-[0_8px_28px_-8px_var(--glow),inset_0_1px_0_rgba(255,255,255,.36)] [background:var(--fire-grad)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_14px_36px_-8px_var(--glow)]',
        (variant === 'ghost' || variant === 'alt') &&
          'text-ink border-hair enabled:hover:border-hair-2 border backdrop-blur-[14px] [background:var(--glass-2)] enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_22px_-12px_var(--glow)]',
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="size-[18px] shrink-0 animate-[spin_.7s_linear_infinite] rounded-full border-[2.5px] border-[rgba(26,10,0,.25)] border-t-[#1a0a00]" />
      )}
      <span className={cn('inline-flex items-center gap-2.5', loading && 'opacity-60')}>
        {children}
      </span>
    </button>
  );
}
