'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { IAuthRepository } from '../domain/auth-repository';
import { showError } from '@/shared/lib/toast';
import { setAccessToken } from '@/core/auth/token';

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
      } catch (e: any) {
        setLoading(false);
        showError(e.message || 'خطا در ارسال کد');
        return false;
      }
    },
    [repo],
  );

  const verifyOtp = useCallback(
    async (identifier: string, code: string, name?: string) => {
      setLoading(true);
      try {
        const user = await repo.verifyOtp(identifier, code, name);
        setSuccess({
          title: `خوش آمدی ${user.name}! 🔥`,
          msg: 'ورود موفقیت‌آمیز بود. در حال ورود به قبیله...',
        });
        setTimeout(() => router.push('/dashboard'), 1200);
      } catch (e: any) {
        setLoading(false);
        showError(e.message || 'کد تایید اشتباه است');
      }
    },
    [repo, router],
  );

  return { loading, success, requestOtp, verifyOtp, clearSuccess: () => setSuccess(null) };
}
