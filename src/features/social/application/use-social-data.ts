// src/features/dashboard/application/use-social-data.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';
import { useState } from 'react';

export function useSocialData(repo: ISocialRepository) {
  const queryClient = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: ['social', 'trending-tags'],
    queryFn: () => repo.getTrendingTags(),
    staleTime: 2 * 60_000,
    retry: 1,
  });

  const activeUsersQuery = useQuery({
    queryKey: ['social', 'active-users'],
    queryFn: () => repo.getActiveUsers(),
    staleTime: 60_000,
    retry: 1,
  });

  const [newPostIds, setNewPostIds] = useState<Set<string>>(() => new Set());

  const publishPostMutation = useMutation({
    mutationFn: ({ text, imageFile }: { text: string; imageFile?: File | null }) =>
      repo.createPost(text, imageFile),
    onSuccess: (newPost) => {
      setNewPostIds((prev) => {
        const next = new Set(prev);
        next.add(newPost.id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-step-condition'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      repo.addComment(postId, text),
    onSuccess: (_newComment, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social-post', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-step-condition'] });
    },
  });

  const publishPost = (text: string, imageFile?: File | null) => {
    publishPostMutation.mutate({ text, imageFile });
  };

  const addComment = (postId: string, text: string) => {
    addCommentMutation.mutate({ postId, text });
  };

  return {
    tags: tagsQuery.data ?? [],
    activeUsers: activeUsersQuery.data ?? [],
    tagsLoading: tagsQuery.isPending,
    activeUsersLoading: activeUsersQuery.isPending,
    loading: tagsQuery.isPending || activeUsersQuery.isPending,
    error:
      tagsQuery.error instanceof Error
        ? tagsQuery.error.message
        : activeUsersQuery.error instanceof Error
          ? activeUsersQuery.error.message
          : null,
    publishPost,
    addComment,
    refetchTags: tagsQuery.refetch,
    refetchActiveUsers: activeUsersQuery.refetch,
    newPostIds,
  };
}
