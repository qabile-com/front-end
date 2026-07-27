'use client';

import { useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { SessionContent } from '@/features/courses/presentation/components/session-content';
import { useSessionDetail } from '@/features/courses/application/use-session-detail';
import { useSessionComments } from '@/features/courses/application/use-session-comments';
import { useAddSessionComment } from '@/features/courses/application/use-session-comments';
import { useReportSectionWatchProgress } from '@/features/courses/application/use-courses';
import { useCourses } from '@/features/courses/application/use-courses';
import {
  sessionRepo,
  commentsRepo,
  coursesRepo,
} from '@/features/courses/infrastructure/repository-factory';
import type { Course, CoursePart } from '@/features/courses/domain/courses.data';
import { toPersianDigits } from '@/core/lib/persian';
import { ErrorState, Icon, OptionalImage, SessionSkeleton } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatDurationFa } from '@/features/courses/presentation/components/course-session-modal';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { PaginatedComments } from '@/features/courses/domain/comments-repository';

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const sectionId = params.sectionId as string;
  const source = searchParams.get('from');
  const returnHref = source === 'home' ? '/home' : '/courses';
  const sourceQuery = source === 'home' ? '?from=home' : '';

  const { data: courses, loading: coursesLoading } = useCourses(coursesRepo);
  const course = courses?.find((c) => c.id === courseId) ?? null;

  const {
    data: sessionDetail,
    isLoading: sessionLoading,
    isFetching: sessionFetching,
    error: sessionError,
  } = useSessionDetail(sessionRepo, courseId, sectionId);
  const session = sessionDetail?.part ?? null;

  const commentsQuery = useSessionComments(commentsRepo, courseId, sectionId);
  const addComment = useAddSessionComment(commentsRepo);
  const reportWatchProgress = useReportSectionWatchProgress(coursesRepo);

  const handleWatchProgress = useCallback(
    (body: SectionWatchProgressInput) => {
      reportWatchProgress.mutate({ sectionId, body });
    },
    [reportWatchProgress, sectionId],
  );

  const handleAddComment = useCallback(
    (text: string) => {
      addComment.mutate({ courseId, sectionId, text });
    },
    [addComment, courseId, sectionId],
  );

  const handleNextSession = useCallback(() => {
    if (!course || !session) return;
    const nextSectionId =
      session.nextSectionId ??
      course.episodes[course.episodes.findIndex((p) => p.id === sectionId) + 1]?.id;
    if (!nextSectionId) return;
    router.push(`/courses/${courseId}/sections/${nextSectionId}${sourceQuery}`);
  }, [course, router, courseId, sectionId, session, sourceQuery]);

  if (coursesLoading || sessionFetching) {
    return <SessionSkeleton />;
  }

  if (!course) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <ErrorState
          compact
          title="کورس پیدا نشد"
          message="این کورس وجود ندارد یا دسترسی به آن برای حساب شما فعال نیست."
          action={{ label: 'بازگشت', href: returnHref, icon: 'social' }}
        />
      </div>
    );
  }

  if (sessionLoading) {
    return <SessionSkeleton />;
  }

  if (sessionError || !session) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center">
        <ErrorState
          compact
          title="جلسه پیدا نشد"
          message={
            sessionError instanceof Error
              ? sessionError.message
              : 'جلسه مورد نظر آماده نیست. دوباره تلاش کن یا به لیست کورس‌ها برگرد.'
          }
          action={{ label: 'تلاش دوباره', onClick: () => window.location.reload(), icon: 'bolt' }}
          secondaryAction={{ label: 'بازگشت', href: returnHref, icon: 'social' }}
        />
      </div>
    );
  }

  const videoUrl = sessionDetail?.videoUrl ?? session?.videoUrl ?? null;
  const audioUrl = sessionDetail?.audioUrl ?? sessionDetail?.mediaUrl ?? session?.audioUrl ?? null;

  return (
    <div className="min-h-screen max-w-full min-w-0 overflow-x-clip">
      <div className="grid min-w-0 items-start gap-6 min-[1440px]:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {session && (
            <SessionContent
              key={session.id}
              session={session}
              course={course}
              currentSectionId={sectionId}
              videoUrl={videoUrl ?? undefined}
              audioUrl={audioUrl ?? undefined}
              commentsQuery={
                commentsQuery as UseInfiniteQueryResult<InfiniteData<PaginatedComments>>
              }
              onNextSession={handleNextSession}
              onNavigateSection={(id) =>
                router.push(`/courses/${courseId}/sections/${id}${sourceQuery}`)
              }
              onWatchProgress={handleWatchProgress}
              onAddComment={handleAddComment}
              onBack={() => router.push(returnHref)}
              isAddingComment={addComment.isPending}
            />
          )}
        </div>

        <div className="border-hair sticky hidden h-fit overflow-hidden rounded-[20px] border [background:var(--glass)] min-[1440px]:block">
          <CourseDetail
            course={course}
            currentSectionId={sectionId}
            onNavigate={(id) => router.push(`/courses/${courseId}/sections/${id}${sourceQuery}`)}
          />
        </div>
      </div>
    </div>
  );
}

