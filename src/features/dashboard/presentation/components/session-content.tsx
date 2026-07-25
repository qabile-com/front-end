'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/core/lib/cn';
import { Button, Icon, Input } from '@/shared/ui';
import type { CoursePart } from '../../domain/courses.data';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { PaginatedComments } from '../../domain/comments-repository';
import type { SectionWatchProgressInput, SectionWatchEvent } from '../../domain/dashboard.types';
import { toPersianDigits } from '@/core/lib/persian';
import { formatDuration } from '@/core/lib/format-duration';

interface SessionContentProps {
  session: CoursePart;
  videoUrl?: string;
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  onNextSession: () => void;
  onWatchProgress: (body: SectionWatchProgressInput) => void;
  onAddComment: (text: string) => void;
  onBack: () => void;
  isAddingComment?: boolean;
  userName?: string;
}

export function SessionContent({
  session,
  onNextSession,
  onWatchProgress,
  commentsQuery,
  videoUrl,
  userName,
  onAddComment,
  onBack,
  isAddingComment = false,
}: SessionContentProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchedRangesRef = useRef<{ start: number; end: number }[]>([]);
  const lastTimeRef = useRef(0);
  const maxWatchedTimeRef = useRef(0);
  const lastReportAtRef = useRef(0);
  const thresholdReportedRef = useRef(session.status === 'done');
  const reportProgressRef = useRef(onWatchProgress);
  const [watchProgressBySession, setWatchProgressBySession] = useState<Record<string, number>>({});
  const [commentText, setCommentText] = useState('');
  const [showVideo, setShowVideo] = useState(false);

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

  const reportWatchProgress = useCallback(
    (event: SectionWatchEvent, force = false) => {
      const payload = buildWatchPayload(event);
      if (!payload) return;

      const now = Date.now();
      const watchedSeconds = calculateWatchedSeconds(watchedRangesRef.current);
      const progress = Math.min(100, Math.floor((watchedSeconds / payload.duration) * 100));

      setWatchProgressBySession((previous) => {
        if (previous[session.id] === progress) return previous;
        return { ...previous, [session.id]: Math.max(previous[session.id] ?? 0, progress) };
      });

      if (!force && now - lastReportAtRef.current < 12_000 && progress < 80) return;

      lastReportAtRef.current = now;
      reportProgressRef.current(payload);
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

  useEffect(() => {
    watchedRangesRef.current = [];
    lastTimeRef.current = 0;
    maxWatchedTimeRef.current = session.watchedSeconds ?? 0;
    lastReportAtRef.current = 0;
    thresholdReportedRef.current = session.status === 'done';
  }, [session.id, session.status, session.watchedSeconds]);

  useEffect(() => {
    return () => {
      const payload = buildWatchPayload('close');
      if (payload) {
        reportProgressRef.current(payload);
      }
    };
  }, [buildWatchPayload]);

  const handleSubmitComment = useCallback(() => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  }, [commentText, onAddComment]);

  const handleClose = useCallback(() => {
    const payload = buildWatchPayload('close');
    if (payload) {
      reportProgressRef.current(payload);
    }
    onBack();
  }, [buildWatchPayload, onBack]);

  const allComments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];

  return (
    <div className="flex min-h-full flex-col">
      {/* Video player */}
      <div className="relative aspect-video max-h-[70vh] w-full bg-black">
        {videoUrl ? (
          !showVideo ? (
            <>
              {session.coverUrl ? (
                <img
                  src={session.coverUrl}
                  alt={session.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                className="bg-ember hover:bg-ember-deep absolute inset-0 z-10 m-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
                onClick={() => setShowVideo(true)}
                aria-label="پخش ویدیو"
              >
                <Icon name="play" size={22} className="text-white" />
              </button>
            </>
          ) : (
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
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
          )
        ) : (
          <div className="text-ink-3 absolute inset-0 flex items-center justify-center">
            <Icon name="play" size={40} className="opacity-30" />
          </div>
        )}

        <span className="absolute right-4 bottom-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
          {formatDuration(session.durationSeconds!)}
        </span>
      </div>

      {/* Info bar */}
      <div className="border-hair flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div className="text-ink-3 flex items-center gap-2 text-sm">
          <button
            onClick={handleClose}
            className="text-gold hover:text-ember flex items-center gap-2 transition-colors"
          >
            <Icon name="arrow-right" size={20} className="transition-transform group-hover:-translate-x-1" />
            بازگشت
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNextSession}
            disabled={!session.nextEpisodeId}
            className="bg-ember hover:bg-ember-deep flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-45"
          >
            ویدیو بعدی
            <Icon name="arrow-left" size={16} />
          </button>
        </div>
      </div>
      <h2 className="p-3 pr-4 text-lg font-bold md:p-4 md:pr-6">{session.title}</h2>

      {/* Exercise Steps */}
      {session.steps && session.steps.length > 0 && (
        <div className="space-y-3 px-4 pb-0 md:px-6">
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
      <div className="text-ink-3 flex items-center gap-6 px-4 py-4 text-sm md:px-6">
        <span className="flex items-center gap-2">
          <Icon name="clock" size={16} />
          {formatDuration(session.durationSeconds!)}
        </span>
        <span className="flex items-center gap-2">
          <Icon name="eye" size={16} />
          {session.views ?? 'بدون'} بازدید
        </span>
      </div>

      {/* Comments Section */}
      <div className="flex-1 px-4 pb-20 md:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-ink-2 text-sm font-bold">
            نظرات کاربران ({allComments.length})
          </h3>
        </div>
        <div className="space-y-4">
          {commentsQuery.isLoading && (
            <p className="text-ink-3 text-sm">در حال بارگذاری نظرات...</p>
          )}
          {commentsQuery.isError && <p className="text-danger text-sm">خطا در دریافت نظرات</p>}
          {allComments.length === 0 ? (
            <p className="text-ink-3 text-center text-sm">هنوز هیچ نظری ثبت نشده است.</p>
          ) : (
            allComments.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                  {(c.name?.[0] ?? '?')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-ink text-sm font-bold">{c.name}</span>
                    <span className="text-ink-4 text-xs">{c.time ?? c.createdAt ?? ''}</span>
                  </div>
                  <p className="text-ink-3 mt-1 text-sm">{c.text}</p>
                </div>
              </div>
            ))
          )}
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

      {/* Fixed comment input footer */}
      <div className="border-hair flex shrink-0 items-center gap-3 border-t bg-[var(--color-panel)] p-3 md:p-4">
        <div className="bg-ember flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">
          {userName?.[0] ?? 'ک'}
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

export function formatDurationFa(totalSeconds: number | string): string {
  return toPersianDigits(formatDuration(totalSeconds));
}
