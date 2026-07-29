'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IUserProfileRepository, UserProfileData } from '../domain/user-profile-repository';
import { showError, showSuccess } from '@/shared/lib/toast';

export function useBlockToggle(repo: IUserProfileRepository, userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blockedByMe: boolean) => {
      if (blockedByMe) {
        await repo.unblockUser(userId);
        return false;
      }

      await repo.blockUser(userId);
      return true;
    },
    onMutate: async (blockedByMe) => {
      const nextBlocked = !blockedByMe;
      const queryKey = ['dashboard', 'profile', userId];

      await queryClient.cancelQueries({ queryKey });
      const previousProfile = queryClient.getQueryData<UserProfileData>(queryKey);

      queryClient.setQueryData<UserProfileData>(queryKey, (current) =>
        current
          ? {
              ...current,
              blockedByMe: nextBlocked,
              canFollow: nextBlocked ? false : current.canFollow,
              followedByMe: nextBlocked ? false : current.followedByMe,
            }
          : current,
      );

      return { previousProfile };
    },
    onError: (error, _blockedByMe, context) => {
      queryClient.setQueryData(['dashboard', 'profile', userId], context?.previousProfile);
      showError(error instanceof Error ? error.message : 'Block action failed.');
    },
    onSuccess: (blocked) => {
      showSuccess(blocked ? 'User blocked.' : 'User unblocked.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
    },
  });
}
