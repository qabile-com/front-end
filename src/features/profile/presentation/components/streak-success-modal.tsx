'use client';

import { BaseModal, OptionalImage } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { cn } from '@/core/lib/cn';

const WEEK_DAY_LABELS = ['ش', '۱ش', '۲ش', '۳ش', '۴ش', '۵ش', 'ج'];

function OffFireIcon({ className }: { className?: string }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.97324 0.476578C5.12261 0.343009 5.33661 0.272909 5.56455 0.336294C5.74028 0.385157 5.91126 0.457138 6.07341 0.551946C6.73126 0.936582 7.62851 1.55681 8.36428 2.41721C9.10186 3.27973 9.6883 4.39765 9.6883 5.76602C9.6883 7.10481 9.15649 8.10238 8.28118 8.75558C7.41836 9.39946 6.25107 9.68792 5.00041 9.68792C3.74972 9.68792 2.58245 9.39946 1.71963 8.75558C0.844315 8.10238 0.3125 7.10481 0.3125 5.76602C0.3125 3.76642 1.56141 2.30569 2.71724 1.38037C3.14918 1.03459 3.71426 1.30546 3.86984 1.74204C3.97661 2.04162 4.10376 2.28027 4.24278 2.41785C4.2537 2.42867 4.26607 2.43371 4.28628 2.43094C4.30978 2.42773 4.33936 2.41302 4.36132 2.38317C4.59945 2.05942 4.70414 1.52788 4.73216 0.990503C4.74243 0.793421 4.82889 0.605669 4.97324 0.476578ZM5.1518 4.86079C5.05578 4.8136 4.94499 4.8136 4.84895 4.86079C4.43824 5.0626 3.33372 5.70623 3.33372 6.79165C3.33372 7.71213 4.07991 8.12498 5.00039 8.12498C5.92087 8.12498 6.66705 7.71213 6.66705 6.79165C6.66705 5.70623 5.56253 5.0626 5.1518 4.86079Z"
        fill="#6C6C6C"
      />
    </svg>
  );
}

function DimFireIcon({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.95183 0.857876C9.22071 0.617453 9.60591 0.491273 10.0162 0.605367C10.3325 0.693319 10.6403 0.822885 10.9321 0.99354C12.1163 1.68588 13.7313 2.8023 15.0557 4.35101C16.3834 5.90355 17.4389 7.9158 17.4389 10.3789C17.4389 12.7887 16.4817 14.5843 14.9061 15.7601C13.3531 16.9191 11.2519 17.4383 9.00073 17.4383C6.74949 17.4383 4.64841 16.9191 3.09532 15.7601C1.51977 14.5843 0.5625 12.7887 0.5625 10.3789C0.5625 6.77959 2.81054 4.15028 4.89103 2.48471C5.66852 1.8623 6.68567 2.34987 6.96572 3.13571C7.15791 3.67496 7.38677 4.10453 7.63701 4.35218C7.65666 4.37164 7.67893 4.38071 7.71531 4.37573C7.75761 4.36995 7.81086 4.34348 7.85038 4.28974C8.27901 3.70699 8.46744 2.75022 8.51788 1.78294C8.53637 1.4282 8.69199 1.09024 8.95183 0.857876ZM9.27324 8.74946C9.10041 8.66453 8.90098 8.66453 8.72811 8.74946C7.98883 9.11273 6.00069 10.2712 6.00069 12.225C6.00069 13.8819 7.34383 14.625 9.00069 14.625C10.6576 14.625 12.0007 13.8819 12.0007 12.225C12.0007 10.2712 10.0126 9.11273 9.27324 8.74946Z"
        fill="#FF8232"
        fillOpacity="0.6"
      />
    </svg>
  );
}

function BrightFireIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12.2695 1.51611C12.5162 1.2958 12.857 1.18755 13.2207 1.28857C13.6009 1.3943 13.9722 1.5505 14.3242 1.75635C15.8767 2.66408 17.9783 4.11979 19.6943 6.12646C21.4119 8.13499 22.7519 10.7069 22.752 13.8384C22.752 16.9028 21.5431 19.1449 19.5762 20.6128C17.6191 22.0733 14.9347 22.7515 12.001 22.7515C9.06717 22.7515 6.38289 22.0733 4.42578 20.6128C2.45884 19.1449 1.25 16.9028 1.25 13.8384C1.25005 9.26356 4.10743 5.88642 6.83398 3.70361C7.20337 3.40791 7.61437 3.37739 7.98047 3.51221C8.36115 3.65242 8.68112 3.96951 8.81641 4.34912C9.08048 5.09003 9.41669 5.74862 9.83105 6.15869V6.15771C9.88552 6.21166 9.96427 6.27111 10.0723 6.30615C10.178 6.34045 10.277 6.34034 10.3555 6.32959L10.3545 6.32861C10.5465 6.3024 10.7382 6.19545 10.8701 6.01611C11.534 5.11347 11.7884 3.70834 11.8564 2.40283C11.8746 2.05586 12.0278 1.73232 12.2695 1.51611ZM12.585 11.2173C12.2154 11.0357 11.7865 11.0357 11.417 11.2173C10.901 11.4709 9.93833 12.0064 9.09863 12.8315C8.25848 13.6573 7.50098 14.8155 7.50098 16.3003C7.50106 17.5594 8.02104 18.5123 8.87891 19.1333C9.71567 19.7389 10.8313 20.0005 12.001 20.0005C13.1705 20.0005 14.2853 19.7388 15.1221 19.1333C15.9802 18.5123 16.5009 17.5596 16.501 16.3003C16.501 14.8152 15.7427 13.6574 14.9023 12.8315C14.0627 12.0064 13.1011 11.4709 12.585 11.2173Z"
        fill="#FFA04D"
        stroke="#FF6200"
      />
    </svg>
  );
}

// Per-day completion for the current week, as reported by the backend. Not sent by any
// endpoint yet - StreakSuccessModal only renders this row once real data is available.
function StreakWeekProgress({ completedDays }: { completedDays: boolean[] }) {
  const todayIndex = (new Date().getDay() + 1) % 7;

  return (
    <div dir="rtl" className="mt-5 flex items-start justify-between">
      {WEEK_DAY_LABELS.map((label, index) => {
        const isToday = index === todayIndex;
        const isLit = Boolean(completedDays[index]);
        const isNextLit = index < WEEK_DAY_LABELS.length - 1 && isLit && Boolean(completedDays[index + 1]);

        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-ink-3 text-[10px] font-bold sm:text-[11px]">{label}</span>
            <div className="relative flex w-full items-center justify-center">
              {index < WEEK_DAY_LABELS.length - 1 && (
                <div
                  className={cn(
                    'start-1/2 absolute top-1/2 h-0 w-full border-t border-dashed',
                    isNextLit ? 'border-ember/70' : 'border-white/12',
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 grid size-7 shrink-0 place-items-center rounded-full border sm:size-9',
                  isToday
                    ? 'border-[rgba(255,98,0,.9)] shadow-[0_0_0_3px_rgba(255,98,0,.22)] [background:radial-gradient(circle,rgba(255,98,0,.28),rgba(0,0,0,.4))]'
                    : isLit
                      ? 'border-[rgba(255,130,50,.35)] [background:rgba(255,98,0,.12)]'
                      : 'border-white/10 bg-black/30',
                )}
              >
                {isToday ? (
                  <BrightFireIcon className="size-4.5 sm:size-6" />
                ) : isLit ? (
                  <DimFireIcon className="size-3.5 sm:size-[18px]" />
                ) : (
                  <OffFireIcon className="size-2.5" />
                )}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StreakSuccessModalProps {
  isOpen: boolean;
  streak: number;
  freezesRemaining?: number;
  freezeUsed?: boolean;
  /** Per-day completion for the current week. Omit until the backend sends real day-level data. */
  weekProgress?: boolean[] | null;
  onClose: () => void;
}

export function StreakSuccessModal({
  isOpen,
  streak,
  freezesRemaining,
  freezeUsed = false,
  weekProgress,
  onClose,
}: StreakSuccessModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="افزایش زنجیره"
      zIndexClassName="z-[1100]"
      panelClassName="border-hair relative w-full max-w-[530px] rounded-[16px] border bg-[#030201] px-4 py-6 text-center shadow-[0_36px_120px_-48px_var(--glow)] sm:px-8"
    >
      <div className="pointer-events-none relative mx-auto -mb-8 h-[250px] max-w-[340px] sm:h-[300px] sm:max-w-[390px]">
        <OptionalImage
          src="/assets/strick-phoenix.webp"
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

        {weekProgress && weekProgress.length === 7 && (
          <StreakWeekProgress completedDays={weekProgress} />
        )}

        {(freezeUsed || typeof freezesRemaining === 'number') && (
          <p className="text-ink-3 mt-3 text-[12px] leading-6">
            {freezeUsed ? 'یک محافظ زنجیره برای حفظ پروازت مصرف شد. ' : ''}
            {typeof freezesRemaining === 'number'
              ? `${toPersianDigits(freezesRemaining)} محافظ زنجیره باقی مانده.`
              : null}
          </p>
        )}

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
    </BaseModal>
  );
}
