'use client';

import type { ActionRewardQueueItem } from '../../application/use-action-reward-queue';
import { AchievementEarnedModal } from '@/features/profile/presentation/components/achievement-earned-modal';
import { StreakSuccessModal } from '@/features/profile/presentation/components/streak-success-modal';
import { XpEarnedModal } from '@/features/profile/presentation/components/xp-earned-modal';

interface ActionRewardModalsProps {
  reward: ActionRewardQueueItem | null;
  onClose: () => void;
}

export function ActionRewardModals({ reward, onClose }: ActionRewardModalsProps) {
  if (!reward) return null;

  if (reward.kind === 'xp') {
    return (
      <XpEarnedModal
        xp={reward.amount}
        title={reward.title}
        description={reward.description}
        onClose={onClose}
      />
    );
  }

  if (reward.kind === 'streak') {
    return (
      <StreakSuccessModal
        isOpen
        streak={reward.streak.current}
        freezesRemaining={reward.streak.freezesRemaining}
        freezeUsed={reward.streak.freezeUsed}
        onClose={onClose}
      />
    );
  }

  return <AchievementEarnedModal achievement={reward.achievement} onClose={onClose} />;
}
