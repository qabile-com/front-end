import { toPersianDigits } from './persian';

const rtf = new Intl.RelativeTimeFormat('fa-IR', { numeric: 'auto' });

export function formatRelativeTime(value?: string | null) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absSeconds = Math.abs(diffSeconds);

  if (absSeconds < 45) return 'همین حالا';
  if (absSeconds < 90) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (absSeconds < 45 * 60) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (absSeconds < 90 * 60) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  if (absSeconds < 22 * 3600) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  if (absSeconds < 36 * 3600) return rtf.format(Math.round(diffSeconds / 86400), 'day');
  if (absSeconds < 7 * 86400) return rtf.format(Math.round(diffSeconds / 86400), 'day');

  return toPersianDigits(
    new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date),
  );
}
