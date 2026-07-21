'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, removeAccessToken } from '@/core/auth/token';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace('/auth');
    }
  }, [router]);
}

export function useLogout() {
  const router = useRouter();
  return () => {
    removeAccessToken();
    router.replace('/auth');
  };
}
