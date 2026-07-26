'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-96 items-center justify-center">
      <ErrorState
        title="این بخش آماده نشد"
        message="احتمالاً ارتباط با سرور قطع شده یا داده‌های این بخش کامل نیست. دوباره تلاش کن."
        action={{ label: 'تلاش دوباره', onClick: reset, icon: 'bolt' }}
        secondaryAction={{ label: 'رفتن به کورس‌ها', href: '/courses', icon: 'social' }}
      />
    </div>
  );
}
