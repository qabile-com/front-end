import type { ComponentProps } from 'react';
import { cn } from '@/core/lib/cn';

export function GlassCard({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('glass', className)} {...props} />;
}
