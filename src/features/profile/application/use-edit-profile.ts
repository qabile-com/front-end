'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStoredAuthUser } from '@/core/auth/token';
import type {
  IProfileRepository,
  MyProfile,
  UpdateProfileInput,
} from '../domain/profile-repository';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';

export function useUpdateMyProfile(
  repo: IProfileRepository,
  onReward?: (reward?: ActionRewardResult | null) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => repo.updateMyProfile(input),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (profile) => {
      onReward?.(profile.actionReward);
      queryClient.setQueryData(['dashboard', 'profile', 'me'], profile);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}

export function useUpdateProfileAvatar(
  repo: IProfileRepository,
  onReward?: (reward?: ActionRewardResult | null) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => repo.updateProfileAvatar(file),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (profile) => {
      onReward?.(profile.actionReward);
      updateAvatarCaches(queryClient, profile);
    },
  });
}

export function useDeleteProfileAvatar(
  repo: IProfileRepository,
  onReward?: (reward?: ActionRewardResult | null) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repo.deleteProfileAvatar(),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (profile) => {
      onReward?.(profile.actionReward);
      updateAvatarCaches(queryClient, profile);
    },
  });
}

export function useRequestEmailVerification(repo: IProfileRepository) {
  return useMutation({
    mutationFn: (email: string) => repo.requestEmailVerification(email),
  });
}

function updateAvatarCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  profile: MyProfile,
) {
  updateStoredAuthUser({ avatar: profile.avatar });
  queryClient.setQueryData(['dashboard', 'profile', 'me'], profile);
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
  queryClient.invalidateQueries({ queryKey: ['social-feed'] });
  queryClient.invalidateQueries({ queryKey: ['social-post'] });
  queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
  queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'comments'] });
}

export function useDeleteMyAccount(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repo.deleteMyAccount(),
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.setQueryData<MyProfile | null>(['dashboard', 'profile', 'me'], null);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}
