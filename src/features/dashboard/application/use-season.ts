'use client';

import { useState, useEffect, useRef } from 'react';
import type { ISeasonRepository, SeasonData } from '../domain/season-repository';

export function useSeason(repo: ISeasonRepository) {
  const [data, setData] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    let cancelled = false;

    (async () => {
      try {
        const season = await repo.getCurrentSeason();
        if (!cancelled) {
          setData(season);
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
