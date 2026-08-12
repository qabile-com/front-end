'use client';

import { BaseModal, Button, Icon, OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { Achievement } from '@/features/dashboard/domain/dashboard.types';
import { DEFAULT_ACHIEVEMENT_IMAGE } from '@/features/dashboard/domain/achievement-normalizer';
import {
  getAchievementConditions,
  getAchievementCount,
  getAchievementImage,
  getAchievementProgress,
  isAchievementEarned,
} from './achievement-helpers';

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
  onClaim?: (achievement: Achievement) => void;
  isClaiming?: boolean;
  /** Hides the claim/share actions - use when viewing another user's achievements. */
  readOnly?: boolean;
}

export function AchievementModal({
  achievement,
  onClose,
  onShare,
  onClaim,
  isClaiming = false,
  readOnly = false,
}: AchievementModalProps) {
  const count = getAchievementCount(achievement);
  const conditions = getAchievementConditions(achievement);
  const progress = getAchievementProgress(achievement);
  const isEarned = isAchievementEarned(achievement);
  const canShare = !readOnly && isEarned && (achievement.isShareable ?? true);
  const canClaim =
    !readOnly && Boolean(onClaim) && achievement.triggerType === 'manual_daily_check' && !isEarned;

  const handleShare = async () => {
    if (!canShare) return;
    if (onShare) {
      onShare();
      return;
    }
    const text = `من دستاورد ${achievement.label} را در قبیله ققنوس دریافت کردم.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: achievement.label, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showSuccess('متن اشتراک‌گذاری کپی شد');
    } catch {
      showError('اشتراک‌گذاری انجام نشد');
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={achievement.label}
      zIndexClassName="z-[1000]"
      panelClassName="border-hair relative w-full max-w-[426px] overflow-hidden rounded-[10px] border bg-[#050302] shadow-[0_28px_90px_-40px_var(--glow)]"
      contentClassName="modal-scroll px-4 py-5 sm:px-8 sm:py-7"
    >
      <button
        type="button"
        onClick={onClose}
        className="text-gold hover:text-gold-lite mb-4 flex min-h-11 items-center gap-1.5 text-[13px] font-bold transition-colors"
      >
        <Icon name="arrow-right" size={16} />
        بازگشت
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div
            className={cn(
              'relative size-[200px] overflow-hidden rounded-[5px] border border-[rgba(255,98,0,.72)] bg-black shadow-[0_26px_40px_-32px_var(--glow)]',
              !isEarned && 'grayscale',
            )}
          >
            <OptionalImage
              src={getAchievementImage(achievement)}
              alt={achievement.label}
              className="object-cover"
              fallbackSrc={DEFAULT_ACHIEVEMENT_IMAGE}
              loading="lazy"
            />
          </div>
          {isEarned && count > 1 && (
            <span className="text-gold absolute inset-x-0 -bottom-6 mx-auto grid size-13 place-items-center rounded-full border-2 border-[#050302] bg-[#120904] text-lg font-black shadow-[0_0_0_1px_rgba(255,98,0,.65),0_12px_26px_-14px_var(--glow)]">
              {toPersianDigits(count)}x
            </span>
          )}
        </div>

        <h3
          className={cn(
            'text-gold mt-9 text-[24px] font-black',
            !(isEarned && count > 1) && 'mt-6',
          )}
        >
          {achievement.label}
        </h3>
        <p className="text-ink-2 mt-3 text-[13px] leading-7">
          با کسب این دستاورد
          <span className="text-ember"> {toPersianDigits(achievement.xpEarned)} آتش </span>
          دریافت میکنید
        </p>

        {progress && (
          <div className="mt-5 w-full">
            <div className="mb-2 flex items-baseline justify-between gap-3 text-[12px] font-black">
              <span className="text-ink-3">پیشرفت</span>
              <span className="text-gold tabular-nums">
                {toPersianDigits(progress.done)} از {toPersianDigits(progress.threshold)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
              <div
                className="h-full rounded-full transition-[width] duration-500 [background:var(--fire-grad)]"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-[13px] sm:justify-between">
          <span className="text-ink-3 font-bold">شرایط دریافت:</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {conditions.map((condition) => (
              <span
                key={condition.id}
                className={cn(
                  'inline-flex items-center gap-2 leading-7 font-bold',
                  condition.passed ? 'text-gold' : 'text-ink-4 grayscale',
                )}
              >
                <Icon name="check-inner-empty" size={24} className="shrink-0" />
                <span>{condition.label}</span>
              </span>
            ))}
          </div>
        </div>

        {canClaim && (
          <Button
            type="button"
            variant="primary"
            size="md"
            block
            disabled={isClaiming}
            onClick={() => onClaim?.(achievement)}
            className="mt-5 h-11 rounded-[7px] text-[13px]"
          >
            <Icon name="check" size={17} />
            {isClaiming ? 'در حال ثبت...' : 'انجام دادم'}
          </Button>
        )}

        {!readOnly && (
          <Button
            type="button"
            variant="primary"
            size="md"
            block
            disabled={!canShare}
            onClick={handleShare}
            className="mt-4 h-11 rounded-[7px] text-[13px]"
          >
            <Icon name="share" size={17} />
            اشتراک گذاری
          </Button>
        )}

        <p className="text-ink-3 mt-5 text-[10.5px]">قبیله به تو افتخار می‌کند، ادامه بده.</p>
      </div>
    </BaseModal>
  );
}
