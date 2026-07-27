'use client';

import { cn } from '@/core/lib/cn';

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
      className="grid gap-7 min-[1100px]:grid-cols-[1fr_300px]"
      aria-label="در حال بارگذاری انجمن"
      role="status"
    >
      <div className="space-y-4">
        <Skeleton className="h-12 rounded-2xl" />
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
            </div>
            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden space-y-4 min-[1100px]:block">
        <Skeleton className="h-38 rounded-[20px]" />
        <Skeleton className="h-54 rounded-[20px]" />
      </div>
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
    <div
      className="grid items-start gap-6 lg:grid-cols-[1fr_380px]"
      aria-label="در حال بارگذاری جلسه"
      role="status"
    >
      <div className="space-y-5">
        <Skeleton className="aspect-video rounded-[20px]" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-48 rounded-[20px]" />
      </div>
      <Skeleton className="sticky top-22 hidden h-130 rounded-[20px] lg:block" />
    </div>
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
