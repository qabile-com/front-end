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

const ACHIEVEMENT_CATALOG: AchievementDto[] = [
  {
    id: 'ghors-ghermez-placeholder',
    slug: 'ghors-ghermez',
    label: 'قرص قرمز',
    title: 'قرص قرمز',
    description: '۲۱ روز متوالی ثبت عادت',
    triggerType: 'habit_streak_days',
    threshold: 21,
    xpEarned: 2200,
    unlocked: false,
    count: 0,
    isRepeatable: false,
    isShareable: false,
    conditions: [
      {
        id: 'ghors-ghermez',
        label: '۲۱ روز متوالی ثبت عادت',
        current: 0,
        target: 21,
        passed: false,
      },
    ],
  },
  {
    id: 'bidari-avalie-placeholder',
    slug: 'bidari-avalie',
    label: 'بیداری اولیه',
    title: 'بیداری اولیه',
    description: '۴۰ روز متوالی بدون شکست',
    triggerType: 'unbroken_streak_days',
    threshold: 40,
    xpEarned: 4500,
    unlocked: false,
    count: 0,
    isRepeatable: false,
    isShareable: false,
    conditions: [
      {
        id: 'bidari-avalie',
        label: '۴۰ روز متوالی بدون شکست',
        current: 0,
        target: 40,
        passed: false,
      },
    ],
  },
  {
    id: 'jornal-nevis-placeholder',
    slug: 'jornal-nevis',
    label: 'ژورنال نویس بیداری',
    title: 'ژورنال نویس بیداری',
    description: '۵۰ ورودی ژورنال',
    triggerType: 'journal_entries_count',
    threshold: 50,
    xpEarned: 2800,
    unlocked: false,
    count: 0,
    isRepeatable: false,
    isShareable: false,
    conditions: [
      {
        id: 'jornal-nevis',
        label: '۵۰ ورودی ژورنال',
        current: 0,
        target: 50,
        passed: false,
      },
    ],
  },
  {
    id: 'dooshhaye-yakhi-placeholder',
    slug: 'dooshhaye-yakhi',
    label: 'دوش‌های یخی صهیون',
    title: 'دوش‌های یخی صهیون',
    description: '۴۰ دوش آب سرد',
    triggerType: 'cold_shower_count',
    threshold: 40,
    xpEarned: 2500,
    unlocked: false,
    count: 0,
    isRepeatable: false,
    isShareable: false,
    conditions: [
      {
        id: 'dooshhaye-yakhi',
        label: '۴۰ دوش آب سرد',
        current: 0,
        target: 40,
        passed: false,
      },
    ],
  },
  {
    id: 'hich-ghasogh-placeholder',
    slug: 'hich-ghasogh',
    label: 'هیچ قاشقی وجود ندارد',
    title: 'هیچ قاشقی وجود ندارد',
    description: '۳ عادت سخت همزمان به مدت ۳۰ روز',
    triggerType: 'parallel_hard_habits_streak',
    threshold: 30,
    xpEarned: 9000,
    unlocked: false,
    count: 0,
    isRepeatable: false,
    isShareable: false,
    conditions: [
      {
        id: 'hich-ghasogh',
        label: '۳ عادت سخت همزمان به مدت ۳۰ روز',
        current: 0,
        target: 30,
        passed: false,
      },
    ],
  },
];

const ACHIEVEMENT_IMAGE_BY_SLUG: Record<string, string> = {
  'azadkardane-zehn': '/assets/achievements/new/azadkardane-zehn.webp',
  'azad-kardan-zehn': '/assets/achievements/new/azadkardane-zehn.webp',
  'bidari-avalie': '/assets/achievements/new/bidari-avalie.webp',
  'donbalkonande-khargoshe-sefid':
    '/assets/achievements/new/donbalkonande-khargoshe-sefid.webp',
  'donbal-konande-khargoosh-sefid':
    '/assets/achievements/new/donbalkonande-khargoshe-sefid.webp',
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
  return (
    (slug ? ACHIEVEMENT_IMAGE_BY_SLUG[slug] : undefined) ??
    DEFAULT_ACHIEVEMENT_IMAGE
  );
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
  const normalized = normalizeAchievements(items);
  const existingKeys = new Set(normalized.map(getAchievementCatalogKey));
  const placeholders = ACHIEVEMENT_CATALOG.filter(
    (item) => !existingKeys.has(getAchievementCatalogKey(item)),
  ).map((item, index) => normalizeAchievement(item, normalized.length + index));

  return [...normalized, ...placeholders];
}

function getAchievementCatalogKey(achievement: Pick<Achievement, 'slug'>) {
  return getAchievementAssetUrl(achievement);
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
