import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';

export function useDeleteOwnPost(repo: ISocialRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => repo.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social-post'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-step-condition'] });
    },
  });
}
