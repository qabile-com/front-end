'use client';

import { Button, Icon } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';

interface XpEarnedModalProps {
  xp: number | null;
  title?: string;
  description?: string;
  onClose: () => void;
}

export function XpEarnedModal({
  xp,
  title = 'امتیاز گرفتی',
  description = 'ققنوس قبیله، رشدت را ثبت کرد.',
  onClose,
}: XpEarnedModalProps) {
  if (!xp) return null;

  return (
    <div className="fixed inset-0 z-[1120] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-earned-title"
        className="border-hair relative w-full max-w-[430px] overflow-hidden rounded-[16px] border bg-[#050302] px-5 py-7 text-center shadow-[0_34px_110px_-42px_var(--glow)] sm:px-8"
      >
        <span className="pointer-events-none absolute inset-x-8 -top-24 h-48 rounded-full blur-3xl [background:radial-gradient(circle,rgba(255,98,0,.35),transparent_70%)]" />
        <div className="relative">
          <div className="mx-auto grid size-20 place-items-center rounded-[24px] border border-[rgba(255,98,0,.36)] text-[#1a0a00] shadow-[0_18px_48px_-24px_var(--glow)] [background:var(--fire-grad)]">
            <Icon name="flame" size={34} />
          </div>

          <p className="text-ink-3 mt-5 text-[12px] font-bold">پاداش جدید</p>
          <h3 id="xp-earned-title" className="mt-2 text-[22px] font-black">
            {title}
          </h3>

          <div className="mx-auto mt-5 w-fit rounded-[18px] border border-[rgba(243,186,99,.28)] bg-[rgba(243,186,99,.08)] px-7 py-4">
            <span className="text-gradient-fire block text-[42px] leading-none font-black">
              +{toPersianDigits(xp)}
            </span>
            <span className="text-gold mt-1 block text-[13px] font-black">XP</span>
          </div>

          <p className="text-ink-2 mt-5 text-[13px] leading-7">{description}</p>

          <Button
            type="button"
            variant="primary"
            size="md"
            block
            onClick={onClose}
            className="mt-6 h-11 rounded-[8px] text-[13px]"
          >
            ادامه
          </Button>
        </div>
      </div>
    </div>
  );
}
