'use client';

import { useEffect } from 'react';
import { ErrorState, MotionPage } from '@/shared/ui';

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 [background:var(--color-bg)]">
      <MotionPage className="w-full">
        <ErrorState
          title="ورود آماده نشد"
          message="در بارگذاری صفحه ورود مشکلی پیش آمد. دوباره تلاش کن یا به صفحه اصلی برگرد."
          action={{ label: 'تلاش دوباره', onClick: reset, icon: 'bolt' }}
          secondaryAction={{ label: 'صفحه اصلی', href: '/', icon: 'home' }}
        />
      </MotionPage>
    </main>
  );
}
