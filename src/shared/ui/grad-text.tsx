import type { ComponentProps } from 'react';
import { cn } from '@/core/lib/cn';

export function GradText({ className, ...props }: ComponentProps<'span'>) {
  return <span className={cn('text-gradient-fire', className)} {...props} />;
}
