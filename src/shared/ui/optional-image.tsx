'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

type OptionalImageProps = ImgHTMLAttributes<HTMLImageElement> & { src: string };

export function OptionalImage({ className, alt = '', ...props }: OptionalImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional: optional asset, no optimizer
    <img
      alt={alt}
      className={cn('absolute inset-0 size-full', className)}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
