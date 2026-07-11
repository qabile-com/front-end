// src/features/dashboard/application/use-profile.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import type { IProfileRepository } from '../domain/dashboard-repository';
import type { Achievement, SettingItem } from '../domain/dashboard.types';

export function useProfile(repo: IProfileRepository) {
  const [data, setData] = useState<{
    profileStats: { value: string; label: string }[];
    achievements: Achievement[];
    settings: SettingItem[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    let cancelled = false;
    (async () => {
      try {
        const d = await repo.getProfileData();
        if (!cancelled) {
          setData(d);
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

  return { data, loading, error };
}
