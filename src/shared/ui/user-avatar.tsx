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
  children?: ReactNode;
}

export function UserAvatar({ name, avatar, className, imageClassName, children }: UserAvatarProps) {
  const isImage = Boolean(
    avatar && !avatar.startsWith('linear-gradient') && !avatar.startsWith('radial-gradient'),
  );

  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)] font-black text-white',
        className,
      )}
      style={{ background: isImage ? undefined : (avatar ?? undefined) }}
    >
      {isImage && avatar ? (
        <OptionalImage src={avatar} alt={name} className={cn('object-cover', imageClassName)} />
      ) : (
        getAvatarInitial(name)
      )}
      {children}
    </span>
  );
}