function CourseDetail({
  course,
  currentSectionId,
  onNavigate,
}: {
  course: Course;
  currentSectionId: string;
  onNavigate: (sectionId: string) => void;
}) {
  return (
    <div className="flex max-h-[calc(100vh-120px)] flex-col">
      <div className="border-hair border-b p-5">
        <span className="text-[11px] font-bold text-[#FF6200]">{course.category}</span>
        <h3 className="mt-1 text-lg font-black">{course.title}</h3>
        <div className="text-gold mt-2 flex items-center gap-3 rounded-[14px] border border-[#F3BA632E] px-3.5 py-3 text-[14.5px] font-extrabold shadow-[0_4px_16px_-8px_#F3BA632E] transition-colors [background:linear-gradient(135deg,#F3BA6314,rgba(243,186,99,.08))]">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <b className="text-gold text-[14px] font-extrabold">
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative size-5 shrink-0">
                    <OptionalImage
                      src="/assets/phoenix_badge.webp"
                      alt=""
                      className="object-contain"
                    />
                  </span>
                  +{toPersianDigits(course.xp)} آتش
                </span>
              </b>
            </div>
            <small className="text-ink-3 mt-1 block text-[12px]">
              {course.episodes.length} بخش
            </small>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-4">
        {course.episodes.map((part, i) => (
          <PartRow
            key={part.id}
            part={part}
            index={i}
            isActive={part.id === currentSectionId}
            onClick={() => {
              if (part.id !== currentSectionId) {
                onNavigate(part.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}

function PartRow({
  part,
  index,
  onClick,
  isActive,
}: {
  part: CoursePart;
  index: number;
  onClick: () => void;
  isActive: boolean;
}) {
  const status =
    part.status === 'done'
      ? { label: 'تکمیل شده', cls: 'text-[#2bd4a8] bg-[#2bd4a8]/20' }
      : part.status === 'partial'
        ? {
            label: `${toPersianDigits(part.progress ?? 0)}٪ دیده شده`,
            cls: 'text-ember bg-ember/20',
          }
        : { label: 'دیده نشده', cls: 'text-ink-3 bg-[#FF965A15]' };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between gap-3 p-3 text-start transition-colors',
        isActive
          ? 'border-hair border bg-(--glass-3)'
          : 'hover:cursor-pointer hover:bg-(--glass-3)',
      )}
    >
      <div className="flex items-center gap-3">
        {part.status === 'done' ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-full text-[#1a0a00] [background:linear-gradient(135deg,#1f8a5b,#2bd4a8)]">
            <Icon name="check" size={18} />
          </span>
        ) : part.status === 'partial' ? (
          <span
            className="text-ember grid size-10 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(rgba(255,98,0,.4) 0% ${part.progress}%, transparent ${part.progress}% 100%)`,
            }}
          >
            <Icon name="play" size={14} />
          </span>
        ) : (
          <span className="text-ink-4 border-hair grid size-10 shrink-0 place-items-center rounded-full border text-sm font-bold">
            {toPersianDigits(index + 1)}
          </span>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <b className="block truncate text-[13.5px] font-bold">{part.title}</b>
          <div className="text-ink-3 mt-1 flex items-center gap-1 text-[11.5px]">
            <Icon name="clock" size={12} />
            {formatDurationFa(part.durationSeconds!)}
            <span className="text-gold mr-1 inline-flex shrink-0 items-center gap-1 rounded-xl border border-[#F3BA6326] bg-[#F3BA6312] px-2 py-0.5 text-[11px] font-extrabold">
              <span className="relative size-4 shrink-0">
                <OptionalImage src="/assets/phoenix_badge.webp" alt="" className="object-contain" />
              </span>
              +{toPersianDigits(part.xp ?? 0)} آتش
            </span>
            <span
              className={cn(
                'mr-1 shrink-0 rounded-xl px-2 py-0.5 text-[11px] font-bold',
                status.cls,
              )}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>
      {isActive && <Icon name="play" size={16} className="text-ember shrink-0" />}
    </button>
  );
}

function DetailEmpty() {
  return (
    <div className="text-ink-3 grid min-h-75 place-items-center p-8 text-center">
      <div>
        <Icon name="book" size={40} className="mx-auto mb-3 opacity-50" />
        یک بخش رو انتخاب کن تا شروع کنی
      </div>
    </div>
  );
}
