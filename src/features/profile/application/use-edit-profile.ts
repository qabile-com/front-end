'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
    onSuccess: (profile) => {
      onReward?.(profile.actionReward);
      queryClient.setQueryData(['dashboard', 'profile', 'me'], profile);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}

export function useRequestEmailVerification(repo: IProfileRepository) {
  return useMutation({
    mutationFn: (email: string) => repo.requestEmailVerification(email),
  });
}

export function useDeleteMyAccount(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repo.deleteMyAccount(),
    onSuccess: () => {
      queryClient.setQueryData<MyProfile | null>(['dashboard', 'profile', 'me'], null);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}
