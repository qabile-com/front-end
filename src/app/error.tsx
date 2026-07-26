'use client';

import { useEffect } from 'react';
import { ErrorState, MotionPage } from '@/shared/ui';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 [background:var(--color-bg)]">
      <MotionPage className="w-full">
        <ErrorState
          title="صفحه درست بارگذاری نشد"
          message="یک خطای غیرمنتظره رخ داد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی برگردید."
          action={{ label: 'تلاش دوباره', onClick: reset, icon: 'bolt' }}
          secondaryAction={{ label: 'صفحه اصلی', href: '/', icon: 'home' }}
        />
      </MotionPage>
    </main>
  );
}
