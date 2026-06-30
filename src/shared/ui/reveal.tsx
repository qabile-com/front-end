'use client';

import { useEffect, useRef, useState, type ComponentProps, type ElementType } from 'react';
import { cn } from '@/core/lib/cn';

interface RevealProps extends ComponentProps<'div'> {
  delay?: 1 | 2 | 3 | 4;

  as?: ElementType;
}

export function Reveal({ delay, as, className, ...props }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      data-d={delay}
      className={cn(shown && 'in', className)}
      {...props}
    />
  );
}
