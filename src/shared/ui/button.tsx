import type { ComponentProps } from 'react';
import { cn } from '@/core/lib/cn';

type ButtonVariant = 'primary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-[9px] rounded-xl border border-transparent text-[14.5px] font-bold whitespace-nowrap transition-[transform,box-shadow,background,border-color,opacity] duration-[350ms] ease-[var(--ease-out-soft)] disabled:opacity-50 disabled:pointer-events-none [&>svg]:size-[17px] [&>svg]:shrink-0';

const variants: Record<ButtonVariant, string> = {
  primary:
    'text-[#1a0a00] font-extrabold [background:var(--fire-grad)] shadow-[0_8px_28px_-6px_var(--glow),inset_0_1px_0_rgba(255,255,255,.38)] hover:-translate-y-0.5 hover:opacity-[.94] hover:shadow-[0_14px_40px_-8px_var(--glow),inset_0_1px_0_rgba(255,255,255,.46)]',

  ghost:
    'text-ink border-hair [background:var(--glass-2)] [backdrop-filter:blur(var(--glass-blur))] hover:-translate-y-0.5 hover:border-hair-2 hover:shadow-[0_10px_28px_-12px_var(--glow)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-[20px] py-[10px] text-[13px]',
  md: 'px-[26px] py-[13px]',
  lg: 'px-8 py-[15px] text-[15px] rounded-[13px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], block && 'w-full', className)}
      {...props}
    />
  );
}
