import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IAdminRepository } from '../domain/admin-repository';

export function useAdminPinPost(repo: IAdminRepository) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, isPinned }: { postId: string; isPinned: boolean }) =>
      repo.pinPost(postId, isPinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

export function useAdminDeletePost(repo: IAdminRepository) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => repo.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

export function useAdminDeleteComment(repo: IAdminRepository) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => repo.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}
