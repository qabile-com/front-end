'use client';

import { useState, type ImgHTMLAttributes } from 'react';
import { cn } from '@/core/lib/cn';

type OptionalImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  fallbackSrc?: string;
  /** When true (default), absolutely fills a `relative` parent. Set to false to size the image by its own natural dimensions instead. */
  fill?: boolean;
};

export function OptionalImage({
  className,
  alt = '',
  src,
  fallbackSrc,
  fill = true,
  ...props
}: OptionalImageProps) {
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
      className={cn(fill && 'absolute inset-0 size-full', className)}
      onError={handleError}
      src={currentSrc}
    />
  );
}
