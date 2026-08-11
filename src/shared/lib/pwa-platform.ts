export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  return /iPhone|iPad|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && window.navigator.standalone === true)
  );
}
