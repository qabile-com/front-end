export interface SharePayload {
  title: string;
  text?: string;
  path?: string;
  url?: string;
}

export async function shareUrl(payload: SharePayload) {
  const url = payload.url ?? buildAbsoluteUrl(payload.path ?? '/');
  const text = payload.text;

  if (navigator.share) {
    await navigator.share({ title: payload.title, text, url });
    return;
  }

  await navigator.clipboard.writeText(url);
}

export function buildAbsoluteUrl(path: string) {
  if (typeof window === 'undefined') return path;
  return new URL(path, window.location.origin).toString();
}
