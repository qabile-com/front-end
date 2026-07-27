import { getMe, refreshAuth } from '@/core/api/auth.api';
import {
  clearAuthSession,
  getStoredAuthSession,
  updateStoredTokens,
  type StoredAuthSession,
} from './token';

export type AuthEntryTarget = '/auth' | '/home';

const REFRESH_THRESHOLD_MS = 60_000;

export async function resolveAuthEntryTarget(): Promise<AuthEntryTarget> {
  const session = getStoredAuthSession();
  if (!session) return '/auth';

  if (shouldRefresh(session)) {
    if (!session.refreshToken) {
      clearAuthSession();
      return '/auth';
    }

    try {
      const response = await refreshAuth(session.refreshToken);
      updateStoredTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
      });
      return '/home';
    } catch {
      clearAuthSession();
      return '/auth';
    }
  }

  if (!session.user) {
    try {
      await getMe();
      return '/home';
    } catch {
      clearAuthSession();
      return '/auth';
    }
  }

  return '/home';
}

function shouldRefresh(session: StoredAuthSession) {
  if (!session.meta.expiresAt) return false;
  return session.meta.expiresAt <= Date.now() + REFRESH_THRESHOLD_MS;
}
