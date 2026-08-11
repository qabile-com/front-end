import type { Achievement, ActionRewardResult } from './dashboard.types';

export type AchievementDto = Partial<Achievement> & {
  id?: string;
  title?: string;
  label?: string;
  description?: string;
  imageUrl?: string | null;
  xpEarned?: number;
  repeatIndex?: number;
  triggerType?: string;
  earnedAt?: string | null;
  count?: number;
  timesAchieved?: number;
  earnedCount?: number;
  shareable?: boolean;
};

export type RewardPayload = Partial<ActionRewardResult> & {
  reward?: Partial<ActionRewardResult> | null;
  unlockedAchievements?: AchievementDto[] | null;
  achievements?: AchievementDto[] | null;
  xpGranted?: number;
};

export const DEFAULT_ACHIEVEMENT_IMAGE = '/assets/achievements/new/jaraghe-nokhostin.webp';

const ACHIEVEMENT_IMAGE_BY_SLUG: Record<string, string> = {
  'azadkardane-zehn': '/assets/achievements/new/azadkardane-zehn.webp',
  'azad-kardan-zehn': '/assets/achievements/new/azadkardane-zehn.webp',
  'bidari-avalie': '/assets/achievements/new/bidari-avalie.webp',
  'donbalkonande-khargoshe-sefid': '/assets/achievements/new/donbalkonande-khargoshe-sefid.webp',
  'donbal-konande-khargoosh-sefid': '/assets/achievements/new/donbalkonande-khargoshe-sefid.webp',
  'dooshhaye-yakhi': '/assets/achievements/new/dooshhaye-yakhi.webp',
  'ghors-ghermez': '/assets/achievements/new/ghors-ghermez.webp',
  'hich-ghasogh': '/assets/achievements/new/hich-ghasogh.webp',
  'jangjoye-sobh': '/assets/achievements/new/jangjoye-sobh.webp',
  'jangjoo-sahar-khiz': '/assets/achievements/new/jangjoye-sobh.webp',
  'jaraghe-nokhostin': '/assets/achievements/new/jaraghe-nokhostin.webp',
  'jarghe-nokhostin': '/assets/achievements/new/jaraghe-nokhostin.webp',
  'jornal-nevis': '/assets/achievements/new/jornal-nevis.webp',
};

export function getAchievementAssetUrl(achievement: Pick<Achievement, 'slug'>) {
  const slug = achievement.slug?.trim();
  return (slug ? ACHIEVEMENT_IMAGE_BY_SLUG[slug] : undefined) ?? DEFAULT_ACHIEVEMENT_IMAGE;
}

export interface WithActionReward<T> {
  data: T;
  reward?: ActionRewardResult | null;
}

export function normalizeAchievement(item: AchievementDto, fallbackIndex = 0): Achievement {
  const label = item.label ?? item.title ?? item.slug ?? `achievement-${fallbackIndex + 1}`;
  const count = item.count ?? item.repeatIndex ?? item.timesAchieved ?? item.earnedCount;

  return {
    ...item,
    icon: item.icon ?? 'flame',
    label,
    title: item.title ?? label,
    imageUrl: getAchievementAssetUrl(item),
    unlocked: item.unlocked ?? true,
    count,
    isShareable: item.isShareable ?? item.shareable,
  };
}

export function normalizeAchievements(items?: AchievementDto[] | null): Achievement[] {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => normalizeAchievement(item, index));
}

/**
 * The achievement list comes entirely from the backend — only artwork is resolved locally
 * (see `getAchievementAssetUrl`). Previously this padded the list with a hardcoded catalog,
 * which showed achievements that didn't exist server-side and couldn't be earned or claimed.
 */
export function normalizeAchievementCollection(items?: AchievementDto[] | null): Achievement[] {
  return normalizeAchievements(items);
}

export function normalizeActionRewardResult(payload?: unknown): ActionRewardResult | null {
  if (!payload) return null;

  const source = payload as RewardPayload;
  const reward = source.reward ?? source;
  const unlockedAchievements = normalizeAchievements(
    reward.unlockedAchievements ?? source.unlockedAchievements,
  );
  const legacyAchievements = normalizeAchievements(reward.achievements ?? source.achievements);
  const achievements = unlockedAchievements.length ? unlockedAchievements : legacyAchievements;
  const xpGranted = reward.xpGranted ?? source.xpGranted;
  const streakSource = reward.streak ?? source.streak;
  const streak = typeof streakSource === 'object' ? streakSource : null;

  if (!xpGranted && !streak && achievements.length === 0) return null;

  return {
    xpGranted,
    streak,
    achievements,
    unlockedAchievements,
  };
}

export function unwrapActionResponse<T>(
  payload: unknown,
  normalizeData: (data: unknown) => T,
): WithActionReward<T> {
  const raw = unwrapData(payload);
  const container = (payload ?? {}) as RewardPayload;
  const rawObject = (raw ?? {}) as RewardPayload;

  return {
    data: normalizeData(raw),
    reward: normalizeActionRewardResult({
      ...rawObject,
      reward: rawObject.reward ?? container.reward,
      unlockedAchievements: rawObject.unlockedAchievements ?? container.unlockedAchievements,
      achievements: rawObject.achievements ?? container.achievements,
      xpGranted: rawObject.xpGranted ?? container.xpGranted,
    }),
  };
}

export function unwrapData(payload: unknown) {
  const raw = payload as { data?: unknown };
  return raw?.data ?? payload;
}
