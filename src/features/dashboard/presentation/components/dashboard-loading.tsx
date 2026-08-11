'use client';

import { ErrorState, OptionalImage, PageSkeleton, Skeleton } from '@/shared/ui';

export function TabLoader() {
  return <PageSkeleton />;
}

export function TabError({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <ErrorState
        compact
        title="داده‌ها دریافت نشد"
        message={error}
        action={onRetry ? { label: 'تلاش دوباره', onClick: onRetry, icon: 'bolt' } : undefined}
        secondaryAction={{ label: 'کورس‌ها', href: '/courses', icon: 'social' }}
      />
    </div>
  );
}

export function DashboardLoader() {
  return (
    <div className="dashboard-scope min-h-screen overflow-hidden [background:radial-gradient(45%_35%_at_50%_38%,rgba(255,98,0,.14),transparent_65%),radial-gradient(35%_25%_at_50%_58%,rgba(243,186,99,.08),transparent_70%),var(--color-bg)]">
      <div className="hidden lg:block">
        <div className="border-hair fixed inset-y-0 inset-s-0 w-65 border-e px-4.5 py-7 [background:rgba(8,5,2,.92)]">
          <div className="mb-8 flex items-center gap-3">
            <Skeleton className="size-10 rounded-[13px]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="mb-5 h-18 rounded-[20px]" />
          <Skeleton className="mb-6 h-8 rounded-xl" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-14 rounded-[14px]" />
            ))}
          </div>
        </div>
      </div>

      <main className="flex min-h-screen flex-col lg:ms-65">
        <div className="border-hair hidden h-16 items-center justify-between border-b px-8 [background:rgba(5,3,2,.85)] lg:flex">
          <Skeleton className="h-5 w-28" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="size-9.5 rounded-xl" />
          </div>
        </div>
        <div className="border-hair flex h-16 items-center gap-3 border-b px-4 lg:hidden">
          <Skeleton className="size-9 rounded-[11px]" />
          <Skeleton className="h-5 flex-1" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 sm:pb-[calc(6rem+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
          <PageSkeleton />
        </div>
      </main>
    </div>
  );
}

export function DashboardError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="dashboard-scope flex min-h-screen items-center justify-center px-4 [background:var(--color-bg)]">
      <ErrorState
        title="داشبورد آماده نشد"
        message={error}
        action={{ label: 'تلاش دوباره', onClick: onRetry, icon: 'bolt' }}
        secondaryAction={{ label: 'ورود دوباره', href: '/auth', icon: 'lock' }}
      />
    </div>
  );
}

export function PhoenixLoader({ text, compact = false }: { text: string; compact?: boolean }) {
  const sizeClass = compact ? 'size-18' : 'size-24';

  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      <div className={`relative ${sizeClass}`}>
        <span className="border-ember/30 absolute inset-0 animate-ping rounded-full border" />
        <span className="from-ember/25 via-gold/15 absolute inset-1 animate-pulse rounded-full bg-linear-to-br to-transparent blur-md" />
        <span className="border-hair absolute inset-0 rounded-full border [background:radial-gradient(circle_at_50%_35%,rgba(255,185,94,.22),rgba(255,98,0,.08)_45%,rgba(0,0,0,.7)_75%)]" />
        <OptionalImage
          src="/assets/phoenix_badge.webp"
          alt=""
          className="absolute inset-2 size-[calc(100%-1rem)] object-contain drop-shadow-[0_0_18px_rgba(255,98,0,.45)]"
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-ink text-base font-black">{text}</p>
        <p className="text-ink-4 mt-1 text-xs">ققنوس قبیله در حال روشن کردن مسیر است</p>
      </div>
    </div>
  );
}
