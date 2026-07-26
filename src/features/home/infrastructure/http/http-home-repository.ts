// src/features/dashboard/infrastructure/http-home-repository.ts

import type { IHomeRepository } from '@/features/dashboard/domain/dashboard-repository';
import type {
  StatCard,
  RoadmapItem,
  RoadmapStatus,
  ChatMessage,
} from '@/features/dashboard/domain/dashboard.types';
import { getDashboardBundle } from '@/core/api/dashboard.api';

export class HttpHomeRepository implements IHomeRepository {
  async getHomeData() {
    const res = await getDashboardBundle();
    const home = res.data.home;

    const stats: StatCard[] = home.stats.map((s) => ({
      icon: s.icon,
      tone: s.tone as StatCard['tone'], // 'fire' | 'gold' | 'ok' | 'blue'
      value: s.value,
      label: s.label,
    }));

    const roadmap: RoadmapItem[] = home.roadmap.items.map((item) => ({
      num: item.num,
      type: item.type,
      title: item.title,
      xp: item.xp,
      status: item.status as RoadmapStatus, // API guarantees 'done' | 'current' | 'next'
    }));

    const aiSeed: ChatMessage = {
      from: home.aiSeed.from as ChatMessage['from'],
      text: home.aiSeed.text,
    };

    const aiQuickReplies = home.aiQuickReplies.map((q) => ({
      label: q.label,
      send: q.send,
    }));

    return { stats, roadmap, aiSeed, aiQuickReplies };
  }
}
