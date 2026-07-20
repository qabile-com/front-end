'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { IAuthRepository } from '../domain/auth-repository';
import { showError } from '@/shared/lib/toast';
import { saveAuthSession } from '@/core/auth/token';

export function useAuth(repo: IAuthRepository) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ title: string; msg: string } | null>(null);

  const requestOtp = useCallback(
    async (identifier: string) => {
      setLoading(true);
      try {
        await repo.requestOtp(identifier);
        setLoading(false);
        return true;
      } catch (e: unknown) {
        setLoading(false);
        showError(getErrorMessage(e, 'خطا در ارسال کد'));
        return false;
      }
    },
    [repo],
  );

  const verifyOtp = useCallback(
    async (identifier: string, code: string, name?: string, lastName?: string) => {
      setLoading(true);
      try {
        const session = await repo.verifyOtp(identifier, code, name, lastName);
        saveAuthSession(session);
        setSuccess({
          title: `خوش آمدی ${session.user.name}! 🔥`,
          msg: 'ورود موفقیت‌آمیز بود. در حال ورود به قبیله...',
        });
        setTimeout(() => router.push('/dashboard'), 1200);
      } catch (e: unknown) {
        setLoading(false);
        showError(getErrorMessage(e, 'کد تایید اشتباه است'));
      }
    },
    [repo, router],
  );

  return { loading, success, requestOtp, verifyOtp, clearSuccess: () => setSuccess(null) };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
