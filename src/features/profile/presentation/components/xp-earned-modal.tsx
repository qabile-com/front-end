'use client';

import Image from 'next/image';
import { BaseModal, Button } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';

interface XpEarnedModalProps {
  xp: number | null;
  title?: string;
  description?: string;
  onClose: () => void;
}

export function XpEarnedModal({
  xp,
  title = 'عالی بود! ',
  description,
  onClose,
}: XpEarnedModalProps) {
  if (!xp) return null;

  return (
    <BaseModal
      isOpen={!!xp}
      onClose={onClose}
      title={title}
      zIndexClassName="z-[1120]"
      panelClassName="border-hair relative w-full max-w-[430px] overflow-hidden rounded-[24px] border bg-[#050302] px-6 py-8 text-center shadow-[0_34px_110px_-42px_var(--glow)] sm:px-8"
    >
      <div aria-labelledby="xp-earned-title">
        <span className="pointer-events-none absolute inset-x-8 -top-24 h-48 rounded-full blur-3xl [background:radial-gradient(circle,rgba(255,98,0,.35),transparent_70%)]" />

        <div className="relative flex flex-col items-center">
          <Image
            src="/assets/xp-phoenix.webp"
            alt="Phoenix"
            width={192}
            height={192}
            className="mb-4 h-auto w-48 object-contain drop-shadow-[0_0_15px_rgba(255,100,0,0.5)]"
            priority
          />

          <h3
            id="xp-earned-title"
            className="mt-2 text-[20px] leading-tight font-bold tracking-tight text-white md:text-[24px]"
          >
            {title}
            {toPersianDigits(xp)} آتش دریافت کردی
          </h3>

          {description && (
            <p className="text-ink-3 mt-5 min-h-6 text-[13px] font-medium opacity-60">
              {description}
            </p>
          )}

          <Button
            type="button"
            size="md"
            block
            onClick={onClose}
            className="mt-6 h-[48px] w-full rounded-full bg-gradient-to-b from-[#FFCE7A] to-[#FF7000] text-[16px] font-bold text-[#3A1500] shadow-[0_8px_32px_-8px_rgba(255,100,0,0.6)] transition-[box-shadow,opacity] hover:translate-y-0 hover:scale-100 hover:opacity-95 hover:shadow-[0_8px_32px_-8px_rgba(255,100,0,0.6)]"
          >
            ادامه
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
