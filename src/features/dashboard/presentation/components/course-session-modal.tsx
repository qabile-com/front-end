// src/features/dashboard/presentation/components/course-session-modal.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/core/lib/cn';
import { Button, Icon, Input } from '@/shared/ui';
import type { CoursePart } from '../../domain/courses.data';
import { useScrollLock } from '../../application/use-scroll-lock';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { PaginatedComments } from '../../domain/comments-repository';
import type { SectionWatchProgressInput, SectionWatchEvent } from '../../domain/dashboard.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: CoursePart;
  videoUrl?: string;
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  onNextSession: () => void;
  onWatchProgress: (body: SectionWatchProgressInput) => void;
  onAddComment: (text: string) => void;
  isAddingComment?: boolean;
}

export function CourseSessionModal({
  isOpen,
  onClose,
  session,
  onNextSession,
  onWatchProgress,
  commentsQuery,
  videoUrl,
  onAddComment,
  isAddingComment = false,
}: Props) {
  useScrollLock(!!isOpen);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchedRangesRef = useRef<{ start: number; end: number }[]>([]);
  const lastTimeRef = useRef(0);
  const maxWatchedTimeRef = useRef(0);
  const lastReportAtRef = useRef(0);
  const thresholdReportedRef = useRef(session.status === 'done');
  const reportProgressRef = useRef(onWatchProgress);
  const [watchProgressBySession, setWatchProgressBySession] = useState<Record<string, number>>({});
  const [commentText, setCommentText] = useState('');

  // Stabilize the callback ref so effects don't depend on it
  useEffect(() => {
    reportProgressRef.current = onWatchProgress;
  }, [onWatchProgress]);

  const watchProgress = Math.max(watchProgressBySession[session.id] ?? 0, session.progress ?? 0);

  const buildWatchPayload = useCallback(
    (event: SectionWatchEvent): SectionWatchProgressInput | null => {
      const video = videoRef.current;
      const duration = Math.floor(video?.duration || session.durationSeconds || 0);
      if (!duration) return null;

      return {
        courseId: session.courseId ?? '',
        currentTime: Math.floor(video?.currentTime ?? maxWatchedTimeRef.current),
        duration,
        maxWatchedTime: Math.floor(maxWatchedTimeRef.current),
        watchedRanges: watchedRangesRef.current.map((range) => ({
          start: Math.floor(range.start),
          end: Math.floor(range.end),
        })),
        event,
      };
    },
    [session.courseId, session.durationSeconds],
  );

  // Stable version of reportWatchProgress that doesn't set state
  const reportWatchProgress = useCallback(
    (event: SectionWatchEvent, force = false) => {
      const payload = buildWatchPayload(event);
      if (!payload) return;

      const now = Date.now();
      const watchedSeconds = calculateWatchedSeconds(watchedRangesRef.current);
      const progress = Math.min(100, Math.floor((watchedSeconds / payload.duration) * 100));

      // Avoid setting state during unmount or on every small update
      setWatchProgressBySession((previous) => {
        if (previous[session.id] === progress) return previous;
        return { ...previous, [session.id]: Math.max(previous[session.id] ?? 0, progress) };
      });

      if (!force && now - lastReportAtRef.current < 12_000 && progress < 80) return;

      lastReportAtRef.current = now;
      reportProgressRef.current(payload); // use the stable ref
    },
    [buildWatchPayload, session.id],
  );

  const rememberWatchedTime = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const current = video.currentTime;
    const previous = lastTimeRef.current;
    const delta = current - previous;

    if (!video.seeking && delta > 0 && delta <= 3) {
      addWatchedRange(previous, current, watchedRangesRef.current);
    }

    lastTimeRef.current = current;
    maxWatchedTimeRef.current = Math.max(maxWatchedTimeRef.current, current);

    const watchedSeconds = calculateWatchedSeconds(watchedRangesRef.current);
    const progress = Math.min(100, Math.floor((watchedSeconds / video.duration) * 100));
    setWatchProgressBySession((previous) => {
      if (previous[session.id] === progress) return previous;
      return { ...previous, [session.id]: Math.max(previous[session.id] ?? 0, progress) };
    });

    if (progress >= 80 && !thresholdReportedRef.current) {
      thresholdReportedRef.current = true;
      reportWatchProgress('threshold', true);
      return;
    }

    reportWatchProgress('timeupdate');
  }, [reportWatchProgress, session.id]);

  // Reset state when session changes
  useEffect(() => {
    watchedRangesRef.current = [];
    lastTimeRef.current = 0;
    maxWatchedTimeRef.current = session.watchedSeconds ?? 0;
    lastReportAtRef.current = 0;
    thresholdReportedRef.current = session.status === 'done';
  }, [session.id, session.status, session.watchedSeconds]);

  // Cleanup on close – report final progress using the stable ref
  useEffect(() => {
    return () => {
      const payload = buildWatchPayload('close');
      if (payload) {
        reportProgressRef.current(payload);
      }
    };
  }, [buildWatchPayload]);

  if (!isOpen) return null;

  const allComments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  const handleClose = () => {
    const payload = buildWatchPayload('close');
    if (payload) {
      reportProgressRef.current(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="md:border-hair flex max-h-full w-full max-w-4xl flex-col overflow-hidden bg-[var(--color-panel)] md:max-h-[90vh] md:rounded-2xl md:border">
        {/* Header */}
        <div className="border-hair flex shrink-0 items-center justify-between border-b p-4 md:hidden">
          <button
            onClick={handleClose}
            className="text-ink-2 hover:text-gold flex items-center gap-2 transition-colors"
          >
            <div className="text-gold flex cursor-pointer items-center gap-2 md:hidden">
              <Icon
                name="arrow-right"
                size={20}
                className="transition-transform group-hover:-translate-x-1"
              />
              بازگشت
            </div>
          </button>
          <button
            onClick={handleClose}
            className="text-ink-2 hover:text-ink rounded-lg p-2 transition-colors"
          >
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Video player */}
          <div className="relative h-[220px] w-full bg-black sm:h-[260px] md:h-[320px]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="h-full w-full object-cover"
                onLoadedMetadata={() => {
                  lastTimeRef.current = videoRef.current?.currentTime ?? 0;
                }}
                onTimeUpdate={rememberWatchedTime}
                onPause={() => reportWatchProgress('pause', true)}
                onEnded={() => reportWatchProgress('ended', true)}
                onSeeking={() => {
                  lastTimeRef.current = videoRef.current?.currentTime ?? 0;
                }}
                onSeeked={() => {
                  lastTimeRef.current = videoRef.current?.currentTime ?? 0;
                }}
              />
            ) : (
              <button className="bg-ember hover:bg-ember-deep absolute inset-0 z-10 m-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors">
                <Icon name="play" size={22} className="text-white" />
              </button>
            )}
          </div>

          {/* Info bar */}
          <div className="border-hair flex items-center justify-between border-b px-6 py-4 md:justify-between">
            <div className="text-ink-3 flex items-center gap-2 text-sm">
              <button
                onClick={handleClose}
                className="text-ink-2 hover:text-gold flex items-center gap-2 transition-colors"
              >
                <div className="text-gold hidden cursor-pointer items-center gap-2 md:flex">
                  <Icon
                    name="arrow-right"
                    size={20}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                  بازگشت
                </div>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onNextSession}
                disabled={!session.nextSectionId}
                className="bg-ember hover:bg-ember-deep flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-45"
              >
                ویدیو بعدی
                <Icon name="arrow-left" size={16} />
              </button>
            </div>
          </div>
          <h2 className="p-3 pr-6 text-lg font-bold">{session.title}</h2>
          {/* {videoUrl && (
            <div className="px-6 pt-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-300 [background:var(--fire-grad)]"
                  style={{ width: `${Math.min(100, watchProgress)}%` }}
                />
              </div>
            </div>
          )} */}

          {/* Exercise Steps */}
          {session.steps && session.steps.length > 0 && (
            <div className="space-y-3 p-6 pb-0">
              <h3 className="text-ink-2 mb-2 font-bold">مراحل تمرین:</h3>
              {session.steps.map((step) => (
                <label
                  key={step.id}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg bg-[var(--glass-2)] p-3 transition-colors hover:bg-[var(--glass-3)]"
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                      step.isCompleted
                        ? 'border-ember bg-ember text-white'
                        : 'border-hair group-hover:border-ink-4 text-transparent',
                    )}
                  >
                    {step.isCompleted && <Icon name="check" size={16} />}
                  </div>
                  <span className="text-ink-2 text-right text-sm leading-relaxed">{step.text}</span>
                </label>
              ))}
            </div>
          )}
          <div className="text-ink-3 flex items-center gap-6 p-6 text-sm">
            <span className="flex items-center gap-2">
              <Icon name="clock" size={16} /> {session.duration}
            </span>
            <span className="flex items-center gap-2">
              <Icon name="eye" size={16} /> {session.views ?? 'بدون'} بازدید
            </span>
          </div>
          {/* Comments Section */}
          <div className="p-6 pb-20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-ink-2 text-sm font-bold">
                نظرات کاربران ({commentsQuery.data?.pages[0]?.totalItems ?? 0})
              </h3>
            </div>
            <div className="space-y-4">
              {commentsQuery.isLoading && (
                <p className="text-ink-3 text-sm">در حال بارگذاری نظرات...</p>
              )}
              {commentsQuery.isError && <p className="text-danger text-sm">خطا در دریافت نظرات</p>}
              {allComments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                    {c.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-ink text-sm font-bold">{c.name}</span>
                      <span className="text-ink-4 text-xs">{c.time}</span>
                    </div>
                    <p className="text-ink-3 mt-1 text-sm">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {commentsQuery.hasNextPage && (
              <button
                onClick={() => commentsQuery.fetchNextPage()}
                className="text-gold hover:text-ember mt-4 w-full text-center text-sm font-bold transition-colors"
                disabled={commentsQuery.isFetchingNextPage}
              >
                {commentsQuery.isFetchingNextPage ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
              </button>
            )}
          </div>
        </div>

        {/* Fixed comment input footer */}
        <div className="border-hair flex shrink-0 items-center gap-3 border-t bg-[var(--color-panel)] p-4">
          <div className="bg-ember flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">
            آ
          </div>
          <Input
            placeholder="نظرت رو بنویس..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
          />
          <Button
            variant="secondary"
            size="md"
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || isAddingComment}
            className="text-ember bg-ember rounded-sm"
          >
            {isAddingComment ? 'ارسال...' : 'ارسال'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function addWatchedRange(start: number, end: number, ranges: { start: number; end: number }[]) {
  if (end <= start) return;

  ranges.push({ start, end });
  ranges.sort((a, b) => a.start - b.start);

  for (let index = ranges.length - 1; index > 0; index -= 1) {
    const current = ranges[index]!;
    const previous = ranges[index - 1]!;
    if (current.start <= previous.end + 1) {
      previous.end = Math.max(previous.end, current.end);
      ranges.splice(index, 1);
    }
  }
}

function calculateWatchedSeconds(ranges: { start: number; end: number }[]) {
  return ranges.reduce((sum, range) => sum + Math.max(0, range.end - range.start), 0);
}
