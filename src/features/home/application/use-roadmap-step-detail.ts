// src/features/dashboard/application/use-roadmap-step-detail.ts
'use client';

import { useState, useEffect } from 'react';
import type { IRoadmapStepRepository } from '../domain/roadmap-repository';
import type { RoadmapStepDetail } from '../domain/roadmap.types';

export function useRoadmapStepDetail(repo: IRoadmapStepRepository, stepId: number) {
  const [detail, setDetail] = useState<RoadmapStepDetail | null>(null);
  const [loading, setLoading] = useState(true); // starts true because remount resets state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      try {
        const data = await repo.getStepDetail(stepId);
        if (!cancelled) {
          setDetail(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'خطا');
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [repo, stepId]);

  return { detail, loading, error };
}
