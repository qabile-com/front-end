'use client';

import { cn } from '@/core/lib/cn';
import { DashboardPageShell } from './dashboard-page-shell';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'block overflow-hidden rounded-xl bg-size-[220%_100%] [background:linear-gradient(90deg,rgba(255,255,255,.045),rgba(255,98,0,.11),rgba(255,255,255,.045))] motion-safe:animate-[skeletonShimmer_1.35s_ease-in-out_infinite]',
        className,
      )}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-label="در حال بارگذاری محتوا" role="status">
      <div className="space-y-3">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <CardGridSkeleton />
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 min-[1500px]:grid-cols-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border-hair overflow-hidden rounded-[18px] border [background:var(--glass)]"
        >
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-4/5" />
            <div className="flex items-center justify-between pt-5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div
      className="flex w-full max-w-full flex-col gap-5 overflow-x-clip"
      aria-label="در حال بارگذاری خانه"
      role="status"
    >
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,668px)_minmax(360px,400px)] xl:items-start xl:justify-center">
        <section className="min-w-0 space-y-5">
          <div>
            <Skeleton className="h-[140px] rounded-[20px] sm:h-[210px] sm:rounded-[24px] lg:h-[262px]" />
            <div className="mt-3 flex items-center justify-center gap-2">
              <Skeleton className="h-2.5 w-8 rounded-full" />
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="size-2.5 rounded-full" />
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border-hair flex min-h-24 min-w-0 flex-col items-center justify-center gap-3 rounded-[18px] border px-2 [background:var(--glass)]"
              >
                <Skeleton className="size-9 rounded-xl" />
                <Skeleton className="h-4 w-18 max-w-full" />
              </div>
            ))}
          </div>

          <div className="hidden rounded-[20px] border border-[rgba(255,98,0,.16)] p-4 [background:var(--glass)] lg:block">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-[14px] bg-black/20 p-2">
                  <Skeleton className="h-15 w-24 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-36 max-w-full" />
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                  <Skeleton className="size-8 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="w-full xl:sticky xl:top-0 xl:max-w-[400px]">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[18px] border border-[rgba(255,98,0,.16)] p-4 [background:rgba(18,9,6,.72)]"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="size-11 rounded-2xl" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-40 max-w-full" />
                    <Skeleton className="h-8 w-22 rounded-xl" />
                  </div>
                  <Skeleton className="h-7 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

export function CoursesPageSkeleton() {
  return (
    <div className="space-y-6" aria-label="در حال بارگذاری دوره‌ها" role="status">
      <section className="border-hair overflow-hidden rounded-[26px] border [background:linear-gradient(135deg,rgba(255,98,0,.09),rgba(20,9,4,.84))]">
        <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <Skeleton className="h-13 w-full rounded-[18px]" />
          <div className="flex min-w-0 gap-2 overflow-hidden">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-28 shrink-0 rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="border-hair flex gap-2 overflow-hidden border-t px-4 py-3 sm:px-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </section>

      <section className="grid overflow-hidden rounded-[28px] border border-[rgba(255,98,0,.22)] [background:var(--glass)] lg:grid-cols-[minmax(0,.98fr)_minmax(380px,1.02fr)] lg:items-center">
        <Skeleton className="aspect-[16/9] w-full rounded-none min-[520px]:aspect-[2/1] lg:aspect-[4/3] xl:aspect-[16/10] 2xl:aspect-[2/1]" />
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-18 rounded-full" />
          </div>
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-11 rounded-2xl" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-22" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 flex-1 rounded-xl" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[22px] border border-[rgba(255,98,0,.16)] [background:linear-gradient(180deg,rgba(22,10,5,.88),rgba(9,5,3,.94))]"
          >
            <Skeleton className="aspect-[16/10] w-full rounded-none min-[430px]:aspect-[16/9] lg:aspect-[16/10] min-[1320px]:aspect-[16/9]" />
            <div className="space-y-4 p-4">
              <Skeleton className="h-5 w-4/5" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-18 rounded-xl" />
                <Skeleton className="h-9 w-26 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-label="در حال بارگذاری پروفایل" role="status">
      <div className="border-hair rounded-[26px] border p-7 [background:var(--glass)]">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <Skeleton className="size-28 rounded-full sm:size-24" />
          <div className="w-full flex-1 space-y-4">
            <Skeleton className="h-7 w-40 max-sm:mx-auto" />
            <Skeleton className="h-4 w-52 max-sm:mx-auto" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-20 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-30 rounded-[20px]" />
        <Skeleton className="h-30 rounded-[20px]" />
      </div>
      <Skeleton className="h-72 rounded-[20px]" />
    </div>
  );
}

export function SocialSkeleton() {
  return (
    <div
      className="space-y-4"
      aria-label="?? ??? ???????? ??????"
      role="status"
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-hair rounded-[20px] border p-4 [background:var(--glass)]"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full max-sm:hidden" />
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-2">
              <Skeleton className="size-9 rounded-xl" />
              <Skeleton className="size-9 rounded-xl" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-4" aria-label="در حال بارگذاری پست" role="status">
      <Skeleton className="h-11 w-36 rounded-xl" />
      <div className="border-hair rounded-[24px] border p-5 [background:var(--glass)]">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-3 w-18" />
        </div>
        <div className="mt-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="mt-6 h-52 rounded-[18px]" />
      </div>
    </div>
  );
}

export function SessionSkeleton() {
  return (
    <DashboardPageShell
      size="wide"
      className="min-h-screen"
      aria-label="?? ??? ???????? ????"
      role="status"
    >
      <div className="grid min-w-0 items-start gap-6 min-[1440px]:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-[24px] border border-[rgba(255,98,0,.18)] bg-black shadow-[0_30px_90px_-58px_var(--glow)]">
            <div className="relative">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="size-10 rounded-full" />
              </div>
              <Skeleton className="absolute right-4 bottom-4 h-10 w-32 rounded-full" />
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-18 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="border-hair overflow-hidden rounded-[22px] border [background:var(--glass)]">
            <div className="grid grid-cols-2 gap-1 border-b border-[rgba(255,98,0,.12)] p-2 sm:grid-cols-3">
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="h-10 rounded-xl" />
              <Skeleton className="hidden h-10 rounded-xl sm:block" />
            </div>
            <div className="space-y-3 p-4 sm:p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <Skeleton className="h-13 rounded-2xl sm:hidden" />
        </div>

        <aside className="sticky top-0 hidden min-[1440px]:block">
          <div className="border-hair rounded-[24px] border p-4 [background:var(--glass)]">
            <Skeleton className="mb-4 h-6 w-36" />
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-[rgba(255,98,0,.12)] p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </DashboardPageShell>
  );
}

export function InlineSkeleton({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-28', className)} />;
}

export function ModalSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'border-hair w-full max-w-md rounded-3xl border p-6 [background:var(--glass)]',
        className,
      )}
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="size-9 rounded-xl" />
      </div>
      <div className="mt-6 flex flex-col items-center gap-4">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
    </div>
  );
}
