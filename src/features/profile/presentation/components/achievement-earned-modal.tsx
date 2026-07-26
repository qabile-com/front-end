'use client';

import { Button, Icon, OptionalImage } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { Achievement } from '@/features/dashboard/domain/dashboard.types';

interface AchievementEarnedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementEarnedModal({ achievement, onClose }: AchievementEarnedModalProps) {
  if (!achievement) return null;

  const count = achievement.count ?? 1;

  const handleShare = async () => {
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
    <div className="fixed inset-0 z-[1110] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm">
      <div className="border-hair w-full max-w-[426px] overflow-hidden rounded-[10px] border bg-[#050302] px-5 py-6 text-center shadow-[0_28px_90px_-40px_var(--glow)] sm:px-8">
        <div className="relative mx-auto size-[190px] overflow-hidden rounded-[8px] border border-[rgba(255,98,0,.72)] bg-black">
          <OptionalImage
            src={getAchievementImage(achievement)}
            alt={achievement.label}
            className="object-cover"
            loading="lazy"
          />
          {count > 1 && (
            <span className="bg-ember absolute start-2 top-2 rounded-[5px] px-2 py-1 text-[11px] font-black text-white">
              {toPersianDigits(count)}x
            </span>
          )}
        </div>

        <p className="text-ink-3 mt-5 text-[12px]">دستاورد جدید دریافت شد</p>
        <h3 className="text-gold mt-2 text-[24px] font-black">{achievement.label}</h3>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px]">
          <span className="text-ink-3 font-bold">شرایط دریافت:</span>
          {(achievement.conditions ?? []).map((condition) => (
            <span key={condition.id} className="text-gold inline-flex items-center gap-2 font-bold">
              <span>{condition.label}</span>
              <Icon name="check" size={22} />
            </span>
          ))}
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          block
          onClick={handleShare}
          className="mt-5 h-11 rounded-[7px] text-[13px]"
        >
          <Icon name="share" size={17} />
          اشتراک گذاری
        </Button>

        <button
          type="button"
          onClick={onClose}
          className="text-ink-3 hover:text-gold mt-4 text-[12px] font-bold transition-colors"
        >
          ادامه
        </button>
      </div>
    </div>
  );
}

function getAchievementImage(achievement: Achievement) {
  return achievement.slug
    ? `/assets/achievements/${achievement.slug}.png`
    : '/assets/achievements/atash-afrooz.png';
}
