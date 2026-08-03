'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';
import type { Post, PostComment } from '../domain/social.data';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';

export const socialPostQueryKey = (postId: string) => ['social-post', postId] as const;
export const socialPostCommentsQueryKey = (postId: string) =>
  ['social-post', postId, 'comments'] as const;

export function useSocialPost(repo: ISocialRepository, postId: string) {
  return useQuery({
    queryKey: socialPostQueryKey(postId),
    queryFn: () => repo.getPost(postId),
    enabled: Boolean(postId),
    staleTime: 60_000,
  });
}

export function useSocialPostComments(repo: ISocialRepository, postId: string) {
  return useQuery({
    queryKey: socialPostCommentsQueryKey(postId),
    queryFn: () => repo.getPostComments(postId),
    enabled: Boolean(postId),
    staleTime: 30_000,
  });
}

export function useAddPostComment(
  repo: ISocialRepository,
  onReward?: (reward?: ActionRewardResult | null) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      repo.addComment(postId, text),
    onSuccess: (result, variables) => {
      const comment = result.data;
      onReward?.(result.reward);
      queryClient.setQueryData<PostComment[]>(
        socialPostCommentsQueryKey(variables.postId),
        (current) => [...(current ?? []), comment],
      );
      queryClient.setQueryData<Post>(socialPostQueryKey(variables.postId), (current) =>
        current
          ? {
              ...current,
              comments: [...current.comments, comment],
              commentsCount: (current.commentsCount ?? current.comments.length) + 1,
              commentedByMe: true,
            }
          : current,
      );
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: socialPostQueryKey(variables.postId) });
      queryClient.invalidateQueries({ queryKey: socialPostCommentsQueryKey(variables.postId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-step-condition'] });
    },
  });
}
