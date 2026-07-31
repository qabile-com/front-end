'use client';

import { useQuery } from '@tanstack/react-query';
import type { StaticRoadmapStep } from '../domain/static-roadmap-steps';
import type { StepConditionResult } from '../domain/roadmap.types';
import { profileRepo } from '@/features/profile/infrastructure/repository-factory';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { useUser } from '@/features/dashboard/application/use-user';
import { getForumUser, getForumLikeHistory, getForumCommentHistory } from '@/core/api/forum.api';

export function useStepCondition(
  step: StaticRoadmapStep | null | undefined,
  enabled = false,
  checkedItems: Record<string, boolean> = {},
  elapsedSeconds = 0,
): {
  satisfied: boolean;
  message?: string;
  loading: boolean;
  refetch: () => Promise<StepConditionResult | null>;
} {
  const { user } = useUser(userRepo);
  const condition = step?.condition;

  const postsQuery = useQuery({
    enabled: enabled && Boolean(step && condition?.type === 'posts'),
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
    enabled: enabled && Boolean(step && condition?.type === 'engagement'),
    queryKey: ['roadmap-step-condition', 'engagement', step.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'engagement') {
        return { satisfied: false };
      }

      let likesCount = 0;
      let commentsCount = 0;

      try {
        const likesRes = await getForumLikeHistory({ limit: 100, offset: 0 });
        likesCount = likesRes.data.data?.length ?? 0;
      } catch {
        likesCount = 0;
      }

      try {
        const commentsRes = await getForumCommentHistory({ limit: 100, offset: 0 });
        commentsCount = commentsRes.data?.data?.length ?? 0;
      } catch {
        commentsCount = 0;
      }

      const satisfied = likesCount >= condition.minLikes && commentsCount >= condition.minComments;

      return {
        satisfied,
        message: satisfied
          ? undefined
          : `برای تکمیل این مرحله حداقل ${condition.minLikes} لایک و ${condition.minComments} نظر نیاز است.`,
      };
    },
  });

  const followsQuery = useQuery({
    enabled: enabled && Boolean(step && condition?.type === 'follows' && user?.id),
    queryKey: ['roadmap-step-condition', 'follows', step.id, user?.id],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'follows' || !user?.id) {
        return { satisfied: false };
      }

      let followingCount = 0;
      try {
        const res = await getForumUser(user.id);
        const payload = res.data as typeof res.data | { data?: typeof res.data };
        const userData = 'data' in payload && payload.data ? payload.data : res.data;
        followingCount = userData?.stats?.followingCount ?? 0;
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
    enabled: enabled && Boolean(step && condition?.type === 'timer'),
    queryKey: ['roadmap-step-condition', 'timer', step.id, elapsedSeconds],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'timer') {
        return { satisfied: false };
      }

      const satisfied = elapsedSeconds >= condition.seconds;

      let message = '';

      if (step.id === 4) {
        message = 'مطمئن بشید که پیج رو فالو کردید';
      } else if (step.id === 3) {
        message = 'لطفا کل متن را بخوانید';
      }

      return {
        satisfied,
        message: satisfied ? undefined : message,
      };
    },
  });

  const checklistQuery = useQuery({
    enabled: enabled && Boolean(step && condition?.type === 'checklist'),
    queryKey: ['roadmap-step-condition', 'checklist', step.id, checkedItems],
    queryFn: async (): Promise<StepConditionResult> => {
      if (!step || !condition || condition.type !== 'checklist') {
        return { satisfied: false };
      }

      const allChecked = step.checklist?.every((item) => Boolean(checkedItems[item])) ?? false;

      return {
        satisfied: allChecked,
        message: allChecked ? undefined : 'برای تکمیل این مرحله باید همه موارد را تیک بزنید.',
      };
    },
  });

  if (!step || !condition) {
    return {
      satisfied: true,
      message: undefined,
      loading: false,
      refetch: () => Promise.resolve(null),
    };
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
    refetch: async (): Promise<StepConditionResult | null> => {
      let result: { data?: StepConditionResult } = {};
      switch (condition.type) {
        case 'posts':
          result = await postsQuery.refetch();
          break;
        case 'engagement':
          result = await engagementQuery.refetch();
          break;
        case 'follows':
          result = await followsQuery.refetch();
          break;
        case 'timer':
          result = await timerQuery.refetch();
          break;
        case 'checklist':
          result = await checklistQuery.refetch();
          break;
        default:
          break;
      }
      return result.data ?? null;
    },
  };
}
