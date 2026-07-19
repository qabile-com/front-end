import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

// Re-define the full dashboard bundle type that matches the API response
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
    avatar: string;
  };
  home: {
    stats: { icon: string; tone: string; value: string; label: string }[];
    roadmap: { items: { num: number; type: string; title: string; xp: number; status: string }[] };
    aiSeed: { from: string; text: string };
    aiQuickReplies: { label: string; send: string }[];
  };
  leaderboard: any; // matches existing type
  forum: any;
  courses: any[];
  profile: any;
  season: any;
}

export const getDashboardBundle = () =>
  httpClient.get<any, AxiosResponse<DashboardBundle>>('/api/v1/dashboard');
