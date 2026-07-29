const DEFAULT_AFTER_AUTH_PATH = '/courses';

export function createAuthRedirectHref(currentPath: string) {
  const next = getSafeRedirectPath(currentPath, DEFAULT_AFTER_AUTH_PATH);
  return `/auth?next=${encodeURIComponent(next)}`;
}

export function getSafeRedirectPath(value?: string | null, fallback = DEFAULT_AFTER_AUTH_PATH) {
  if (!value) return fallback;

  let next = value.trim();
  try {
    next = decodeURIComponent(next);
  } catch {
    // URLSearchParams already decodes values; keep the raw string if decoding fails.
  }

  if (!next.startsWith('/')) return fallback;
  if (next.startsWith('//')) return fallback;
  if (next.startsWith('/auth')) return fallback;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(next)) return fallback;

  return next;
}
