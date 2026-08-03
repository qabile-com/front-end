'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

type OptionalImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fallbackSrc?: string;
};

export function OptionalImage({ className, alt = '', src, fallbackSrc, ...props }: OptionalImageProps) {
  const [fallbackForSrc, setFallbackForSrc] = useState<string | null>(null);
  const [hiddenSrc, setHiddenSrc] = useState<string | null>(null);

  if (hiddenSrc === src) return null;

  const currentSrc = fallbackSrc && fallbackForSrc === src ? fallbackSrc : src;

  const handleError = () => {
    if (fallbackSrc && fallbackForSrc !== src) {
      setFallbackForSrc(src);
      return;
    }
    setHiddenSrc(src);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element -- intentional: optional asset, no optimizer
    <img
      {...props}
      alt={alt}
      className={cn('absolute inset-0 size-full', className)}
      onError={handleError}
      src={currentSrc}
    />
  );
}
