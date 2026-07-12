export type IconKey = string;

export interface CurrentUser {
  name: string;
  initial: string;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  avatar: string;
  achievments?: Achievement[];
}

export interface NavItem {
  id: DashboardTab;
  label: string;
  icon: IconKey;
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
}

export interface SettingItem {
  icon: IconKey;
  label: string;
}

export interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}
