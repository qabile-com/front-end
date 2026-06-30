'use client';

import { useEffect, useRef, useState } from 'react';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';

interface CountUpProps {
  to: number;

  decimals?: number;

  suffix?: string;

  duration?: number;
}

export function CountUp({ to, decimals = 0, suffix = '', duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) requestAnimationFrame(tick);
          else setValue(to);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, duration]);

  const display =
    decimals > 0 ? toPersianDigits(value.toFixed(decimals)) : formatPersianNumber(value);

  return (
    <span ref={ref}>
      {display}
      {suffix ? <span className="text-gold text-[0.56em]">{suffix}</span> : null}
    </span>
  );
}
