import type { Achievement, AchievementCondition } from '@/features/dashboard/domain/dashboard.types';
import { getAchievementAssetUrl } from '@/features/dashboard/domain/achievement-normalizer';

export function getAchievementCount(achievement: Achievement) {
  return achievement.count ?? 1;
}

export function getAchievementProgress(achievement: Achievement) {
  const condition = achievement.conditions?.[0];
  const target = condition?.target ?? 0;
  if (!condition || target <= 1) return null;

  const done = Math.min(condition.current ?? 0, target);
  return { done, threshold: target, percent: Math.round((done / target) * 100) };
}

export function isAchievementEarned(achievement: Achievement) {
  if (achievement.conditions?.length) {
    return achievement.conditions.every((condition) => condition.passed);
  }
  return Boolean(achievement.unlocked);
}

export function getAchievementImage(achievement: Achievement) {
  return getAchievementAssetUrl(achievement);
}

export function getAchievementSlug(achievement: Achievement) {
  return achievement.slug?.trim();
}

export function getAchievementConditions(achievement: Achievement): AchievementCondition[] {
  if (achievement.conditions?.length) return achievement.conditions;

  const slug = getAchievementSlug(achievement);

  return [
    {
      id: `${slug ?? achievement.label}-main-condition`,
      label: achievement.description ?? 'تکمیل شرط تعیین‌شده برای این دستاورد',
      passed: isAchievementEarned(achievement),
    },
  ];
}

export function sortAchievementsByUnlocked(achievements: Achievement[]) {
  return [...achievements].sort(
    (a, b) => Number(isAchievementEarned(b)) - Number(isAchievementEarned(a)),
  );
}

export function getAchievementKey(achievement: Achievement) {
  return achievement.id ?? achievement.slug ?? achievement.label;
}
