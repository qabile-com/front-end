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

  const fallbackBackground = isImage ? undefined : (avatar ?? undefined);
  const avatarContent =
    isImage && avatar ? (
      <OptionalImage src={avatar} alt={name} className={cn('rounded-full object-cover', imageClassName)} />
    ) : (
      getAvatarInitial(name)
    );

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)] font-black text-white',
        className,
      )}
      style={!hasRebirthRing ? { background: fallbackBackground } : undefined}
    >
      {hasRebirthRing ? (
        <span className="absolute inset-0 grid place-items-center rounded-full p-[2.5px] [background:var(--fire-grad)] shadow-[0_0_14px_2px_rgba(255,140,40,.65)]">
          <span
            className="relative grid size-full place-items-center overflow-hidden rounded-full"
            style={{ background: fallbackBackground }}
          >
            {avatarContent}
          </span>
        </span>
      ) : (
        avatarContent
      )}
      {children}
    </span>
  );
}
