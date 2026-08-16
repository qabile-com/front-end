'use client';

import { useEffect } from 'react';
import { BackgroundField, ErrorState, MotionPage } from '@/shared/ui';
import { SiteNav } from '@/features/landing/presentation/sections/site-nav';

export default function DownloadError({
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
    <MotionPage>
      <BackgroundField />
      <SiteNav />
      <main className="flex min-h-[calc(100dvh-72px)] items-center justify-center px-4 pt-[72px]">
        <ErrorState
          title="صفحه دانلود بارگذاری نشد"
          message="یک خطای غیرمنتظره رخ داد. می‌توانید دوباره تلاش کنید یا به صفحه اصلی برگردید."
          action={{ label: 'تلاش دوباره', onClick: reset, icon: 'bolt' }}
          secondaryAction={{ label: 'صفحه اصلی', href: '/', icon: 'home' }}
        />
      </main>
    </MotionPage>
  );
}
