import { ApiError } from '@/core/api/http-client';

const POST_LOCK_PATTERN = /Post creation is locked until ([0-9TZ:.-]+)\.?/i;

export function getPostPublishErrorMessage(error: unknown) {
  const message =
    error instanceof ApiError || error instanceof Error ? error.message.trim() : '';
  const lockMatch = message.match(POST_LOCK_PATTERN);

  if (lockMatch?.[1]) {
    const unlockDate = new Date(lockMatch[1]);
    if (!Number.isNaN(unlockDate.getTime())) {
      return `فعلا امکان انتشار پست جدید وجود ندارد. از ${formatLocalDateTime(unlockDate)} دوباره می‌توانی پست منتشر کنی.`;
    }
  }

  return message || 'انتشار پست انجام نشد.';
}

function formatLocalDateTime(date: Date) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
