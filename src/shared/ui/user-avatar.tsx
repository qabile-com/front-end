'use client';

import { getAvatarInitial } from '@/core/lib/avatar';
import { cn } from '@/core/lib/cn';
import { OptionalImage } from './optional-image';
import type { ReactNode } from 'react';

interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  className?: string;
  imageClassName?: string;
  rebirthCount?: number;
  children?: ReactNode;
}

export function UserAvatar({
  name,
  avatar,
  className,
  imageClassName,
  rebirthCount,
  children,
}: UserAvatarProps) {
  const isImage = Boolean(
    avatar && !avatar.startsWith('linear-gradient') && !avatar.startsWith('radial-gradient'),
  );
  const hasRebirthRing = (rebirthCount ?? 0) >= 2;

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)] font-black text-white',
        className,
      )}
      style={{ background: isImage ? undefined : (avatar ?? undefined) }}
    >
      {hasRebirthRing && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 -z-10 rounded-full [background:var(--fire-grad)] shadow-[0_0_16px_3px_rgba(255,140,40,.7),0_0_4px_1px_rgba(255,200,120,.9)]"
        />
      )}
      {isImage && avatar ? (
        <OptionalImage src={avatar} alt={name} className={cn('rounded-full object-cover', imageClassName)} />
      ) : (
        getAvatarInitial(name)
      )}
      {children}
    </span>
  );
}
