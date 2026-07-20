// src/features/dashboard/application/use-social-data.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';
import type { ActiveUser, Post } from '../domain/social.data';

type SocialQueryData = {
  posts: Post[];
  tags: string[];
  activeUsers: ActiveUser[];
};

export function useSocialData(repo: ISocialRepository) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dashboard', 'social'],
    queryFn: async (): Promise<SocialQueryData> => {
      const [posts, tags, activeUsers] = await Promise.all([
        repo.getFeed(),
        repo.getTrendingTags(),
        repo.getActiveUsers(),
      ]);

      return { posts, tags, activeUsers };
    },
    staleTime: 60_000,
    retry: 1,
  });

  const publishPostMutation = useMutation({
    mutationFn: ({
      text,
      location,
      emoji,
      imageFile,
      gifUrl,
    }: {
      text: string;
      location?: string;
      emoji?: string;
      imageFile?: File | null;
      gifUrl?: string;
    }) => repo.createPost(text, location, emoji, imageFile, gifUrl),
    onSuccess: (newPost) => {
      queryClient.setQueryData<SocialQueryData>(['dashboard', 'social'], (current) =>
        current ? { ...current, posts: [newPost, ...current.posts] } : current,
      );
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      repo.addComment(postId, text),
    onSuccess: (newComment, variables) => {
      queryClient.setQueryData<SocialQueryData>(['dashboard', 'social'], (current) =>
        current
          ? {
              ...current,
              posts: current.posts.map((post) =>
                post.id === variables.postId
                  ? { ...post, comments: [...post.comments, newComment] }
                  : post,
              ),
            }
          : current,
      );
    },
  });

  const publishPost = (
    text: string,
    location?: string,
    emoji?: string,
    imageFile?: File | null,
    gifUrl?: string,
  ) => {
    publishPostMutation.mutate({ text, location, emoji, imageFile, gifUrl });
  };

  const addComment = (postId: string, text: string) => {
    addCommentMutation.mutate({ postId, text });
  };

  return {
    posts: query.data?.posts ?? [],
    tags: query.data?.tags ?? [],
    activeUsers: query.data?.activeUsers ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    publishPost,
    addComment,
  };
}
