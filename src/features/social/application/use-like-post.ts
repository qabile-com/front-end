import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';
import type { InfiniteData } from '@tanstack/react-query';
import type { Post } from '../domain/social.data';

export function useLikePost(repo: ISocialRepository) {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: (postId: string) => repo.likePost(postId),
    onMutate: async (postId) => {
      // Cancel ongoing queries for social feed
      await queryClient.cancelQueries({ queryKey: ['social-feed'] });
      const previousData = queryClient.getQueriesData<InfiniteData<Post[]>>({
        queryKey: ['social-feed'],
      });
      // Optimistically update the post
      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: ['social-feed'] }, (old) =>
        updateFeedPost(old, postId, (post) => ({
          ...post,
          likedByMe: true,
          likes: post.likes + 1,
        })),
      );
      queryClient.setQueryData<Post>(['social-post', postId], (post) =>
        post ? { ...post, likedByMe: true, likes: post.likes + 1 } : post,
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      context?.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => repo.unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['social-feed'] });
      const previousData = queryClient.getQueriesData<InfiniteData<Post[]>>({
        queryKey: ['social-feed'],
      });
      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: ['social-feed'] }, (old) =>
        updateFeedPost(old, postId, (post) => ({
          ...post,
          likedByMe: false,
          likes: Math.max(0, post.likes - 1),
        })),
      );
      queryClient.setQueryData<Post>(['social-post', postId], (post) =>
        post ? { ...post, likedByMe: false, likes: Math.max(0, post.likes - 1) } : post,
      );
      return { previousData };
    },
    onError: (err, variables, context) => {
      context?.previousData.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
  });

  return { like: likeMutation.mutate, unlike: unlikeMutation.mutate };
}

function updateFeedPost(
  old: InfiniteData<Post[]> | undefined,
  postId: string,
  update: (post: Post) => Post,
) {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => page.map((post) => (post.id === postId ? update(post) : post))),
  };
}
