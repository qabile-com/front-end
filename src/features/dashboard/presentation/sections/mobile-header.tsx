'use client';

import Link from 'next/link';
import { Icon } from '@/shared/ui';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import type { CurrentUser } from '../../domain/dashboard.types';

interface MobileHeaderProps {
  title: string;
  user: CurrentUser;
  showAiChatAction?: boolean;
}

export function MobileHeader({ title, user, showAiChatAction = false }: MobileHeaderProps) {
  const avatarIsImage = user.avatar.startsWith('/') || user.avatar.startsWith('http');

  return (
    <header
      dir="ltr"
      className="border-hair sticky top-0 z-40 flex min-h-[72px] items-center justify-between gap-3 border-b px-4 py-3 pt-[env(safe-area-inset-top)] [backdrop-filter:blur(14px)] [background:rgba(5,3,2,.94)] lg:hidden"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <Link
          href="/profile"
          className="border-hair grid size-12 shrink-0 place-items-center overflow-hidden rounded-full border text-base font-black text-white shadow-[0_12px_34px_-18px_var(--glow)] [background:var(--fire-grad)]"
          style={{ background: avatarIsImage ? undefined : user.avatar }}
        >
          {avatarIsImage ? (
            <img src={user.avatar} alt="" className="size-full object-cover" />
          ) : (
            user.initial
          )}
        </Link>

        <span
          dir="rtl"
          className="text-ember border-hair inline-flex min-h-11 shrink items-center justify-center gap-2 rounded-full border px-3 text-[13px] font-black whitespace-nowrap [background:rgba(255,98,0,.09)]"
        >
          <span className="tabular-nums">{toPersianDigits(user.streak ?? 0)}</span>
          <span className="text-[11px]">روز</span>
        </span>

        <span
          dir="rtl"
          className="text-ember border-hair inline-flex min-h-11 shrink items-center justify-center gap-1.5 rounded-full border px-3 text-[13px] font-black whitespace-nowrap [background:rgba(255,98,0,.09)]"
        >
          <span className="tabular-nums">{formatPersianNumber(user.xp)}</span>
          <Icon name="flame" size={18} />
        </span>
      </div>

      <Link
        href="/ai"
        dir="rtl"
        className="text-ink border-hair inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[18px] border px-3.5 text-[13px] font-black transition-[transform,border-color,color] duration-300 [background:rgba(255,160,100,.055)] active:scale-95"
      >
        <Icon name="adam-chat" size={20} />
        چت با آدم
      </Link>
    </header>
  );
}
