// src/features/landing/application/use-landing-data.ts

'use client';

import { useState, useEffect } from 'react';
import type { ILandingRepository } from '../domain/landing-repository';
import type { LandingData } from '../domain/landing.data';

/**
 * Hook that fetches landing data using a provided repository.
 * This hook is pure logic – it doesn't know whether the repo
 * is mock, HTTP, etc.
 */
export function useLandingData(repository: ILandingRepository) {
  const [data, setData] = useState<LandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const result = await repository.getLandingData();
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'خطا در دریافت اطلاعات');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  return { data, loading, error };
}
