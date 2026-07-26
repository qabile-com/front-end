'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuthSession } from '@/core/auth/token';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { IAuthRepository, VerifyOtpResult } from '../domain/auth-repository';

export function useAuth(repo: IAuthRepository) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ title: string; msg: string } | null>(null);

  const completeLogin = useCallback(
    (session: VerifyOtpResult) => {
      saveAuthSession(session);

      if (session.isNewUser && session.signupReward) {
        sessionStorage.setItem('signupReward', JSON.stringify(session.signupReward));
      }
      if (session.unlockedAchievements?.length) {
        sessionStorage.setItem('signupAchievements', JSON.stringify(session.unlockedAchievements));
      }

      setSuccess({
        title: `خوش آمدی ${session.user.name}! 🔥`,
        msg: 'ورود موفقیت‌آمیز بود. در حال ورود به قبیله...',
      });
      setTimeout(() => router.push('/courses'), 900);
    },
    [router],
  );

  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const session = await repo.login(email, password);
        completeLogin(session);
        return true;
      } catch (error: unknown) {
        showError(getErrorMessage(error, 'ورود ناموفق بود. ایمیل یا رمز عبور را بررسی کنید.'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [completeLogin, repo],
  );

  const requestOtp = useCallback(
    async (identifier: string) => {
      setLoading(true);
      try {
        await repo.requestOtp(identifier);
        return true;
      } catch (error: unknown) {
        showError(getErrorMessage(error, 'خطا در ارسال کد'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [repo],
  );

  const verifyOtp = useCallback(
    async (identifier: string, code: string, name?: string, lastName?: string) => {
      setLoading(true);
      try {
        const session = await repo.verifyOtp(identifier, code, name, lastName);
        completeLogin(session);
        return true;
      } catch (error: unknown) {
        showError(getErrorMessage(error, 'کد تایید اشتباه است'));
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
        await repo.requestForgotPassword(email);
        showSuccess('کد بازیابی رمز عبور ارسال شد');
        return true;
      } catch (error: unknown) {
        showError(getErrorMessage(error, 'کد بازیابی ارسال نشد'));
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
        showError(getErrorMessage(error, 'کد بازیابی اشتباه است'));
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
        await repo.resetPassword(verificationToken, password, passwordConfirmation);
        showSuccess('رمز عبور با موفقیت تغییر کرد');
        return true;
      } catch (error: unknown) {
        showError(getErrorMessage(error, 'رمز عبور تغییر نکرد'));
        return false;
      } finally {
        setLoading(false);
      }
    },
    [repo],
  );

  return {
    loading,
    success,
    loginWithPassword,
    requestOtp,
    verifyOtp,
    requestForgotPassword,
    verifyForgotPassword,
    resetPassword,
    clearSuccess: () => setSuccess(null),
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
