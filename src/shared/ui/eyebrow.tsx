import type { ComponentProps } from 'react';
import { cn } from '@/core/lib/cn';

export function Eyebrow({ className, children, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'border-hair text-gold inline-flex items-center gap-1.75 rounded-full border py-1.5 ps-3.5 pe-3 text-[12px] font-bold tracking-[0.04em] [backdrop-filter:blur(var(--glass-blur))] [background:var(--glass)]',
        className,
      )}
      {...props}
    >
      <span className="bg-ember inline-block size-1.5 rounded-full shadow-[0_0_8px_var(--color-ember)]" />
      {children}
    </span>
  );
}
