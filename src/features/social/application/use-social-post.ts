'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';
import type { Post } from '../domain/social.data';

export const socialPostQueryKey = (postId: string) => ['social-post', postId] as const;

export function useSocialPost(repo: ISocialRepository, postId: string) {
  return useQuery({
    queryKey: socialPostQueryKey(postId),
    queryFn: () => repo.getPost(postId),
    enabled: Boolean(postId),
    staleTime: 60_000,
  });
}

export function useAddPostComment(repo: ISocialRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      repo.addComment(postId, text),
    onSuccess: (comment, variables) => {
      queryClient.setQueryData<Post>(socialPostQueryKey(variables.postId), (current) =>
        current ? { ...current, comments: [...current.comments, comment] } : current,
      );
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: socialPostQueryKey(variables.postId) });
    },
  });
}
