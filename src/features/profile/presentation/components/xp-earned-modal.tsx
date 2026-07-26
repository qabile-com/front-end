'use client';

import { Button } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';

interface XpEarnedModalProps {
  xp: number | null;
  title?: string;
  description?: string;
  onClose: () => void;
}

export function XpEarnedModal({ xp, title = 'عالی بود! ', description, onClose }: XpEarnedModalProps) {
  if (!xp) return null;

  return (
    <div className="fixed inset-0 z-[1120] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-earned-title"
        className="border-hair relative w-full max-w-[430px] overflow-hidden rounded-[24px] border bg-[#050302] px-6 py-8 text-center shadow-[0_34px_110px_-42px_var(--glow)] sm:px-8"
      >
        {/* Background Glow Effect */}
        <span className="pointer-events-none absolute inset-x-8 -top-24 h-48 rounded-full blur-3xl [background:radial-gradient(circle,rgba(255,98,0,.35),transparent_70%)]" />

        <div className="relative flex flex-col items-center">
          {/* Image Section - User to replace src with their asset path */}
          <img
            src="/assets/xp-phoenix.webp"
            alt="Phoenix"
            className="mb-4 h-auto w-48 object-contain drop-shadow-[0_0_15px_rgba(255,100,0,0.5)]"
          />

          {/* Title / XP Text */}
          <h3
            id="xp-earned-title"
            className="mt-2 text-[20px] leading-tight font-bold tracking-tight text-white md:text-[24px]"
          >
            {title}
            {toPersianDigits(xp)} آتش دریافتی کردی
          </h3>

          {/* Continue Button */}
          <Button
            type="button"
            size="md"
            block
            onClick={onClose}
            className="mt-6 h-[48px] w-full rounded-full bg-gradient-to-b from-[#FFCE7A] to-[#FF7000] text-[16px] font-bold text-[#3A1500] shadow-[0_8px_32px_-8px_rgba(255,100,0,0.6)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_40px_-6px_rgba(255,100,0,0.8)]"
          >
            ادامه
          </Button>

          {/* Bottom Caption */}
          {description && (
            <p className="text-ink-3 mt-5 text-[13px] font-medium opacity-60">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
