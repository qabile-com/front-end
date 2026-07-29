// src/features/dashboard/presentation/sections/courses-tab.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BaseModal, Button, Icon, MotionItem, MotionList, MotionPress, OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { Course } from '../../domain/courses.data';
import { formatDuration } from '@/core/lib/format-duration';
import { usePurchaseCourse } from '../../application/use-courses';
import { coursesRepo } from '../../infrastructure/repository-factory';

interface CoursesTabProps {
  courses: Course[];
  fireBalance: number;
}

export function CoursesTab({ courses, fireBalance }: CoursesTabProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const purchaseCourse = usePurchaseCourse(coursesRepo);
  const openCourse = (course: Course) => {
    const firstSectionId = course.episodes[0]?.id;
    if (!firstSectionId) return;
    router.push(`/courses/${course.id}/sections/${firstSectionId}`);
  };

  const handlePurchase = async () => {
    if (!selectedCourse) return;
    try {
      const result = await purchaseCourse.mutateAsync(selectedCourse.id);
      const firstSectionId = result.course?.episodes[0]?.id ?? selectedCourse.episodes[0]?.id;
      setSelectedCourse(null);
      showSuccess('کورس با موفقیت باز شد.');
      if (firstSectionId) {
        router.push(`/courses/${result.courseId}/sections/${firstSectionId}`);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'خرید کورس انجام نشد.');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[26px] font-black">کورس‌ها</h2>
          <p className="text-ink-2 text-sm">آموزش‌های ویدیویی تخصصی قبیله ققنوس</p>
        </div>
        <div className="border-hair flex w-fit items-center gap-2 rounded-2xl border px-3.5 py-2 [background:var(--glass-2)]">
          <span className="relative size-6 shrink-0">
            <OptionalImage src="/assets/phoenix_badge.webp" alt="" className="object-contain" />
          </span>
          <span className="text-ink-3 text-xs font-bold">آتش شما</span>
          <b className="text-gold text-sm font-black">{formatPersianNumber(fireBalance)}</b>
        </div>
      </div>

      <MotionList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        {courses.map((course) => {
          const done = course.episodes.filter((p) => p.status === 'done').length;
          const pct = Math.round((done / course.episodes.length) * 100);
          const canAccess = course.isFree || course.isPurchased || course.isUnlocked;
          const price = course.priceInFire ?? 0;
          return (
            <MotionItem key={course.id}>
              <MotionPress>
                <button
                  type="button"
                  onClick={() => openCourse(course)}
                  className={cn(
                    'flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[18px] border text-start transition-[transform,border-color,box-shadow] duration-300 [background:var(--glass)] hover:-translate-y-1 hover:shadow-[0_18px_42px_-30px_var(--glow)]',
                    'border-hair hover:border-hair-2',
                  )}
                >
                  <div
                    className="relative aspect-video w-full max-w-full shrink-0 overflow-hidden"
                    style={{ background: getCourseFallbackGradient(course.id) }}
                  >
                    {course.imageUrl && (
                      <>
                        <OptionalImage
                          src={course.imageUrl}
                          alt={course.title}
                          className="object-cover"
                          loading="lazy"
                        />
                        <span className="absolute inset-0 bg-black/35" />
                      </>
                    )}
                    <Icon name="play" size={34} className="text-white/90" />
                    <span className="absolute end-2.5 bottom-2.5 rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-bold text-white">
                      {formatDurationFa(course.durationSeconds ?? course.duration)}
                    </span>
                    {!canAccess && (
                      <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-xl border border-[rgba(255,98,0,.34)] px-2.5 py-1 text-[11px] font-black text-white [background:rgba(0,0,0,.55)]">
                        <Icon name="lock" size={13} />
                        نیاز به خرید
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <span className="text-gold text-[11px] font-bold">{course.category}</span>
                    <h3 className="mt-1 text-[15px] font-extrabold">{course.title}</h3>
                    <div className="mt-auto">
                      <div className="text-ink-3 mt-2 flex items-center justify-between gap-3 text-[12px]">
                        <span className="flex items-center gap-1">
                          {course.views}
                          <Icon name="eye" size={12} />
                        </span>
                        <span className="text-gold flex items-center gap-1">
                          <span className="relative size-5 shrink-0">
                            <OptionalImage
                              src="/assets/phoenix_badge.webp"
                              alt=""
                              className="object-contain"
                            />
                          </span>
                          +{toPersianDigits(course.xp)} آتش
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            'inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-[12px] font-black',
                            canAccess
                              ? 'border-[#2bd4a8]/25 text-[#2bd4a8] [background:rgba(43,212,168,.09)]'
                              : 'border-[rgba(255,98,0,.22)] text-gold [background:rgba(255,98,0,.08)]',
                          )}
                        >
                          {canAccess ? (
                            <>
                              <Icon name="check" size={14} />
                              دسترسی فعال
                            </>
                          ) : (
                            <>
                              <OptionalImage
                                src="/assets/phoenix_badge.webp"
                                alt=""
                                className="size-4 object-contain"
                              />
                              {formatPersianNumber(price)} آتش
                            </>
                          )}
                        </span>
                        <span className="text-ink grid size-9 place-items-center rounded-xl border border-[rgba(243,186,99,.18)] [background:rgba(243,186,99,.08)]">
                          <Icon name={canAccess ? 'play' : 'lock'} size={16} />
                        </span>
                      </div>
                      <div className="mt-3 h-0.75 justify-items-end overflow-hidden rounded-full [background:var(--color-hair)]">
                        <div
                          className="h-full [background:linear-gradient(90deg,var(--color-ember),var(--color-gold))]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              </MotionPress>
            </MotionItem>
          );
        })}
      </MotionList>

      <PurchaseCourseModal
        course={selectedCourse}
        fireBalance={fireBalance}
        isPurchasing={purchaseCourse.isPending}
        onClose={() => setSelectedCourse(null)}
        onConfirm={() => void handlePurchase()}
      />
    </div>
  );
}

export function PurchaseCourseModal({
  course,
  fireBalance,
  isPurchasing,
  onClose,
  onConfirm,
}: {
  course: Course | null;
  fireBalance: number;
  isPurchasing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const price = course?.priceInFire ?? 0;
  const hasEnoughFire = fireBalance >= price;

  return (
    <BaseModal
      isOpen={Boolean(course)}
      onClose={onClose}
      title="خرید کورس"
      panelClassName="w-full max-w-[440px] overflow-hidden rounded-[26px] border border-[rgba(255,98,0,.24)] [background:radial-gradient(circle_at_50%_0%,rgba(255,98,0,.16),transparent_38%),var(--color-bg-2)] shadow-[0_24px_90px_-38px_var(--glow)]"
    >
      {course && (
        <div className="p-5 sm:p-6">
          <div
            className="relative mb-5 aspect-video overflow-hidden rounded-[20px]"
            style={{ background: getCourseFallbackGradient(course.id) }}
          >
            {course.imageUrl && (
              <OptionalImage src={course.imageUrl} alt={course.title} className="object-cover" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-4 bottom-4">
              <span className="text-gold text-xs font-extrabold">{course.category}</span>
              <h3 className="mt-1 text-xl font-black text-white">{course.title}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FireBox label="قیمت کورس" value={price} />
            <FireBox label="آتش شما" value={fireBalance} muted={!hasEnoughFire} />
          </div>

          <p className="text-ink-2 mt-4 text-sm leading-7">
            با خرید این کورس، دسترسی همه جلسه‌های آن برای حساب تو فعال می‌شود و آتش از موجودی‌ات کم
            می‌شود.
          </p>

          {!hasEnoughFire && (
            <div className="mt-4 rounded-2xl border border-red-500/25 px-4 py-3 text-sm font-bold text-red-300 [background:rgba(239,68,68,.08)]">
              آتش کافی برای خرید این کورس نداری.
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              انصراف
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!hasEnoughFire || isPurchasing}
              onClick={onConfirm}
            >
              {isPurchasing ? 'در حال خرید...' : 'خرید با آتش'}
            </Button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

function FireBox({ label, value, muted = false }: { label: string; value: number; muted?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-3 py-3 text-center [background:rgba(255,98,0,.08)]',
        muted ? 'border-red-500/25' : 'border-[rgba(255,98,0,.22)]',
      )}
    >
      <span className="text-ink-3 block text-xs font-bold">{label}</span>
      <b className={cn('mt-1 inline-flex items-center justify-center gap-1.5 text-lg font-black', muted ? 'text-red-300' : 'text-gold')}>
        <span className="relative size-5 shrink-0">
          <OptionalImage src="/assets/phoenix_badge.webp" alt="" className="object-contain" />
        </span>
        {formatPersianNumber(value)}
      </b>
    </div>
  );
}

const COURSE_FALLBACK_GRADIENTS = [
  'linear-gradient(135deg,#1f8a5b,#2bd4a8)',
  'linear-gradient(135deg,#ff6200,#f3ba63)',
  'linear-gradient(135deg,#5b7cfa,#9b6bff)',
  'linear-gradient(135deg,#ffb347,#cc7a08)',
  'linear-gradient(135deg,#cc4308,#ff6200)',
  'linear-gradient(135deg,#2bd4a8,#1f8a5b)',
];

function getCourseFallbackGradient(courseId: string) {
  const hash = Array.from(courseId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return COURSE_FALLBACK_GRADIENTS[hash % COURSE_FALLBACK_GRADIENTS.length]!;
}

export function formatDurationFa(totalSeconds: number | string): string {
  if (typeof totalSeconds === 'string' && totalSeconds.includes(':')) {
    return toPersianDigits(totalSeconds);
  }

  return toPersianDigits(formatDuration(totalSeconds));
}
