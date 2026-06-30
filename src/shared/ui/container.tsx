import type { ComponentProps } from 'react';
import { cn } from '@/core/lib/cn';

export function Container({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('max-w-site relative z-[2] mx-auto w-full px-5 sm:px-8', className)}
      {...props}
    />
  );
}
