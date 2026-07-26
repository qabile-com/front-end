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
      const previousData = queryClient.getQueryData<InfiniteData<Post[]>>(['social-feed']);
      // Optimistically update the post
      queryClient.setQueryData<InfiniteData<Post[]>>(['social-feed'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId ? { ...post, likedByMe: true, likes: post.likes + 1 } : post,
            ),
          ),
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['social-feed'], context?.previousData);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => repo.unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['social-feed'] });
      const previousData = queryClient.getQueryData<InfiniteData<Post[]>>(['social-feed']);
      queryClient.setQueryData<InfiniteData<Post[]>>(['social-feed'], (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId ? { ...post, likedByMe: false, likes: post.likes - 1 } : post,
            ),
          ),
        };
      });
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['social-feed'], context?.previousData);
    },
  });

  return { like: likeMutation.mutate, unlike: unlikeMutation.mutate };
}
