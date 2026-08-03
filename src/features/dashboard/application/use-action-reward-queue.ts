'use client';

import { useCallback, useState } from 'react';
import type {
  Achievement,
  ActionRewardResult,
  StreakReward,
} from '@/features/dashboard/domain/dashboard.types';

export type ActionRewardQueueItem =
  | {
      kind: 'xp';
      amount: number;
      title?: string;
      description?: string;
    }
  | {
      kind: 'streak';
      streak: StreakReward;
    }
  | {
      kind: 'achievement';
      achievement: Achievement;
    };

interface EnqueueRewardOptions {
  xpTitle?: string;
  xpDescription?: string;
}

export function useActionRewardQueue() {
  const [queue, setQueue] = useState<ActionRewardQueueItem[]>([]);
  const currentReward = queue[0] ?? null;

  const enqueueReward = useCallback((reward?: ActionRewardResult | null, options?: EnqueueRewardOptions) => {
    if (!reward) return;

    const nextItems: ActionRewardQueueItem[] = [];

    if (reward.xpGranted && reward.xpGranted > 0) {
      nextItems.push({
        kind: 'xp',
        amount: reward.xpGranted,
        title: options?.xpTitle,
        description: options?.xpDescription,
      });
    }

    if (reward.streak?.increased) {
      nextItems.push({
        kind: 'streak',
        streak: reward.streak,
      });
    }

    const achievements = reward.unlockedAchievements?.length
      ? reward.unlockedAchievements
      : reward.achievements;

    achievements?.forEach((achievement) => {
      nextItems.push({
        kind: 'achievement',
        achievement,
      });
    });

    if (nextItems.length === 0) return;
    setQueue((previous) => [...previous, ...nextItems]);
  }, []);

  const dismissCurrentReward = useCallback(() => {
    setQueue((previous) => previous.slice(1));
  }, []);

  return {
    currentReward,
    enqueueReward,
    dismissCurrentReward,
  };
}
