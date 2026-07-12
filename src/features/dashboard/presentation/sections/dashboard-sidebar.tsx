'use client';

import Link from 'next/link';
import { Icon, OptionalImage, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import type { CurrentUser, NavItem, DashboardTab } from '../../domain/dashboard.types';
import { toPersianDigits } from '@/core/lib/persian';

interface SidebarProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  user: CurrentUser;
  nav: NavItem[];
}

export function DashboardSidebar({ active, onChange, user, nav }: SidebarProps) {
  const xpPct = Math.round((user.xp / user.xpMax) * 100);

  return (
    <aside className="border-hair fixed inset-y-0 inset-s-0 z-50 hidden w-65 shrink-0 flex-col border-e px-4.5 py-7 [backdrop-filter:blur(24px)] [background:rgba(8,5,2,.92)] lg:flex">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid size-10 place-items-center overflow-hidden rounded-[13px] shadow-[0_0_18px_-4px_var(--glow)] [background:var(--fire-grad)]">
          <PhoenixIcon className="size-10" />
        </span>
        <span className="leading-tight">
          <b className="text-[17px] font-extrabold">قبیله ققنوس</b>
          <small className="text-ink-3 block text-[10px] tracking-[0.08em]">PHOENIX TRIBE</small>
        </span>
      </div>

      <div className="border-hair mb-5 flex items-center gap-3 rounded-[20px] border px-3.5 py-3 [background:var(--glass-2)]">
        <span
          className="grid size-10 place-items-center rounded-full border-2 border-[rgba(255,130,50,.3)] text-base font-black text-[#1a0a00]"
          style={{ background: user.avatar }}
        >
          {user.initial}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <b className="block truncate text-[13.5px] font-extrabold">{user.name}</b>
          <small className="text-gold text-[11px]">{user.title}</small>
        </span>
        <span className="rounded-[7px] px-2 py-0.5 text-[11px] font-extrabold text-[#1a0a00] [background:var(--fire-grad)]">
          L{toPersianDigits(user.level)}
        </span>
      </div>

      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="text-ink-2 flex items-center gap-1.5">
            <PhoenixIcon className="size-3.5 rounded-full" />
            تجربه (XP)
          </span>
          <span className="text-gold font-bold tabular-nums">
            {toPersianDigits(user.xp.toLocaleString('en-US').replace(/,/g, '٬'))} /{' '}
            {toPersianDigits(user.xpMax.toLocaleString('en-US').replace(/,/g, '٬'))}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full [background:var(--glass-2)]">
          <div
            className="h-full rounded-full [background:var(--fire-grad)]"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] font-semibold transition-colors',
                isActive
                  ? 'text-gold border border-[rgba(255,98,0,.18)] font-extrabold shadow-[0_4px_16px_-8px_rgba(255,98,0,.25)] [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]'
                  : 'text-ink-3 hover:text-ink border border-transparent hover:[background:var(--glass-2)]',
              )}
            >
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-[11px]',
                  isActive ? '[background:rgba(255,98,0,.18)]' : '[background:var(--glass-2)]',
                )}
              >
                <Icon name={item.icon as IconName} size={20} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <Link
        href="/"
        className="text-ink-3 hover:text-danger mb-2 flex items-center gap-3 rounded-[14px] border border-transparent px-3.5 py-3 text-[14.5px] font-semibold transition-colors hover:border-[rgba(255,90,90,.18)] hover:[background:rgba(255,90,90,.08)]"
      >
        <span className="grid size-9 place-items-center rounded-[11px] [background:var(--glass-2)]">
          <Icon name="logout" size={20} />
        </span>
        خروج از حساب
      </Link>

      <Link
        href="#"
        className="flex items-center gap-2.5 rounded-[20px] border border-[rgba(255,100,30,.22)] p-3.5 [background:linear-gradient(135deg,rgba(204,67,8,.15),rgba(255,98,0,.07))]"
      >
        <AdamAvatar className="size-11" />
        <span className="leading-tight">
          <span className="mb-1 inline-flex items-center gap-1 rounded-xs px-1.5 py-1 text-[10px] font-extrabold text-[#1a0a00] [background:var(--fire-grad)]">
            <Icon name="sparkle" size={9} />
            منتور هوشمند
          </span>
          <b className="my-1 block text-[13.5px] font-extrabold">از آدم بپرس</b>
          <span className="text-ink-2 text-[12px]">همیشه آنلاین</span>
        </span>
      </Link>
    </aside>
  );
}

export function PhoenixIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative grid size-5.5 place-items-center text-[#1a0a00]', className)}>
      {/* <Icon name="flame" size={28} className="text-[#1a0a00]" /> */}
      <OptionalImage src="/assets/phoenix_badge.webp" alt="" className="object-contain" />
    </span>
  );
}

export function AdamAvatar({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'relative grid shrink-0 place-items-center overflow-hidden rounded-full [background:var(--fire-grad)]',
        className,
      )}
    >
      <Icon name="ai" size={20} className="text-[#1a0a00]" />
      <OptionalImage
        src="/assets/adam-ai.png"
        alt="آدم"
        className="object-cover mix-blend-lighten"
      />
    </span>
  );
}
