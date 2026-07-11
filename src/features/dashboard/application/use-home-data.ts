// src/features/dashboard/application/use-home-data.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import type { IHomeRepository } from '../domain/dashboard-repository';
import type { StatCard, RoadmapItem, ChatMessage } from '../domain/dashboard.types';

export function useHomeData(repo: IHomeRepository) {
  const [data, setData] = useState<{
    stats: StatCard[];
    roadmap: RoadmapItem[];
    aiSeed: ChatMessage;
    aiQuickReplies: { label: string; send: string }[];
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
        const d = await repo.getHomeData();
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
