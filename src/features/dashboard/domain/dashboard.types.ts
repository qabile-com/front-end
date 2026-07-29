export type IconKey = string;

export const DEFAULT_AVATAR_GRADIENT = 'linear-gradient(135deg,#ff8a3d,#cc4308)';

export interface CurrentUser {
  name: string;
  lastName: string;
  initial: string;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  role: 'user' | 'admin' | 'super_admin';
  streak?: number;
  avatar: string;
  achievements?: Achievement[];
  isCompleteOnboarding?: boolean;
}

export interface NavItem {
  id: DashboardTab;
  label: string;
  icon: IconKey;
  href: string;
}

export type DashboardTab = 'home' | 'lb' | 'social' | 'courses' | 'profile';

export interface StatCard {
  icon: IconKey;
  tone: 'fire' | 'gold' | 'ok' | 'blue';
  value: string;
  label: string;
}

export type RoadmapStatus = 'done' | 'current' | 'next';

export interface RoadmapItem {
  num: number;
  type: string;
  title: string;
  xp: number;
  status: RoadmapStatus;
}

export interface PodiumPlace {
  rank: number;
  name: string;
  points: string;
  avatar: string;
}

export interface LbRow {
  rank: number;
  name: string;
  points: string;
  streak: string;
  avatar: string;
  isYou?: boolean;
}

export interface Achievement {
  icon: IconKey;
  label: string;
  unlocked: boolean;
  slug?: string;
  count?: number;
  conditions?: AchievementCondition[];
  isShareable?: boolean;
}

export interface AchievementCondition {
  id: string;
  label: string;
  current?: number;
  target?: number;
  passed: boolean;
}

export interface StreakReward {
  increased: boolean;
  previous: number;
  current: number;
  freezeUsed?: boolean;
  freezesRemaining?: number;
  reset?: boolean;
}

export interface ActionRewardResult {
  xpGranted?: number;
  streak?: StreakReward | null;
  achievements?: Achievement[];
}

export type SectionWatchEvent = 'timeupdate' | 'pause' | 'close' | 'ended' | 'threshold';

export interface WatchRange {
  start: number;
  end: number;
}

export interface SectionWatchProgressInput {
  courseId: string;
  mediaType?: 'video' | 'audio';
  currentTime: number;
  duration: number;
  maxWatchedTime: number;
  watchedRanges: WatchRange[];
  event: SectionWatchEvent;
}

export interface SectionWatchProgressResult {
  section: {
    id: string;
    status: 'none' | 'partial' | 'done';
    progress: number;
    watchedSeconds: number;
    completedAt?: string | null;
    xpGrantedAt?: string | null;
  };
  reward?: ActionRewardResult | null;
}

export interface SettingItem {
  icon: IconKey;
  label: string;
}

export interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}
