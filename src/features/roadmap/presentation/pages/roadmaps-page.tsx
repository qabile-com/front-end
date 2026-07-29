'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { DashboardPageShell, ErrorState, Icon, MotionItem, MotionList, MotionPage, Skeleton } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { useRoadmaps } from '../../application/use-roadmaps';
import { roadmapRepo } from '../../infrastructure/repository-factory';
import type { RoadmapSummary } from '../../domain/roadmap.types';

const STATUS_LABEL: Record<NonNullable<RoadmapSummary['status']>, string> = {
  not_started: 'شروع نشده',
  in_progress: 'در جریان',
  done: 'تکمیل شده',
};

export function RoadmapsPage() {
  const [search, setSearch] = useState('');
  const queryParams = useMemo(() => ({ limit: 20, offset: 0, q: search.trim() || undefined }), [search]);
  const { roadmaps, loading, error, refetch } = useRoadmaps(roadmapRepo, queryParams);

  return (
    <MotionPage>
      <DashboardPageShell>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
          <header className="flex flex-col gap-4 rounded-[26px] border border-[rgba(255,98,0,.22)] bg-[radial-gradient(circle_at_80%_20%,rgba(255,98,0,.16),transparent_42%),rgba(18,9,6,.82)] p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-ember mb-2 inline-flex rounded-full border border-[rgba(255,98,0,.25)] bg-black/25 px-3 py-1 text-xs font-black">
                مسیر رشد
              </span>
              <h1 className="text-2xl font-black text-white sm:text-3xl">نقشه راه‌ها</h1>
              <p className="text-ink-3 mt-2 max-w-2xl text-sm leading-7">
                مسیر فعالت را ادامه بده یا بقیه نقشه‌راه‌ها را ببین. پیشرفت هر مسیر از بک‌اند خوانده می‌شود.
              </p>
            </div>

            <label className="relative block w-full lg:w-72">
              <span className="sr-only">جستجوی نقشه راه</span>
              <Icon name="search" size={18} className="text-ink-4 absolute top-1/2 right-3 -translate-y-1/2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جستجوی نقشه راه..."
                className="border-hair focus:border-ember h-12 w-full rounded-2xl border bg-black/30 pr-10 pl-4 text-sm outline-none transition-colors placeholder:text-ink-4"
              />
            </label>
          </header>

          {loading && <RoadmapGridSkeleton />}

          {error && (
            <ErrorState
              title="نقشه راه‌ها آماده نشد"
              message={error}
              action={{ label: 'تلاش دوباره', onClick: () => void refetch(), icon: 'bolt' }}
            />
          )}

          {!loading && !error && roadmaps.length === 0 && (
            <ErrorState
              title="نقشه راهی پیدا نشد"
              message="فعلاً نقشه راهی با این جستجو وجود ندارد."
              action={search ? { label: 'پاک کردن جستجو', onClick: () => setSearch(''), icon: 'x' } : undefined}
            />
          )}

          {!loading && !error && roadmaps.length > 0 && (
            <MotionList className="grid gap-4 md:grid-cols-2">
              {roadmaps.map((roadmap) => (
                <MotionItem key={roadmap.id}>
                  <RoadmapCard roadmap={roadmap} />
                </MotionItem>
              ))}
            </MotionList>
          )}
        </div>
      </DashboardPageShell>
    </MotionPage>
  );
}

function RoadmapCard({ roadmap }: { roadmap: RoadmapSummary }) {
  const percent = roadmap.totalSteps ? Math.round((roadmap.completedSteps / roadmap.totalSteps) * 100) : 0;
  const currentStep =
    roadmap.steps?.find((step) => step.status === 'current') ??
    roadmap.steps?.find((step) => step.status !== 'done') ??
    roadmap.steps?.[0];
  const href = currentStep ? `/roadmap/steps/${currentStep.num}` : '/roadmap';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[24px] border p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1',
        roadmap.isActive
          ? 'border-[rgba(255,98,0,.58)] bg-[radial-gradient(circle_at_75%_20%,rgba(255,98,0,.16),transparent_42%),rgba(30,12,5,.84)] shadow-[0_28px_80px_-48px_var(--glow)]'
          : 'border-[rgba(255,98,0,.18)] bg-[rgba(16,8,5,.72)]',
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {roadmap.isActive && (
              <span className="text-ember rounded-full border border-[rgba(255,98,0,.28)] bg-[rgba(255,98,0,.12)] px-2.5 py-1 text-[11px] font-black">
                نقشه فعال
              </span>
            )}
            <span className="text-ink-3 rounded-full border border-[rgba(255,255,255,.08)] bg-black/20 px-2.5 py-1 text-[11px] font-black">
              {STATUS_LABEL[roadmap.status ?? 'not_started']}
            </span>
          </div>
          <h2 className="truncate text-lg font-black text-white">{roadmap.title}</h2>
          {roadmap.description && (
            <p className="text-ink-3 mt-2 line-clamp-2 text-sm leading-7">{roadmap.description}</p>
          )}
        </div>

        <span className="text-gold inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(255,98,0,.24)] bg-black/30 px-3 py-1.5 text-sm font-black">
          <Icon name="flame" size={16} className="text-ember" />
          {formatPersianNumber(roadmap.totalXp)}
        </span>
      </div>

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs font-black">
          <span className="text-ink-3">
            {toPersianDigits(roadmap.completedSteps)} از {toPersianDigits(roadmap.totalSteps)} مرحله
          </span>
          <span className="text-gold">{toPersianDigits(percent)}٪</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
          <div className="h-full rounded-full [background:var(--fire-grad)]" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <Link
        href={href}
        className={cn(
          'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition-[transform,border-color,box-shadow,opacity] duration-300 hover:-translate-y-0.5',
          roadmap.isActive
            ? 'text-[#1a0a00] [background:var(--fire-grad)] shadow-[0_8px_28px_-12px_var(--glow)]'
            : 'border-hair border [background:var(--glass-2)] hover:border-hair-2',
        )}
      >
        {roadmap.isActive ? 'ادامه مسیر' : 'مشاهده مسیر'}
        <Icon name="arrow-left" size={18} />
      </Link>
    </article>
  );
}

function RoadmapGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-[24px] border border-[rgba(255,98,0,.14)] bg-black/20 p-5">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-3 h-5 w-52" />
          <Skeleton className="mb-6 h-4 w-full" />
          <Skeleton className="mb-5 h-2 w-full rounded-full" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
