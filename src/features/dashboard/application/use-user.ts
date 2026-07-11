'use client';

import { useState, useEffect, useRef } from 'react';
import type { IUserRepository } from '../domain/dashboard-repository';
import type { CurrentUser } from '../domain/dashboard.types';

export function useUser(repo: IUserRepository) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    let cancelled = false;
    (async () => {
      try {
        const u = await repo.getCurrentUser();
        if (!cancelled) {
          setUser(u);
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
  }, [repo]);

  return { user, loading, error };
}
