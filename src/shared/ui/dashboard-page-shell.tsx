import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

type DashboardPageShellSize = 'default' | 'wide' | 'narrow';

interface DashboardPageShellProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: DashboardPageShellSize;
}

const SIZE_CLASS: Record<DashboardPageShellSize, string> = {
  narrow: 'max-w-[920px]',
  default: 'max-w-[1180px]',
  wide: 'max-w-[1360px]',
};

export function DashboardPageShell({
  children,
  className,
  size = 'default',
  ...props
}: DashboardPageShellProps) {
  return (
    <div
      className={cn('mx-auto w-full min-w-0 max-w-full overflow-x-clip', SIZE_CLASS[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
