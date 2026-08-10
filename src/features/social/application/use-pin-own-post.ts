import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';

export function usePinOwnPost(repo: ISocialRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isPinned }: { postId: string; isPinned: boolean }) =>
      repo.pinPost(postId, isPinned),
    onSuccess: (post) => {
      queryClient.setQueryData(['social-post', post.id], post);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social-post'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}
