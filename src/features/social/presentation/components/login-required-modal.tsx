'use client';

import Link from 'next/link';
import { createAuthRedirectHref } from '@/core/auth/redirect';
import { BaseModal, Icon } from '@/shared/ui';

interface LoginRequiredModalProps {
  isOpen: boolean;
  currentPath: string;
  title?: string;
  message?: string;
  onClose: () => void;
}

export function LoginRequiredModal({
  isOpen,
  currentPath,
  title = 'برای ادامه وارد شوید',
  message = 'برای لایک، کامنت و رفتن به بخش‌های دیگر قبیله باید وارد حساب کاربری شوید.',
  onClose,
}: LoginRequiredModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      panelClassName="w-full max-w-sm"
      contentClassName="rounded-[24px] border border-[var(--color-hair)] bg-[var(--color-panel)] p-5 shadow-[0_28px_80px_-48px_var(--glow)]"
    >
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-[rgba(243,186,99,.24)] bg-black/25 text-gold">
          <Icon name="lock" size={22} />
        </span>
        <h2 className="text-ink mt-4 text-lg font-black">{title}</h2>
        <p className="text-ink-3 mt-2 text-sm leading-7">{message}</p>

        <div className="mt-5 grid gap-2">
          <Link
            href={createAuthRedirectHref(currentPath)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-transparent px-5 text-sm font-extrabold text-[#1a0a00] transition-[transform,opacity,box-shadow] [background:var(--fire-grad)] shadow-[0_8px_28px_-6px_var(--glow)] hover:-translate-y-0.5 hover:opacity-95"
          >
            <Icon name="lock" size={17} />
            ورود / ثبت نام
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-bold transition-colors"
          >
            ادامه مشاهده
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
