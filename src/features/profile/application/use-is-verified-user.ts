'use client';

import { useUserProfile } from '@/features/leaderboard/application/use-user-profile';
import { userProfileRepo } from '@/features/leaderboard/infrastructure/repository-factory';

/**
 * Verified status isn't on the current-user profile endpoint everywhere yet -
 * pass it directly (e.g. MyProfile.verified) when the caller already has it,
 * and this skips the extra request entirely. Only falls back to fetching the
 * user's own forum profile (the endpoint that does have `verified`, used
 * elsewhere for viewing other users) when the caller doesn't know yet.
 */
export function useIsVerifiedUser(userId?: string | null, knownVerified?: boolean) {
  const needsFetch = knownVerified === undefined;
  const forumProfile = useUserProfile(userProfileRepo, needsFetch ? (userId ?? '') : '');
  return knownVerified ?? Boolean(forumProfile.data?.verified);
}
