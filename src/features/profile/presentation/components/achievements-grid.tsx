'use client';

import { OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import type { Achievement } from '@/features/dashboard/domain/dashboard.types';
import { DEFAULT_ACHIEVEMENT_IMAGE } from '@/features/dashboard/domain/achievement-normalizer';
import { getAchievementCount, getAchievementImage, isAchievementEarned } from './achievement-helpers';

interface AchievementsGridProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
  emptyMessage?: string;
}

export function AchievementsGrid({
  achievements,
  onAchievementClick,
  emptyMessage = 'هنوز دستاوردی برای نمایش نیست.',
}: AchievementsGridProps) {
  if (achievements.length === 0) {
    return (
      <p className="text-ink-3 rounded-[16px] border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
      {achievements.map((achievement) => {
        const isEarned = isAchievementEarned(achievement);
        const count = getAchievementCount(achievement);

        return (
          <button
            key={achievement.id ?? achievement.slug ?? achievement.label}
            type="button"
            onClick={() => onAchievementClick(achievement)}
            className="group flex flex-col items-center gap-2.5 text-center"
          >
            <span
              className={cn(
                'border-hair relative block size-[72px] overflow-hidden rounded-[8px] border bg-black shadow-[0_12px_26px_-18px_var(--glow)] transition-transform duration-200 group-hover:-translate-y-0.5',
                isEarned
                  ? 'border-[rgba(255,98,0,.72)]'
                  : 'border-[rgba(253,238,226,.28)] opacity-70 grayscale',
              )}
            >
              <OptionalImage
                src={getAchievementImage(achievement)}
                alt={achievement.label}
                className="object-cover"
                fallbackSrc={DEFAULT_ACHIEVEMENT_IMAGE}
                loading="lazy"
              />
              {isEarned && count > 1 && (
                <span className="bg-ember absolute start-1.5 top-1.5 rounded-[5px] px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_6px_14px_-8px_var(--glow)]">
                  {toPersianDigits(count)}x
                </span>
              )}
            </span>
            <span className={cn('text-[12px]', isEarned ? 'text-ink-2' : 'text-ink-4')}>
              {achievement.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
