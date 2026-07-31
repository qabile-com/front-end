'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { profileRepo } from '../../infrastructure/repository-factory';
import { useProfile } from '../../application/use-profile';
import { useXpHistory } from '../../application/use-xp-history';
import type { XpHistoryItem } from '../../domain/profile-repository';
import {
  Button,
  DashboardPageShell,
  ErrorState,
  Icon,
  InlineSkeleton,
  MotionPage,
  Skeleton,
} from '@/shared/ui';

const SOURCE_LABELS: Record<string, string> = {
  episode: 'جلسه آموزشی',
  course_episode: 'جلسه آموزشی',
  roadmap: 'نقشه راه',
  roadmap_step: 'نقشه راه',
  achievement: 'دستاورد',
  course: 'کورس',
  course_purchase: 'خرید کورس',
  purchase: 'خرید',
  login_reward: 'ورود روزانه',
  onboarding: 'آنبوردینگ',
  admin: 'مدیریت',
};

export function FireHistoryPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const shouldReduceMotion = useReducedMotion();
  const profile = useProfile(profileRepo);
  const history = useXpHistory(profileRepo, debouncedSearch);
  const items = useMemo(
    () => history.data?.pages.flatMap((page) => page.items) ?? [],
    [history.data],
  );
  const totalItems = history.data?.pages[0]?.totalItems ?? 0;
  const earnedFire = useMemo(
    () => items.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0),
    [items],
  );
  const spentFire = useMemo(
    () => Math.abs(items.filter((item) => item.amount < 0).reduce((sum, item) => sum + item.amount, 0)),
    [items],
  );

  return (
    <MotionPage>
      <DashboardPageShell size="narrow" className="pb-24">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link
            href="/profile"
            className="text-gold hover:text-gold-lite inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[rgba(243,186,99,.18)] px-4 text-sm font-black transition-colors [background:rgba(243,186,99,.06)]"
          >
            <Icon name="arrow-right" size={17} />
            بازگشت
          </Link>
          <span className="text-ink-3 text-xs font-bold">
            {toPersianDigits(totalItems)} رکورد
          </span>
        </div>

        <section className="border-hair relative overflow-hidden rounded-[28px] border p-5 [background:radial-gradient(circle_at_50%_0%,rgba(255,98,0,.18),transparent_38%),var(--glass)] sm:p-7">
          <div className="pointer-events-none absolute -top-24 start-1/2 size-64 -translate-x-1/2 rounded-full bg-[rgba(255,98,0,.12)] blur-3xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="text-gold inline-flex items-center gap-2 text-xs font-black">
                <Icon name="flame" size={16} />
                تاریخچه آتش
              </span>
              <h1 className="mt-2 text-[28px] font-black sm:text-[34px]">
                رد آتش‌هایی که گرفتی و خرج کردی
              </h1>
              <p className="text-ink-3 mt-2 max-w-xl text-sm leading-7">
                اینجا همه دریافت‌ها و خرج‌کردن‌های آتش حساب تو جدا از صفحه پروفایل نمایش داده می‌شود.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
              <SummaryBox label="موجودی" value={profile.data?.xp} loading={profile.loading} />
              <SummaryBox label="دریافتی" value={earnedFire} />
              <SummaryBox label="خرج‌شده" value={spentFire} tone="spent" />
            </div>
          </div>
        </section>

        <div className="mt-5 rounded-[22px] border border-[rgba(255,98,0,.14)] p-3 [background:var(--glass)] sm:p-4">
          <label className="relative block">
            <Icon
              name="search"
              size={18}
              className="text-ink-4 pointer-events-none absolute end-4 top-1/2 -translate-y-1/2"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجو در تاریخچه آتش..."
              className="border-hair text-ink placeholder:text-ink-4 h-12 w-full rounded-2xl border bg-black/25 pe-11 ps-4 text-base outline-none transition-colors focus:border-[rgba(255,98,0,.45)]"
            />
          </label>
        </div>

        <div className="mt-5">
          {history.isLoading && <HistorySkeleton />}

          {history.isError && (
            <ErrorState
              compact
              title="تاریخچه آتش دریافت نشد"
              message={history.error instanceof Error ? history.error.message : undefined}
              action={{
                label: 'تلاش دوباره',
                onClick: () => void history.refetch(),
                icon: 'bolt',
              }}
            />
          )}

          {!history.isLoading && !history.isError && items.length === 0 && (
            <ErrorState
              compact
              tone="info"
              icon="flame"
              title="هنوز رکوردی ثبت نشده"
              message="وقتی جلسه‌ای را کامل ببینی، مرحله‌ای را انجام بدهی یا کورسی بخری، اینجا ثبت می‌شود."
              secondaryAction={{ label: 'رفتن به کورس‌ها', href: '/courses', icon: 'book' }}
            />
          )}

          <AnimatePresence initial={false}>
            {items.length > 0 && (
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                className="space-y-3"
              >
                {items.map((item, index) => (
                  <HistoryRow key={item.id} item={item} index={index} />
                ))}

                {history.hasNextPage && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-5 w-full"
                    disabled={history.isFetchingNextPage}
                    onClick={() => history.fetchNextPage()}
                  >
                    {history.isFetchingNextPage ? (
                      <InlineSkeleton className="h-4 w-24" />
                    ) : (
                      'نمایش بیشتر'
                    )}
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DashboardPageShell>
    </MotionPage>
  );
}

function SummaryBox({
  label,
  value,
  tone = 'earned',
  loading = false,
}: {
  label: string;
  value?: number;
  tone?: 'earned' | 'spent';
  loading?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[rgba(243,186,99,.16)] bg-black/35 px-3 py-3 text-center">
      <span className="text-ink-3 block text-[11px] font-bold">{label}</span>
      {loading ? (
        <Skeleton className="mx-auto mt-2 h-5 w-16" />
      ) : (
        <b
          className={cn(
            'mt-1 block truncate text-sm font-black sm:text-base',
            tone === 'spent' ? 'text-ink-2' : 'text-gold',
          )}
        >
          {formatPersianNumber(value ?? 0)}
        </b>
      )}
    </div>
  );
}

function HistoryRow({ item, index }: { item: XpHistoryItem; index: number }) {
  const isPositive = item.amount >= 0;
  const sourceLabel = SOURCE_LABELS[item.sourceType] ?? item.sourceType;
  const title = item.title ?? getMetaTitle(item) ?? sourceLabel;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.24), duration: 0.22 }}
      className="border-hair group relative overflow-hidden rounded-[20px] border p-4 transition-[border-color,transform] [background:var(--glass)] hover:-translate-y-0.5 hover:border-[rgba(255,98,0,.34)]"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-2xl border shadow-[0_14px_34px_-24px_var(--glow)]',
            isPositive
              ? 'border-[rgba(243,186,99,.28)] text-[#1a0a00] [background:var(--fire-grad)]'
              : 'border-[rgba(255,98,0,.24)] text-gold [background:rgba(255,98,0,.08)]',
          )}
        >
          <Icon name={isPositive ? 'flame' : 'lock'} size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-ink truncate text-sm font-black sm:text-base">{title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-xl border border-[rgba(243,186,99,.14)] bg-black/24 px-2.5 py-1 text-[11px] font-bold text-gold">
                  {sourceLabel}
                </span>
                <span className="text-ink-4 text-[11px] font-bold">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
            </div>

            <b
              className={cn(
                'shrink-0 rounded-2xl border px-3 py-2 text-sm font-black tabular-nums',
                isPositive
                  ? 'border-[rgba(243,186,99,.22)] text-gold [background:rgba(243,186,99,.08)]'
                  : 'border-red-500/20 text-red-300 [background:rgba(239,68,68,.07)]',
              )}
            >
              {isPositive ? '+' : '-'}
              {formatPersianNumber(Math.abs(item.amount))} آتش
            </b>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="در حال بارگذاری تاریخچه آتش">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border-hair flex items-start gap-3 rounded-[20px] border p-4 [background:var(--glass)]"
        >
          <Skeleton className="size-11 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-10 w-24 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function getMetaTitle(item: XpHistoryItem) {
  const title = item.meta?.title;
  return typeof title === 'string' ? title : null;
}
