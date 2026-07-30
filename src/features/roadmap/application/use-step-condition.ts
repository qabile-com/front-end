'use client';

import { useQuery } from '@tanstack/react-query';
import type { StaticRoadmapStep } from '../domain/static-roadmap-steps';
import type { StepConditionResult } from '../domain/roadmap.types';
import { profileRepo } from '@/features/profile/infrastructure/repository-factory';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { useUser } from '@/features/dashboard/application/use-user';
import { getForumUser } from '@/core/api/forum.api';

export function useStepCondition(step: StaticRoadmapStep | null | undefined) {
  const { user } = useUser(userRepo);
  const condition = step?.condition;

  const postsQuery = useQuery({
    enabled: Boolean(step && condition?.type === 'posts'),
    queryKey: ['roadmap-step-condition', 'posts', step.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'posts') {
        return { satisfied: false };
      }

      const profile = await profileRepo.getMyProfile();
      const posts = profile.posts ?? [];
      const satisfied = posts.length >= condition.min;

      return {
        satisfied,
        message: satisfied
          ? undefined
          : `برای تکمیل این مرحله حداقل ${condition.min} پست نیاز است.`,
      };
    },
  });

  const engagementQuery = useQuery({
    enabled: Boolean(step && condition?.type === 'engagement'),
    queryKey: ['roadmap-step-condition', 'engagement', step.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'engagement') {
        return { satisfied: false };
      }

      const profile = await profileRepo.getMyProfile();
      const posts = profile.posts ?? [];
      const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
      const totalComments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
      const satisfied = totalLikes >= condition.minLikes && totalComments >= condition.minComments;

      return {
        satisfied,
        message: satisfied
          ? undefined
          : `برای تکمیل این مرحله حداقل ${condition.minLikes} لایک و ${condition.minComments} نظر نیاز است.`,
      };
    },
  });

  const followsQuery = useQuery({
    enabled: Boolean(step && condition?.type === 'follows' && user?.id),
    queryKey: ['roadmap-step-condition', 'follows', step.id, user?.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'follows' || !user?.id) {
        return { satisfied: false };
      }

      let followingCount = 0;
      try {
        const res = await getForumUser(user.id);
        const data = res.data as { stats?: { followingCount?: number } } | undefined;
        followingCount = data?.stats?.followingCount ?? 0;
      } catch {
        followingCount = 0;
      }

      const satisfied = followingCount >= condition.min;

      return {
        satisfied,
        message: satisfied
          ? undefined
          : `برای تکمیل این مرحله حداقل ${condition.min} دنبال‌کننده نیاز است.`,
      };
    },
  });

  const timerQuery = useQuery({
    enabled: Boolean(step && condition?.type === 'timer'),
    queryKey: ['roadmap-step-condition', 'timer', step.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'timer') {
        return { satisfied: false };
      }

      return {
        satisfied: false,
        message: `برای تکمیل این مرحله باید ${condition.seconds} ثانیه در این صفحه بمانید.`,
      };
    },
  });

  const checklistQuery = useQuery({
    enabled: Boolean(step && condition?.type === 'checklist'),
    queryKey: ['roadmap-step-condition', 'checklist', step.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'checklist') {
        return { satisfied: false };
      }

      return {
        satisfied: false,
        message: 'برای تکمیل این مرحله باید همه موارد را تیک بزنید.',
      };
    },
  });

  if (!step || !condition) {
    return { satisfied: true, message: undefined, loading: false, refetch: () => Promise.resolve() };
  }

  const base = {
    posts: postsQuery.data,
    engagement: engagementQuery.data,
    follows: followsQuery.data,
    timer: timerQuery.data,
    checklist: checklistQuery.data,
  }[condition.type];

  return {
    satisfied: base?.satisfied ?? false,
    message: base?.message,
    loading: base === undefined,
    refetch: async () => {
      switch (condition.type) {
        case 'posts':
          return postsQuery.refetch();
        case 'engagement':
          return engagementQuery.refetch();
        case 'follows':
          return followsQuery.refetch();
        case 'timer':
          return timerQuery.refetch();
        case 'checklist':
          return checklistQuery.refetch();
        default:
          return Promise.resolve();
      }
    },
  };
}
