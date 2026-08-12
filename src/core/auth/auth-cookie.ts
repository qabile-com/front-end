export const AUTH_COOKIE_NAME = 'qb_auth';

const FALLBACK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function setAuthCookie(expiresAt?: number) {
  if (typeof document === 'undefined') return;

  const maxAgeSeconds = expiresAt
    ? Math.max(60, Math.floor((expiresAt - Date.now()) / 1000))
    : FALLBACK_MAX_AGE_SECONDS;
  const secure = location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
