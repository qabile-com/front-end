const ACCESS_TOKEN_KEY = 'accessToken';
const AUTH_USER_KEY = 'authUser';
const AUTH_META_KEY = 'authMeta';
export const AUTH_SESSION_EVENT = 'qabile-auth-session-change';

export interface StoredAuthUser {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
}

export interface StoredAuthMeta {
  tokenType?: string;
  expiresAt?: number;
}

export interface StoredAuthSession {
  accessToken: string;
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

export function saveAuthSession({
  accessToken,
  user,
  tokenType,
  expiresInSeconds,
}: {
  accessToken: string;
  user: StoredAuthUser;
  tokenType?: string;
  expiresInSeconds?: number;
}) {
  if (!canUseStorage()) return;

  const meta: StoredAuthMeta = {
    tokenType,
    expiresAt: expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : undefined,
  };

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_META_KEY, JSON.stringify(meta));
  notifyAuthSessionChange();
}

export function getStoredAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;

  const user = readJson<StoredAuthUser>(AUTH_USER_KEY);
  const meta = readJson<StoredAuthMeta>(AUTH_META_KEY) ?? {};

  if (meta.expiresAt && meta.expiresAt <= Date.now()) {
    clearAuthSession();
    return null;
  }

  return { accessToken, user, meta };
}

export function clearAuthSession() {
  if (!canUseStorage()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
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
