'use client';

import { useQuery } from '@tanstack/react-query';
import type { ISocialRepository, PostingStatus } from '../domain/social-repository';
import { toPersianDigits } from '@/core/lib/persian';

export const postingStatusQueryKey = ['social', 'posting-status'] as const;

export function usePostingStatus(repo: ISocialRepository) {
  return useQuery({
    queryKey: postingStatusQueryKey,
    queryFn: ({ signal }) => repo.getPostingStatus({ signal }),
    staleTime: 30_000,
    retry: 1,
  });
}

export function isPostingLocked(status: PostingStatus | undefined, remainingSeconds: number) {
  return Boolean(status?.isLocked || status?.canCreatePost === false || remainingSeconds > 0);
}

export function getPostingRemainingSeconds(status: PostingStatus | undefined, now: number) {
  if (!status) return 0;
  if (status.lockedUntil) {
    const lockedUntilTime = new Date(status.lockedUntil).getTime();
    if (!Number.isNaN(lockedUntilTime)) {
      return Math.max(0, Math.ceil((lockedUntilTime - now) / 1000));
    }
  }

  return Math.max(0, Math.floor(status.remainingSeconds ?? 0));
}

export function formatPostingRemainingTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const restSeconds = seconds % 60;

  if (hours > 0) {
    return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(minutes)} دقیقه`;
  }

  return `${toPersianDigits(minutes)} دقیقه و ${toPersianDigits(restSeconds)} ثانیه`;
}
