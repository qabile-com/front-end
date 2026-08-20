'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  IProfileRepository,
  MyProfile,
  ProfileSettingField,
} from '../domain/profile-repository';

export const rebirthStatusQueryKey = ['profile', 'rebirth-status'] as const;

export function useRebirthStatus(repo: IProfileRepository) {
  return useQuery({
    queryKey: rebirthStatusQueryKey,
    queryFn: ({ signal }) => repo.getRebirthStatus({ signal }),
    staleTime: 15_000,
  });
}

export function usePerformRebirth(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repo.performRebirth(),
    meta: { skipGlobalErrorToast: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rebirthStatusQueryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}

export function useUpdateProfileSetting(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ field, value }: { field: ProfileSettingField; value: boolean }) =>
      repo.updateSecuritySetting(field, value),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (securitySettings) => {
      queryClient.setQueryData<MyProfile | null>(['dashboard', 'profile', 'me'], (profile) =>
        profile ? { ...profile, securitySettings } : profile,
      );
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
    },
  });
}

export function useRequestPhoneChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ currentPhone }: { currentPhone: string }) =>
      repo.requestPhoneChangeCode(currentPhone),
    meta: { skipGlobalErrorToast: true },
  });
}

export function useVerifyPhoneChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ currentPhone, code }: { currentPhone: string; code: string }) =>
      repo.verifyPhoneChangeCode(currentPhone, code),
    meta: { skipGlobalErrorToast: true },
  });
}

export function useConfirmPhoneChange(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      newPhone,
      verificationToken,
    }: {
      newPhone: string;
      verificationToken: string;
    }) => repo.confirmPhoneChange(newPhone, verificationToken),
    meta: { skipGlobalErrorToast: true },
    onSuccess: (profile) => {
      queryClient.setQueryData(['dashboard', 'profile', 'me'], profile);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}

export function useRequestPasswordChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => repo.requestPasswordChangeCode(email),
    meta: { skipGlobalErrorToast: true },
  });
}

export function useVerifyPasswordChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      repo.verifyPasswordChangeCode(email, code),
    meta: { skipGlobalErrorToast: true },
  });
}

export function useConfirmPasswordChange(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({
      password,
      passwordConfirmation,
      verificationToken,
    }: {
      password: string;
      passwordConfirmation: string;
      verificationToken: string;
    }) => repo.confirmPasswordChange(password, passwordConfirmation, verificationToken),
    meta: { skipGlobalErrorToast: true },
  });
}
