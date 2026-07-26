'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  IProfileRepository,
  MyProfile,
  ProfileSettingField,
} from '../domain/profile-repository';

export function useUpdateProfileSetting(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ field, value }: { field: ProfileSettingField; value: boolean }) =>
      repo.updateSecuritySetting(field, value),
    onSuccess: (securitySettings) => {
      queryClient.setQueryData<MyProfile | null>(['dashboard', 'profile', 'me'], (profile) =>
        profile ? { ...profile, securitySettings } : profile,
      );
    },
  });
}

export function useRequestPhoneChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ currentPhone }: { currentPhone: string }) =>
      repo.requestPhoneChangeCode(currentPhone),
  });
}

export function useVerifyPhoneChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ currentPhone, code }: { currentPhone: string; code: string }) =>
      repo.verifyPhoneChangeCode(currentPhone, code),
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
    onSuccess: (profile) => {
      queryClient.setQueryData(['dashboard', 'profile', 'me'], profile);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
    },
  });
}

export function useRequestPasswordChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ email }: { email: string }) => repo.requestPasswordChangeCode(email),
  });
}

export function useVerifyPasswordChangeCode(repo: IProfileRepository) {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      repo.verifyPasswordChangeCode(email, code),
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
  });
}
