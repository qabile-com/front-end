import { httpClient } from './http-client';
export interface DashboardBundle {
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
    title: string;
    level: number;
    xp: number;
    xpMax: number;
    streak: number;
    avatar?: string | null;
  };
  home: {
    stats: { icon: string; tone: string; value: string; label: string }[];
    roadmap: { items: { num: number; type: string; title: string; xp: number; status: string }[] };
    aiSeed: { from: string; text: string };
    aiQuickReplies: { label: string; send: string }[];
  };
  leaderboard: unknown;
  forum: unknown;
  courses: unknown[];
  profile: unknown;
  season: unknown;
}

export const getDashboardBundle = () => httpClient.get<DashboardBundle>('/api/v1/dashboard');
