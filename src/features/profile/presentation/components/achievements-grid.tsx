'use client';

import { useMemo } from 'react';
import { OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { publicEnv } from '@/core/config/public-env';
import type { Achievement } from '@/features/dashboard/domain/dashboard.types';
import {
  DEFAULT_ACHIEVEMENT_IMAGE,
  hasAchievementAssetImage,
} from '@/features/dashboard/domain/achievement-normalizer';
import {
  ACHIEVEMENT_CATEGORY_ORDER,
  ACHIEVEMENT_CATEGORY_TITLES,
  getAchievementCategoryType,
  type AchievementCategoryType,
} from '@/features/dashboard/domain/achievement-categories';
import { getAchievementCount, getAchievementImage, isAchievementEarned } from './achievement-helpers';

const OTHER_CATEGORY = 'other';
const OTHER_CATEGORY_TITLE = 'سایر دستاوردها';

interface AchievementsGridProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
  emptyMessage?: string;
}

export function AchievementsGrid({
  achievements: allAchievements,
  onAchievementClick,
  emptyMessage = 'هنوز دستاوردی برای نمایش نیست.',
}: AchievementsGridProps) {
  const achievements = publicEnv.showAchievementFallbackImage
    ? allAchievements
    : allAchievements.filter(hasAchievementAssetImage);

  const categories = useMemo(() => groupAchievementsByCategory(achievements), [achievements]);

  if (achievements.length === 0) {
    return (
      <p className="text-ink-3 rounded-[16px] border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      {categories.map(({ key, title, items }) => (
        <section key={key}>
          <h3 className="text-ink-2 mb-3.5 text-[13px] font-extrabold">{title}</h3>
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
            {items.map((achievement) => (
              <AchievementTile
                key={achievement.id ?? achievement.slug ?? achievement.label}
                achievement={achievement}
                onClick={() => onAchievementClick(achievement)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function groupAchievementsByCategory(achievements: Achievement[]) {
  const grouped = new Map<string, Achievement[]>();

  for (const achievement of achievements) {
    const key = getAchievementCategoryType(achievement.slug) ?? OTHER_CATEGORY;
    const items = grouped.get(key) ?? [];
    items.push(achievement);
    grouped.set(key, items);
  }

  const orderedKeys = [...ACHIEVEMENT_CATEGORY_ORDER, OTHER_CATEGORY];

  return orderedKeys
    .map((key) => ({
      key,
      title:
        key === OTHER_CATEGORY
          ? OTHER_CATEGORY_TITLE
          : ACHIEVEMENT_CATEGORY_TITLES[key as AchievementCategoryType],
      items: grouped.get(key) ?? [],
    }))
    .filter((category) => category.items.length > 0);
}

function AchievementTile({
  achievement,
  onClick,
}: {
  achievement: Achievement;
  onClick: () => void;
}) {
  const isEarned = isAchievementEarned(achievement);
  const count = getAchievementCount(achievement);

  return (
    <button
      type="button"
      onClick={onClick}
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
}
