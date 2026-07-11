// src/features/dashboard/application/use-user-detail.ts
'use client';

import { useState, useEffect } from 'react';
import type { IUserDetailRepository } from '../domain/dashboard-repository';

export function useUserDetail(repo: IUserDetailRepository, userId: string | null) {
  const [detail, setDetail] = useState<Awaited<
    ReturnType<IUserDetailRepository['getUserDetail']>
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setDetail(null);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const d = await repo.getUserDetail(userId);
        if (!cancelled) {
          setDetail(d);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'خطا');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repo, userId]);

  return { detail, loading, error };
}
