import type { Achievement, ActionRewardResult, StreakReward } from './dashboard.types';

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

  'zhornal-nevis-bidari': '/assets/achievements/new/jornal-nevis.webp',
  'dosh-abe-sarde-sohyoon': '/assets/achievements/new/dooshhaye-yakhi.webp',
  'azad-sazi-se-adat': '/assets/achievements/new/hich-ghasogh.webp',
  'bidari-avaliye-motavali': '/assets/achievements/new/bidari-avalie.webp',

  'atash-afrooz': '/assets/achievements/atash-afrooz.webp',
  'atash-afroz': '/assets/achievements/atash-afrooz.webp',
  'farzand-ghabile': '/assets/achievements/farzand-ghabile.webp',
  'farzand-qabile': '/assets/achievements/farzand-ghabile.webp',
  gahreman: '/assets/achievements/gahreman.webp',
  ghahreman: '/assets/achievements/gahreman.webp',
  'ghalb-ghabile': '/assets/achievements/ghalb-ghabile.webp',
  'ghalb-qabile': '/assets/achievements/ghalb-ghabile.webp',
  'safir-ghabile': '/assets/achievements/safir-ghabile.webp',
  'safir-qabile': '/assets/achievements/safir-ghabile.webp',
  'seda-qabile': '/assets/achievements/seda-qabile.webp',
  'seda-ghabile': '/assets/achievements/seda-qabile.webp',
  setare: '/assets/achievements/setare.webp',
  tizbaal: '/assets/achievements/tizbaal.webp',
  tizbal: '/assets/achievements/tizbaal.webp',
  'vares-ghabile': '/assets/achievements/vares-ghabile.webp',
  'vares-qabile': '/assets/achievements/vares-ghabile.webp',
};

export function getAchievementAssetUrl(achievement: Pick<Achievement, 'slug'>) {
  const slug = achievement.slug?.trim();
  const asset = slug ? ACHIEVEMENT_IMAGE_BY_SLUG[slug] : undefined;

  if (!asset && slug && process.env.NODE_ENV === 'development') {
    console.warn(
      `[achievements] no local image for slug "${slug}" — add it to ACHIEVEMENT_IMAGE_BY_SLUG.`,
    );
  }

  return asset ?? DEFAULT_ACHIEVEMENT_IMAGE;
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

export function normalizeAchievementCollection(items?: AchievementDto[] | null): Achievement[] {
  return normalizeAchievements(items);
}

// Different actions report the streak update under different shapes:
// episode watch-progress already matches StreakReward ({increased, previous, current, ...}),
// roadmap step completion uses {shouldShow, newStreak, previousStreak, freezeRemaining, ...}.
function normalizeStreakReward(streakSource: unknown): StreakReward | null {
  if (!streakSource || typeof streakSource !== 'object') return null;
  const s = streakSource as Record<string, unknown>;

  if (typeof s.newStreak === 'number') {
    const previous = typeof s.previousStreak === 'number' ? s.previousStreak : 0;
    return {
      increased: Boolean(s.shouldShow ?? s.newStreak > previous),
      previous,
      current: s.newStreak,
      freezeUsed: Boolean(s.freezeUsed),
      freezesRemaining: typeof s.freezeRemaining === 'number' ? s.freezeRemaining : undefined,
      reset: Boolean(s.reset),
    };
  }

  if (typeof s.current === 'number') {
    return {
      increased: Boolean(s.increased),
      previous: typeof s.previous === 'number' ? s.previous : 0,
      current: s.current,
      freezeUsed: Boolean(s.freezeUsed),
      freezesRemaining: typeof s.freezesRemaining === 'number' ? s.freezesRemaining : undefined,
      reset: Boolean(s.reset),
    };
  }

  return null;
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
  const streak = normalizeStreakReward(reward.streak ?? source.streak);

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
