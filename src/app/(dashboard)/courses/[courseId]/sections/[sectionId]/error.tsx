'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/shared/ui';

export default function SessionError({
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
        title="این جلسه درست بارگذاری نشد"
        message="مشکلی در نمایش این جلسه پیش آمد - ویدیو، نظرات یا وضعیت خرید. دوباره تلاش کن یا به لیست کورس‌ها برگرد."
        action={{ label: 'تلاش دوباره', onClick: reset, icon: 'bolt' }}
        secondaryAction={{ label: 'بازگشت به کورس‌ها', href: '/courses', icon: 'book' }}
      />
    </div>
  );
}
