'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout as logoutRequest } from '@/core/api/auth.api';
import { clearAuthSession, getRefreshToken } from '@/core/auth/token';
import { useAuthSession } from '@/providers/auth-provider';

export function useAuthGuard() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useAuthSession();

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn) {
      router.replace('/auth');
    }
  }, [isLoggedIn, isReady, router]);

  return { isReady, isLoggedIn };
}

export function useLogout() {
  const router = useRouter();
  return () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      void logoutRequest(refreshToken).catch(() => undefined);
    }
    clearAuthSession();
    router.replace('/auth');
  };
}
