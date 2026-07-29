'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout as logoutRequest } from '@/core/api/auth.api';
import { clearAuthSession, getRefreshToken } from '@/core/auth/token';
import { useAuthSession } from '@/providers/auth-provider';
import { createAuthRedirectHref } from '@/core/auth/redirect';

export function useAuthGuard() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useAuthSession();

  useEffect(() => {
    if (!isReady) return;
    if (!isLoggedIn) {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(createAuthRedirectHref(currentPath));
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
