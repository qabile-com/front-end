import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';

interface PanelProps {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Panel({ title, action, children, className, bodyClassName }: PanelProps) {
  return (
    <div
      className={cn(
        'border-hair overflow-hidden rounded-[20px] border [background:var(--glass)]',
        className,
      )}
    >
      {(title || action) && (
        <div className="border-hair flex items-center justify-between border-b px-5 py-[18px]">
          <h3 className="text-[15.5px] font-extrabold">{title}</h3>
          {action}
        </div>
      )}
      <div className={cn('p-5', bodyClassName)}>{children}</div>
    </div>
  );
}
