const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_USER_KEY = 'authUser';
const AUTH_META_KEY = 'authMeta';
export const AUTH_SESSION_EVENT = 'qabile-auth-session-change';

export interface StoredAuthUser {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  username?: string | null;
  avatar?: string | null;
  phone?: string | null;
  email?: string | null;
  role: string;
  title?: string;
  level?: number;
  xp?: number;
  xpMax?: number;
  streak?: number;
  isCompleteOnboarding?: boolean;
}

export interface StoredAuthMeta {
  tokenType?: string;
  expiresAt?: number;
  refreshTokenExpiresAt?: number;
}

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string | null;
  user: StoredAuthUser | null;
  meta: StoredAuthMeta;
}

export const setAccessToken = (token: string) => {
  if (!canUseStorage()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthSessionChange();
};

export const getAccessToken = () => {
  if (!canUseStorage()) return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthSessionChange();
};

export const getRefreshToken = () => {
  if (!canUseStorage()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export function updateStoredTokens({
  accessToken,
  refreshToken,
  expiresAt,
  refreshTokenExpiresAt,
  tokenType,
}: {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: number | string | null;
  refreshTokenExpiresAt?: number | string | null;
  tokenType?: string;
}) {
  if (!canUseStorage()) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  const currentMeta = readJson<StoredAuthMeta>(AUTH_META_KEY) ?? {};
  localStorage.setItem(
    AUTH_META_KEY,
    JSON.stringify({
      ...currentMeta,
      tokenType: tokenType ?? currentMeta.tokenType,
      expiresAt: normalizeExpiresAt(expiresAt) ?? currentMeta.expiresAt,
      refreshTokenExpiresAt:
        normalizeExpiresAt(refreshTokenExpiresAt) ?? currentMeta.refreshTokenExpiresAt,
    }),
  );
  notifyAuthSessionChange();
}

export function saveAuthSession({
  accessToken,
  user,
  tokenType,
  expiresInSeconds,
  expiresAt,
  refreshTokenExpiresAt,
  refreshToken,
}: {
  accessToken: string;
  user: StoredAuthUser;
  tokenType?: string;
  expiresInSeconds?: number;
  expiresAt?: number | string | null;
  refreshTokenExpiresAt?: number | string | null;
  refreshToken?: string | null;
}) {
  if (!canUseStorage()) return;

  const meta: StoredAuthMeta = {
    tokenType,
    expiresAt:
      normalizeExpiresAt(expiresAt) ??
      (expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : undefined),
    refreshTokenExpiresAt: normalizeExpiresAt(refreshTokenExpiresAt),
  };

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_META_KEY, JSON.stringify(meta));
  notifyAuthSessionChange();
}

export function updateStoredAuthUser(patch: Partial<StoredAuthUser>) {
  if (!canUseStorage()) return;
  const currentUser = readJson<StoredAuthUser>(AUTH_USER_KEY);
  if (!currentUser) return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ ...currentUser, ...patch }));
  notifyAuthSessionChange();
}

function normalizeExpiresAt(value?: number | string | null) {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return value < 10_000_000_000 ? value * 1000 : value;
}

export function getStoredAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const user = readJson<StoredAuthUser>(AUTH_USER_KEY);
  const meta = readJson<StoredAuthMeta>(AUTH_META_KEY) ?? {};

  if (meta.expiresAt && meta.expiresAt <= Date.now() && !refreshToken) {
    clearAuthSession();
    return null;
  }

  return { accessToken, refreshToken, user, meta };
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_META_KEY);
  notifyAuthSessionChange();
}

function readJson<T>(key: string): T | null {
  const value = localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function notifyAuthSessionChange() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
