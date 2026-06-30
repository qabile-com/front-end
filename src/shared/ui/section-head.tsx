import type { ReactNode } from 'react';
import { cn } from '@/core/lib/cn';
import { Eyebrow } from './eyebrow';

interface SectionHeadProps {
  eyebrow: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  center?: boolean;
  className?: string;
}

export function SectionHead({ eyebrow, title, sub, center = false, className }: SectionHeadProps) {
  return (
    <div className={cn('mb-14 max-w-[640px]', center && 'mx-auto text-center', className)}>
      <Eyebrow className="mb-5">{eyebrow}</Eyebrow>
      <h2 className="text-[clamp(26px,3.6vw,44px)] leading-[1.18] font-black tracking-[-0.01em]">
        {title}
      </h2>
      {sub ? (
        <p
          className={cn(
            'text-ink-2 mt-4 max-w-[540px] text-[clamp(14px,1.4vw,17px)] leading-[1.9]',
            center && 'mx-auto',
          )}
        >
          {sub}
        </p>
      ) : null}
    </div>
  );
}
