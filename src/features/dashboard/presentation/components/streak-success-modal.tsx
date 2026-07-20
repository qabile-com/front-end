'use client';

import { OptionalImage } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';

interface StreakSuccessModalProps {
  isOpen: boolean;
  streak: number;
  onClose: () => void;
}

export function StreakSuccessModal({ isOpen, streak, onClose }: StreakSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm">
      <div className="border-hair relative w-full max-w-[530px] overflow-visible rounded-[16px] border bg-[#030201] px-4 pb-8 pt-[260px] text-center shadow-[0_36px_120px_-48px_var(--glow)] sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 -top-8 mx-auto h-[330px] max-w-[390px]">
          <OptionalImage
            src="/assets/strick-phoenix.png"
            alt=""
            aria-hidden="true"
            className="object-contain drop-shadow-[0_26px_45px_rgba(255,98,0,.25)]"
          />
        </div>

        <div className="border-hair relative rounded-[11px] border px-5 py-7 [background:linear-gradient(180deg,rgba(243,186,99,.08),rgba(255,98,0,.035))]">
          <p className="text-ink-2 text-[14px] leading-7">یک روز دیگر از پروازت ثبت شد.</p>
          <h3 className="text-gold mt-4 text-[24px] font-black sm:text-[26px]">
            زنجیره‌ات به {toPersianDigits(streak)} روز رسید.
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="from-ember to-gold mt-6 h-12 w-full rounded-[8px] bg-gradient-to-l text-[14px] font-black text-black shadow-[0_18px_40px_-22px_var(--glow)] transition-transform hover:-translate-y-0.5"
          >
            ادامه
          </button>

          <p className="text-ink-3 mt-5 text-[12px] leading-6">
            قبیله به استمرار تو افتخار می‌کند، ادامه بده.
          </p>
        </div>
      </div>
    </div>
  );
}
