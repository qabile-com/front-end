export type IconKey = string;

export interface StatItem {
  icon: IconKey;
  count: number;
  decimals?: number;
  suffix?: string;
  label: string;
}

export interface PillarFeatureRow {
  step: string;
  title: string;
  sub: string;
  locked?: boolean;
}

export interface RoadmapStep {
  icon: IconKey;
  title: string;
  text: string;
}

export type PodiumTone = 'gold' | 'silver' | 'bronze';

export interface PodiumPlace {
  rank: number;
  name: string;
  score: number;
  tag: string;
  avatar: string;
  tone: PodiumTone;
}

export interface LeaderboardRow {
  rank: number;
  name: string;
  tag: string;
  level: number;
  points: string;
  delta: number;
  direction: 'up' | 'down';
  avatar: string;
  isYou?: boolean;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface FaqItem {
  q: string;
  a: string;
}
