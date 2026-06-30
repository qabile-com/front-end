import { forwardRef, type ComponentProps } from 'react';
import { cn } from '@/core/lib/cn';

interface InputProps extends ComponentProps<'input'> {
  invalid?: boolean;

  hasToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, hasToggle, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      dir="rtl"
      className={cn(
        'text-ink placeholder:text-ink-3 w-full rounded-[11px] border px-3.5 py-[13px] text-[15px] outline-none [background:var(--glass-2)]',
        'transition-[border-color,box-shadow,background] duration-300',
        'focus:border-[rgba(255,98,0,.42)] focus:bg-[rgba(255,160,100,.065)] focus:shadow-[0_0_0_3px_rgba(255,98,0,.12)]',
        invalid
          ? 'border-[rgba(255,90,90,.5)] shadow-[0_0_0_3px_rgba(255,90,90,.10)]'
          : 'border-hair',
        hasToggle && 'ps-11',
        className,
      )}
      {...props}
    />
  );
});
