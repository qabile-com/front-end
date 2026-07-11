// src/features/dashboard/application/use-leaderboard.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import type { ILeaderboardRepository } from '../domain/dashboard-repository';
import type { PodiumPlace, LbRow } from '../domain/dashboard.types';

export function useLeaderboard(repo: ILeaderboardRepository) {
  const [data, setData] = useState<{
    podium: PodiumPlace[];
    leaderboard: LbRow[];
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
        const d = await repo.getLeaderboardData();
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
