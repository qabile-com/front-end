// src/features/dashboard/application/use-social-data.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ISocialRepository } from '../domain/social-repository';
import type { Post, ActiveUser } from '../domain/social.data';

export function useSocialData(repo: ISocialRepository) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    let cancelled = false;

    const load = async () => {
      try {
        const [feed, trendingTags, users] = await Promise.all([
          repo.getFeed(),
          repo.getTrendingTags(),
          repo.getActiveUsers(),
        ]);
        if (!cancelled) {
          setPosts(feed);
          setTags(trendingTags);
          setActiveUsers(users);
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
  }, [repo]);

  const publishPost = useCallback(
    async (text: string, location?: string, emoji?: string) => {
      try {
        const newPost = await repo.createPost(text, location, emoji);
        setPosts((prev) => [newPost, ...prev]);
      } catch (e) {
        // handle error (optional)
      }
    },
    [repo],
  );

  return { posts, tags, activeUsers, loading, error, publishPost };
}
