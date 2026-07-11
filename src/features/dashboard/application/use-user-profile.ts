// src/features/dashboard/application/use-user-profile.ts
'use client';

import { useState, useEffect } from 'react';
import type { IUserProfileRepository, UserProfileData } from '../domain/user-profile-repository';

export function useUserProfile(repo: IUserProfileRepository, userId: string) {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const profile = await repo.getUserProfile(userId);
        if (!cancelled) {
          setData(profile);
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

  return { data, loading, error };
}
