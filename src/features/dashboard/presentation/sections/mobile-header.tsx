'use client';

import { Icon } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { PhoenixIcon } from './dashboard-sidebar';

interface MobileHeaderProps {
  title: string;
  level: number;
  streak?: number;
}

export function MobileHeader({ title, level, streak }: MobileHeaderProps) {
  return (
    <header className="border-hair sticky top-0 z-40 flex items-center gap-2.5 border-b px-4 py-3 [backdrop-filter:blur(14px)] [background:rgba(5,3,2,.9)] lg:hidden">
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-[11px] shadow-[0_0_14px_-4px_var(--glow)] [background:var(--fire-grad)]">
        <PhoenixIcon className="size-9" />
      </span>
      <h1 className="flex-1 text-base font-black">{title}</h1>

      <span className="text-gold inline-flex items-center gap-1 rounded-full border border-[rgba(243,186,99,.22)] px-2.5 py-1 text-[11px] font-extrabold [background:rgba(243,186,99,.1)]">
        <Icon name="flame" size={12} />
        سطح {toPersianDigits(level)}
      </span>
      <span className="text-ember inline-flex items-center gap-1 rounded-full border border-[rgba(255,98,0,.2)] px-2.5 py-1 text-[11px] font-extrabold [background:rgba(255,98,0,.1)]">
        <Icon name="flame" size={12} />
        {toPersianDigits(streak ?? 0)} روز
      </span>
    </header>
  );
}
