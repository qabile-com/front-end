'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuthSession } from '@/core/auth/token';
import { useAuthSession } from '@/providers/auth-provider';
import { showError, showSuccess } from '@/shared/lib/toast';
import type {
  GoogleAuthPayload,
  IAuthRepository,
  VerifyOtpResult,
} from '../domain/auth-repository';
import { getAuthErrorMessage } from './auth-error-message';
import { createMockGoogleAuthSession } from './mock-google-auth';

function resolveUserName(user: VerifyOtpResult['user']): string {
  if (user.displayName?.trim()) return user.displayName.trim();
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (user.name?.trim()) return user.name.trim();
  return 'کاربر جدید';
}

export function useAuth(repo: IAuthRepository, getRedirectTo: () => string = () => '/courses') {
  const router = useRouter();
  const { refreshFromStorage } = useAuthSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ title: string; msg: string } | null>(null);

  const completeLogin = useCallback(
    (session: VerifyOtpResult) => {
      saveAuthSession(session);
      refreshFromStorage();

      const firstLoginReward =
        session.firstLoginReward ?? (session.isNewUser ? session.signupReward : undefined);

      if (firstLoginReward) {
        sessionStorage.setItem('signupReward', JSON.stringify(firstLoginReward));
        sessionStorage.setItem('showInstallAfterFirstLoginReward', '1');
      }

      if (session.unlockedAchievements?.length) {
        sessionStorage.setItem('signupAchievements', JSON.stringify(session.unlockedAchievements));
      }

      const userName = resolveUserName(session.user);
      setSuccess({
        title: `خوش آمدی ${userName}! 🔥`,
        msg: 'ورود موفقیت‌آمیز بود. در حال ورود به قبیله...',
      });
      setTimeout(() => router.push(getRedirectTo()), 900);
    },
    [getRedirectTo, refreshFromStorage, router],
  );

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const session = await repo.login(email, password);
        completeLogin(session);
        return true;
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'ورود ناموفق بود. ایمیل یا رمز عبور را بررسی کن.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [completeLogin, repo],
  );

  const requestOtp = useCallback(
    async (identifier: string, referralCode?: string) => {
      setLoading(true);
      try {
        const message = await repo.requestOtp(identifier, referralCode);
        if (message) showSuccess(message);
        return true;
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'کد تایید ارسال نشد.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [repo],
  );

  const verifyOtp = useCallback(
    async (identifier: string, code: string, referralCode?: string) => {
      setLoading(true);
      try {
        const session = await repo.verifyOtp(identifier, code, referralCode);
        completeLogin(session);
        return true;
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'کد تایید درست نیست.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [completeLogin, repo],
  );

  const requestForgotPassword = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        const message = await repo.requestForgotPassword(email);
        showSuccess(message || 'کد بازیابی رمز عبور ارسال شد');
        return true;
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'کد بازیابی ارسال نشد.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [repo],
  );

  const verifyForgotPassword = useCallback(
    async (email: string, code: string) => {
      setLoading(true);
      try {
        return await repo.verifyForgotPassword(email, code);
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'کد بازیابی درست نیست.'));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [repo],
  );

  const resetPassword = useCallback(
    async (verificationToken: string, password: string, passwordConfirmation: string) => {
      setLoading(true);
      try {
        const message = await repo.resetPassword(verificationToken, password, passwordConfirmation);
        showSuccess(message || 'رمز عبور با موفقیت تغییر کرد');
        return true;
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'رمز عبور تغییر نکرد.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [repo],
  );

  const loginWithGoogle = useCallback(
    async (payload: GoogleAuthPayload) => {
      setLoading(true);
      try {
        const session = payload.mock
          ? createMockGoogleAuthSession(payload)
          : await repo.loginWithGoogle(payload);
        completeLogin(session);
        return true;
      } catch (error: unknown) {
        showError(getAuthErrorMessage(error, 'ورود با گوگل انجام نشد.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [completeLogin, repo],
  );

  return {
    loading,
    success,
    loginWithPassword,
    loginWithGoogle,
    requestOtp,
    verifyOtp,
    requestForgotPassword,
    verifyForgotPassword,
    resetPassword,
    clearSuccess: () => setSuccess(null),
  };
}
