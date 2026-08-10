'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useRouter } from 'next/navigation';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/core/lib/cn';
import { getAvatarInitial } from '@/core/lib/avatar';
import { formatDuration } from '@/core/lib/format-duration';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import {
  Button,
  Icon,
  InlineSkeleton,
  Input,
  OptionalImage,
  Skeleton,
  UserAvatar,
  type IconName,
} from '@/shared/ui';
import type {
  SectionWatchEvent,
  SectionWatchProgressInput,
} from '@/features/dashboard/domain/dashboard.types';
import type { Comment, PaginatedComments } from '../../domain/comments-repository';
import type { Course, CoursePart } from '../../domain/courses.data';

interface SessionContentProps {
  session: CoursePart;
  course?: Course;
  currentSectionId?: string;
  videoUrl?: string;
  audioUrl?: string;
  fireBalance?: number;
  isPurchasingCourse?: boolean;
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  commentsLocked?: boolean;
  onNextSession: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onWatchProgress: (body: SectionWatchProgressInput) => void;
  onAddComment: (text: string) => void;
  onBuyCourse?: () => void;
  onBack: () => void;
  isAddingComment?: boolean;
  userName?: string;
  userAvatar?: string | null;
}

type SessionTab = 'sections' | 'about' | 'comments';

const SESSION_TABS: Array<{ id: SessionTab; label: string }> = [
  { id: 'sections', label: 'فصل‌ها' },
  { id: 'about', label: 'درباره دوره' },
  { id: 'comments', label: 'نظرات' },
];

export function SessionContent({
  session,
  course,
  currentSectionId,
  onNextSession,
  onNavigateSection,
  onWatchProgress,
  commentsQuery,
  commentsLocked = false,
  videoUrl,
  fireBalance = 0,
  isPurchasingCourse = false,
  onBuyCourse,
  onBack,
  isAddingComment = false,
  userName,
  userAvatar,
  onAddComment,
}: SessionContentProps) {
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchedRangesRef = useRef<{ start: number; end: number }[]>([]);
  const lastTimeRef = useRef(0);
  const maxWatchedTimeRef = useRef(0);
  const lastReportAtRef = useRef(0);
  const trackedSessionIdRef = useRef(session.id);
  const thresholdReportedRef = useRef(session.status === 'done');
  const reportProgressRef = useRef(onWatchProgress);
  const isMobileViewport = useMediaQuery('(max-width: 767px)');
  const [watchProgressBySession, setWatchProgressBySession] = useState<Record<string, number>>({});
  const [commentText, setCommentText] = useState('');
  const [selectedTab, setSelectedTab] = useState<SessionTab | null>(null);
  const activeTab = selectedTab ?? (isMobileViewport ? 'sections' : 'about');
  const displayCourse: Course = course ?? {
    id: session.courseId ?? 'current-course',
    title: 'دوره آموزشی',
    category: 'آموزش',
    views: typeof session.views === 'number' ? `${toPersianDigits(session.views)} نفر` : '—',
    imageUrl: session.coverUrl,
    duration: formatDurationFa(session.durationSeconds ?? session.duration ?? 0),
    xp: session.xp ?? 0,
    episodes: [session],
  };
  const selectedSectionId = currentSectionId ?? session.id;
  const handleNavigateSection = onNavigateSection ?? (() => undefined);
  const coursePrice = displayCourse.priceInFire ?? 0;
  const isFreeCourse = displayCourse.isFree || coursePrice <= 0;
  const isCourseUnlocked = Boolean(
    displayCourse.isPurchased || displayCourse.isUnlocked || isFreeCourse,
  );
  const requiresPurchase = Boolean(session.requiresPurchase || !isCourseUnlocked);
  const hasEnoughFire = fireBalance >= coursePrice;
  const canTrackWatch = !requiresPurchase && Boolean(videoUrl);
  const shouldAutoStartVideo = canTrackWatch;
  const [showVideo, setShowVideo] = useState(shouldAutoStartVideo);

  useEffect(() => {
    reportProgressRef.current = onWatchProgress;
  }, [onWatchProgress]);

  const watchProgress = Math.max(watchProgressBySession[session.id] ?? 0, session.progress ?? 0);

  const buildWatchPayload = useCallback(
    (event: SectionWatchEvent): SectionWatchProgressInput | null => {
      if (!canTrackWatch) return null;

      const video = videoRef.current;
      const duration = Math.floor(video?.duration || session.durationSeconds || 0);
      if (!duration) return null;

      return {
        courseId: session.courseId ?? displayCourse.id,
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
    [canTrackWatch, displayCourse.id, session.courseId, session.durationSeconds],
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
    if (!canTrackWatch) return;

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
    setWatchProgressBySession((previousProgress) => {
      if (previousProgress[session.id] === progress) return previousProgress;
      return {
        ...previousProgress,
        [session.id]: Math.max(previousProgress[session.id] ?? 0, progress),
      };
    });

    if (progress >= 80 && !thresholdReportedRef.current) {
      thresholdReportedRef.current = true;
      reportWatchProgress('threshold', true);
      return;
    }

    reportWatchProgress('timeupdate');
  }, [canTrackWatch, reportWatchProgress, session.id]);

  useEffect(() => {
    if (trackedSessionIdRef.current === session.id) return;

    trackedSessionIdRef.current = session.id;
    watchedRangesRef.current = [];
    lastTimeRef.current = 0;
    maxWatchedTimeRef.current = session.watchedSeconds ?? 0;
    lastReportAtRef.current = 0;
    thresholdReportedRef.current = session.status === 'done';
  }, [session.id, session.status, session.watchedSeconds]);

  useEffect(() => {
    return () => {
      const payload = buildWatchPayload('close');
      if (payload) reportProgressRef.current(payload);
    };
  }, [buildWatchPayload]);

  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  }, [commentText, onAddComment]);

  const handleClose = useCallback(() => {
    const payload = buildWatchPayload('close');
    if (payload) reportProgressRef.current(payload);
    onBack();
  }, [buildWatchPayload, onBack]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = session.title;
    const text = `جلسه «${session.title}» از دوره «${displayCourse.title}»`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      showSuccess('لینک جلسه کپی شد');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showError('اشتراک‌گذاری انجام نشد');
    }
  }, [displayCourse.title, session.title]);

  const allComments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];
  const currentIndex = Math.max(
    0,
    displayCourse.episodes.findIndex((part) => part.id === selectedSectionId),
  );
  const courseDurationSeconds = displayCourse.episodes.reduce(
    (sum, part) => sum + (part.durationSeconds ?? 0),
    0,
  );
  const hasNext = Boolean(session.nextSectionId || session.nextEpisodeId);
  const sessionXp =
    session.xp ?? Math.round((displayCourse.xp ?? 0) / Math.max(1, displayCourse.episodes.length));
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-full w-full max-w-[920px] min-w-0 flex-col overflow-x-clip pb-28 min-[1440px]:max-w-none md:pb-0"
    >
      <section className="max-w-full min-w-0 overflow-hidden rounded-[28px] border border-[var(--session-border)] bg-[var(--session-surface)] shadow-[0_30px_90px_-50px_var(--glow)] lg:rounded-[32px]">
        <div className="relative aspect-video min-h-[190px] overflow-hidden bg-black sm:min-h-0">
          <VideoOrCover
            session={session}
            videoUrl={videoUrl}
            isLocked={requiresPurchase}
            showVideo={showVideo}
            setShowVideo={setShowVideo}
            videoRef={videoRef}
            rememberWatchedTime={rememberWatchedTime}
            reportWatchProgress={reportWatchProgress}
            syncLastTime={() => {
              lastTimeRef.current = videoRef.current?.currentTime ?? 0;
            }}
          />

          {!showVideo && (
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-4 sm:p-6">
              <IconButton label="بازگشت" onClick={handleClose} icon="arrow-right" />
              <IconButton label="اشتراک‌گذاری" onClick={() => void handleShare()} icon="share" />
            </div>
          )}

          {!showVideo && (
            <button
              type="button"
              className={cn(
                'focus:ring-gold absolute inset-0 z-20 m-auto grid size-17 place-items-center rounded-full border border-[rgba(243,186,99,.45)] text-black shadow-[0_18px_42px_-16px_var(--glow)] transition-transform duration-250 [background:var(--session-primary)] hover:scale-105 focus:ring-2 focus:outline-none active:scale-95',
                requiresPurchase && 'cursor-pointer',
              )}
              onClick={() => {
                if (requiresPurchase) {
                  onBuyCourse?.();
                  return;
                }
                setShowVideo(true);
              }}
              aria-label={requiresPurchase ? 'خرید دوره' : 'پخش ویدیو'}
            >
              <Icon name={requiresPurchase ? 'lock' : 'play'} size={24} />
            </button>
          )}
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="border-t border-[var(--session-border)] bg-[linear-gradient(180deg,rgba(255,98,0,.08),rgba(0,0,0,.16))] p-5 sm:p-7 lg:p-8"
        >
          {showVideo && (
            <div className="mb-5 flex items-center justify-between gap-3">
              <IconTextButton label="بازگشت" onClick={handleClose} icon="arrow-right" />
              <IconTextButton
                label="اشتراک‌گذاری"
                onClick={() => void handleShare()}
                icon="share"
              />
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-5">
            <div className="min-w-0">
              <h1 className="text-ink max-w-2xl text-[25px] leading-[1.35] font-black sm:text-3xl">
                {session.title}
              </h1>
              <p className="text-ink-2 mt-3 max-w-2xl text-[13.5px] leading-7 sm:text-sm">
                {session.description
                  ? session.description
                  : `این جلسه بخشی از مسیر «${displayCourse.title}» است. ویدیو را کامل ببین، نکات مهم را
                  مرور کن و با ادامه دادن مسیر، پیشرفتت را ثبت کن.`}
              </p>
            </div>
            {requiresPurchase && (
              <LockedCourseNotice
                price={coursePrice}
                fireBalance={fireBalance}
                hasEnoughFire={hasEnoughFire}
                isPurchasing={isPurchasingCourse}
                onBuyCourse={onBuyCourse}
              />
            )}
            <div className="hidden md:flex md:justify-start">
              {requiresPurchase ? null : (
                <ContinueButton hasNext={hasNext} onNextSession={onNextSession} variant="desktop" />
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] border-y border-[var(--session-border)] bg-black/35 sm:grid-cols-4">
          <SessionStat
            label="زمان دوره"
            value={formatDurationFa(session.durationSeconds ?? 0)}
            icon="clock"
          />
          <SessionStat
            label={`بخش ${toPersianDigits(currentIndex + 1)} از ${toPersianDigits(displayCourse.episodes.length)}`}
            value={session.status === 'done' ? 'تکمیل شده' : 'سطح متوسط'}
            icon="episodes"
          />
          <SessionStat label="آتش" value={`+${toPersianDigits(sessionXp)} آتش`} icon="flame" />
          <SessionStat
            label="دانشجویان دوره"
            value={
              typeof session.views === 'number'
                ? `${toPersianDigits(session.views)} نفر`
                : displayCourse.views
            }
            icon="users"
          />
        </div>

        <SessionProgressCard
          progress={watchProgress}
          status={session.status}
          locked={requiresPurchase}
        />

        <div className="px-4 pt-4 sm:px-6">
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-1 rounded-[18px] border border-[var(--session-border)] bg-black/28 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] min-[1440px]:grid-cols-2">
            {SESSION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id)}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={cn(
                  'relative min-h-11 rounded-[14px] border px-2 text-sm font-black transition-[background,border-color,color,box-shadow,transform] duration-250 active:scale-[.98]',
                  tab.id === 'sections' && 'min-[1440px]:hidden',
                  activeTab === tab.id
                    ? 'border-[rgba(243,186,99,.32)] text-[#1a0a00] shadow-[0_12px_30px_-22px_var(--glow)] [background:var(--session-primary)]'
                    : 'text-ink-3 hover:text-ink-2 border-transparent hover:border-[var(--session-border)] hover:bg-[var(--session-surface-2)]',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'sections' && (
              <AnimatedPanel key="sections">
                <div className="min-[1440px]:hidden">
                  <SectionsPanel
                    course={displayCourse}
                    currentSectionId={selectedSectionId}
                    onNavigateSection={handleNavigateSection}
                  />
                </div>
                <div className="hidden min-[1440px]:block">
                  <AboutPanel
                    course={displayCourse}
                    session={session}
                    courseDurationSeconds={courseDurationSeconds}
                  />
                </div>
              </AnimatedPanel>
            )}
            {activeTab === 'about' && (
              <AnimatedPanel key="about">
                <AboutPanel
                  course={displayCourse}
                  session={session}
                  courseDurationSeconds={courseDurationSeconds}
                />
              </AnimatedPanel>
            )}
            {activeTab === 'comments' && (
              <AnimatedPanel key="comments">
                <CommentsPanel
                  allComments={allComments}
                  commentsQuery={commentsQuery}
                  isLocked={commentsLocked || requiresPurchase}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  handleSubmitComment={handleSubmitComment}
                  isAddingComment={isAddingComment}
                  userName={userName}
                  userAvatar={userAvatar}
                />
              </AnimatedPanel>
            )}
          </AnimatePresence>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-80 border-t border-[var(--session-border)] bg-[#070302]/95 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[920px] min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-gold grid min-h-13 w-14 place-items-center rounded-[14px] border border-[var(--session-border)] bg-[var(--session-surface-2)] transition-colors hover:border-[var(--session-border-strong)]"
            aria-label="بازگشت به دوره‌ها"
          >
            <Icon name="arrow-right" size={22} />
          </button>
          {requiresPurchase ? (
            <LockedCourseAction
              price={coursePrice}
              hasEnoughFire={hasEnoughFire}
              isPurchasing={isPurchasingCourse}
              onBuyCourse={onBuyCourse}
            />
          ) : (
            <ContinueButton hasNext={hasNext} onNextSession={onNextSession} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function VideoOrCover({
  session,
  videoUrl,
  isLocked,
  showVideo,
  setShowVideo,
  videoRef,
  rememberWatchedTime,
  reportWatchProgress,
  syncLastTime,
}: {
  session: CoursePart;
  videoUrl?: string;
  isLocked: boolean;
  showVideo: boolean;
  setShowVideo: (value: boolean) => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  rememberWatchedTime: () => void;
  reportWatchProgress: (event: SectionWatchEvent, force?: boolean) => void;
  syncLastTime: () => void;
}) {
  if (!isLocked && videoUrl && showVideo) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        autoPlay
        className="absolute inset-0 h-full w-full bg-black object-contain"
        onLoadedMetadata={syncLastTime}
        onTimeUpdate={rememberWatchedTime}
        onPause={() => reportWatchProgress('pause', true)}
        onEnded={() => reportWatchProgress('ended', true)}
        onSeeking={syncLastTime}
        onSeeked={syncLastTime}
        controlsList="nodownload"
      />
    );
  }

  return (
    <>
      {session.coverUrl ? (
        <img
          src={session.coverUrl}
          alt={session.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,98,0,.42),transparent_38%),linear-gradient(135deg,#210904,#070302_58%,#000)]" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.18)_0%,rgba(0,0,0,.42)_44%,rgba(0,0,0,.94)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(255,98,0,.35),transparent_65%)]" />
      {isLocked && <div className="absolute inset-0 bg-black/18" />}
      {!isLocked && !videoUrl && (
        <button
          type="button"
          onClick={() => setShowVideo(false)}
          className="text-gold absolute inset-0 m-auto grid size-16 place-items-center rounded-full border border-[rgba(243,186,99,.35)] bg-black/55"
          aria-label="ویدیویی برای این جلسه ثبت نشده است"
        >
          <Icon name="play" size={24} />
        </button>
      )}
    </>
  );
}

function AnimatedPanel({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function IconButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: 'arrow-right' | 'share';
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="text-ink hover:text-gold grid size-11 place-items-center rounded-full border border-white/10 bg-black/35 backdrop-blur-md transition-colors hover:border-[var(--session-border-strong)]"
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

function IconTextButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: 'arrow-right' | 'share';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-ink-2 hover:text-gold flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--session-border)] bg-[var(--session-surface-2)] px-3 text-sm font-black transition-colors hover:border-[var(--session-border-strong)]"
    >
      <Icon name={icon} size={17} />
      {label}
    </button>
  );
}

function LockedCourseNotice({
  price,
  fireBalance,
  hasEnoughFire,
  isPurchasing,
  onBuyCourse,
}: {
  price: number;
  fireBalance: number;
  hasEnoughFire: boolean;
  isPurchasing: boolean;
  onBuyCourse?: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[920px] rounded-[20px] border border-[rgba(255,98,0,.24)] bg-[linear-gradient(135deg,rgba(255,98,0,.14),rgba(0,0,0,.28))] p-4 shadow-[0_18px_54px_-42px_var(--glow)] md:max-w-2/3">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <span className="text-gold grid size-11 shrink-0 place-items-center rounded-2xl border border-[rgba(243,186,99,.26)] bg-black/28">
          <Icon name="lock" size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-ink text-sm font-black sm:text-base">
            برای دیدن جلسه‌ها و ادامه دوره باید آن را بخری.
          </h3>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            <span className="text-gold inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[rgba(243,186,99,.2)] bg-black/28 px-3">
              قیمت: {toPersianDigits(price)}
              <Icon name="flame" size={14} />
            </span>
            <span
              className={cn(
                'inline-flex min-h-9 items-center gap-1.5 rounded-xl border bg-black/28 px-3',
                hasEnoughFire
                  ? 'border-[#2bd4a8]/25 text-[#2bd4a8]'
                  : 'border-red-500/25 text-red-300',
              )}
            >
              <Icon name="flame" size={14} />
              آتش شما: {toPersianDigits(fireBalance)}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:max-w-[340px]">
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!hasEnoughFire || isPurchasing || !onBuyCourse}
              onClick={onBuyCourse}
              className="w-full"
            >
              {isPurchasing ? (
                'در حال خرید...'
              ) : (
                <>
                  قیمت: {toPersianDigits(price)}
                  <Icon name="flame" size={16} />
                </>
              )}
            </Button>
            {!hasEnoughFire && (
              <p className="rounded-xl border border-red-500/25 px-3 py-2 text-center text-xs font-black text-red-300 [background:rgba(239,68,68,.08)]">
                آتش کافی نداری
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinueButton({
  hasNext,
  onNextSession,
  variant = 'mobile',
}: {
  hasNext: boolean;
  onNextSession: () => void;
  variant?: 'mobile' | 'desktop';
}) {
  const label = hasNext ? 'جلسه بعدی' : 'پایان دوره';
  return (
    <button
      type="button"
      onClick={onNextSession}
      disabled={!hasNext}
      className={cn(
        'flex min-h-13 items-center justify-center gap-3 rounded-[14px] px-5 text-[15px] font-black text-black shadow-[0_18px_42px_-18px_var(--glow)] transition-transform duration-250 [background:var(--session-primary)] hover:-translate-y-0.5 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45',
        variant === 'desktop' ? 'min-w-56' : 'flex-1',
      )}
    >
      {label}
      <Icon name={hasNext ? 'arrow-left' : 'check'} size={18} />
    </button>
  );
}

function LockedCourseAction({
  price,
  hasEnoughFire,
  isPurchasing,
  onBuyCourse,
  variant = 'mobile',
}: {
  price: number;
  hasEnoughFire: boolean;
  isPurchasing: boolean;
  onBuyCourse?: () => void;
  variant?: 'mobile' | 'desktop';
}) {
  return (
    <button
      type="button"
      onClick={onBuyCourse}
      disabled={!hasEnoughFire || isPurchasing || !onBuyCourse}
      className={cn(
        'flex min-h-13 items-center justify-center gap-2 rounded-[14px] px-5 text-[14px] font-black text-black shadow-[0_18px_42px_-18px_var(--glow)] transition-transform duration-250 [background:var(--session-primary)] hover:-translate-y-0.5 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45',
        variant === 'desktop' ? 'min-w-64' : 'flex-1',
      )}
    >
      <Icon name={hasEnoughFire ? 'lock' : 'flame'} size={17} />
      {isPurchasing
        ? 'در حال خرید...'
        : hasEnoughFire
          ? `خرید دوره با ${toPersianDigits(price)} آتش`
          : 'آتش کافی نداری'}
    </button>
  );
}

function SessionProgressCard({
  progress,
  status,
  locked,
}: {
  progress: number;
  status: CoursePart['status'];
  locked: boolean;
}) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="border-b border-[var(--session-border)] bg-black/24 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-ink text-sm font-black">پیشرفت جلسه</p>
          {locked && (
            <p className="text-ink-3 mt-1 text-xs">
              بعد از خرید دوره، با دیدن حداقل ۸۰٪ جلسه پیشرفتت ثبت می‌شود.
            </p>
          )}
          {!locked && (
            <p className="text-ink-3 mt-1 text-xs">
              {status === 'done'
                ? 'این جلسه کامل شده است.'
                : 'با دیدن حداقل ۸۰٪ جلسه، پیشرفتت ثبت می‌شود.'}
            </p>
          )}
        </div>
        <span className="text-gold text-lg font-black tabular-nums">
          {toPersianDigits(normalizedProgress)}٪
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/55">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${normalizedProgress}%` }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="block h-full rounded-full shadow-[0_0_18px_var(--glow)] [background:var(--session-primary)]"
        />
      </div>
    </div>
  );
}

function SessionStat({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <div className="min-w-0 border-s border-[var(--session-border)] px-2 py-4 text-center first:border-s-0 sm:px-4">
      <div className="text-ink flex min-w-0 items-center justify-center gap-1.5 text-[13px] font-black sm:text-lg">
        {icon === 'flame' ? (
          <span className="relative size-5 shrink-0">
            <OptionalImage src="/assets/phoenix_badge.webp" alt="" className="object-contain" />
          </span>
        ) : (
          <Icon name={icon} size={18} className="text-ember" />
        )}
        <span className="min-w-0 truncate">{value}</span>
      </div>
      <p className="text-ink-3 mt-1 truncate text-[11px] font-bold sm:text-xs">{label}</p>
    </div>
  );
}

function SectionsPanel({
  course,
  currentSectionId,
  onNavigateSection,
}: {
  course: Course;
  currentSectionId: string;
  onNavigateSection: (sectionId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {course.episodes.map((part, index) => (
        <SectionRow
          key={part.id}
          part={part}
          index={index}
          isActive={part.id === currentSectionId}
          onClick={() => part.id !== currentSectionId && onNavigateSection(part.id)}
        />
      ))}
    </div>
  );
}

function SectionRow({
  part,
  index,
  isActive,
  onClick,
}: {
  part: CoursePart;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const isDone = part.status === 'done';
  const isLocked = Boolean(part.requiresPurchase);
  const duration = formatDurationFa(part.durationSeconds ?? 0);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-h-15 w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-right transition-[border-color,background,transform]',
        isActive
          ? 'text-gold border-[var(--session-border-strong)] bg-[var(--session-active)] shadow-[0_14px_34px_-26px_var(--glow)]'
          : 'text-ink-2 border-[var(--session-border)] bg-[var(--session-surface-2)] hover:border-[var(--session-border-strong)] hover:bg-[var(--session-surface-3)]',
        isLocked && !isActive && 'opacity-75',
      )}
    >
      <span
        className={cn(
          'grid size-8 shrink-0 place-items-center rounded-full border text-xs font-black',
          isDone
            ? 'border-success bg-success/15 text-success'
            : isActive
              ? 'border-gold text-gold bg-black/25'
              : 'text-ink-3 border-[var(--session-border)]',
        )}
      >
        {isDone ? (
          <Icon name="check" size={15} />
        ) : isLocked ? (
          <Icon name="lock" size={14} />
        ) : (
          toPersianDigits(index + 1)
        )}
      </span>
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13px] font-black sm:text-sm">{part.title}</b>
        <span className="text-ink-3 mt-1 flex items-center gap-1 text-[12px]">
          <Icon name="clock" size={13} />
          {duration}
        </span>
      </div>
      <span className="text-gold text-sm font-black">{duration}</span>
      <Icon
        name={isActive ? 'play' : 'arrow-left'}
        size={16}
        className={cn('shrink-0', isActive ? 'text-ember' : 'text-gold')}
      />
    </button>
  );
}

function AboutPanel({
  course,
  session,
  courseDurationSeconds,
}: {
  course: Course;
  session: CoursePart;
  courseDurationSeconds: number;
}) {
  return (
    <div className="text-ink-2 space-y-4 text-sm leading-8">
      <div className="rounded-[18px] border border-[var(--session-border)] bg-[var(--session-surface-2)] p-4">
        <h2 className="text-ink text-base font-black">{course.title}</h2>
        <p className="mt-2">
          {session.description
            ? session.description
            : `در این بخش روی موضوع «${session.title}» تمرکز می‌کنی. هدف این جلسه این است که با دیدن و
            تمرین کردن، مسیر دوره را مرحله‌به‌مرحله جلو ببری.`}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3">
        <MiniInfo label="کل دوره" value={formatDurationFa(courseDurationSeconds)} />
        <MiniInfo label="آتش کل دوره" value={`+${toPersianDigits(course.xp)} آتش`} />
      </div>

      {session.steps && session.steps.length > 0 && (
        <div className="space-y-3 rounded-[18px] border border-[var(--session-border)] bg-black/20 p-4">
          <h3 className="text-ink font-black">تمرین‌های این جلسه</h3>
          {session.steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-1 grid size-6 shrink-0 place-items-center rounded-md border',
                  step.isCompleted
                    ? 'border-success bg-success/15 text-success'
                    : 'text-ink-4 border-[var(--session-border)]',
                )}
              >
                {step.isCompleted && <Icon name="check" size={14} />}
              </span>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-[16px] border border-[var(--session-border)] bg-[var(--session-surface-2)] p-4 text-center">
      <b className="text-gold block truncate text-base font-black sm:text-lg">{value}</b>
      <span className="text-ink-3 mt-1 block text-xs font-bold">{label}</span>
    </div>
  );
}

function CommentsPanel({
  allComments,
  commentsQuery,
  isLocked,
  commentText,
  setCommentText,
  handleSubmitComment,
  isAddingComment,
  userName,
  userAvatar,
}: {
  allComments: Comment[];
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  isLocked: boolean;
  commentText: string;
  setCommentText: (value: string) => void;
  handleSubmitComment: () => void;
  isAddingComment: boolean;
  userName?: string;
  userAvatar?: string | null;
}) {
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollAfterSubmitRef = useRef(false);

  useEffect(() => {
    if (!shouldScrollAfterSubmitRef.current || isAddingComment) return;

    const scrollId = window.setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      shouldScrollAfterSubmitRef.current = false;
    }, 80);

    return () => window.clearTimeout(scrollId);
  }, [allComments.length, isAddingComment]);

  const submitAndFollowComment = () => {
    if (isLocked) return;
    shouldScrollAfterSubmitRef.current = true;
    handleSubmitComment();
  };

  if (isLocked) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-ink-2 text-sm font-black">نظرات کاربران ({toPersianDigits(0)})</h3>
        </div>

        <p className="text-ink-3 rounded-[16px] border border-[var(--session-border)] bg-[var(--session-surface-2)] p-5 text-center text-sm leading-7">
          نظرات این جلسه بعد از خرید دوره فعال می‌شود.
        </p>

        <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-[var(--session-border)] bg-black/25 p-2.5 opacity-70 sm:gap-3 sm:p-3">
          <UserAvatar name={userName ?? '?'} avatar={userAvatar ?? undefined} className="size-9 text-xs" />
          <Input
            disabled
            value=""
            onChange={() => undefined}
            placeholder="بعد از خرید دوره می‌توانی نظر ثبت کنی"
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled
            className="min-h-11 shrink-0 px-3 sm:px-4"
          >
            انتشار
            <Icon name="send" size={15} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-ink-2 text-sm font-black">
          نظرات کاربران ({toPersianDigits(allComments.length)})
        </h3>
      </div>

      <div className="lg:max-h-[430px] lg:overflow-y-auto lg:overscroll-contain lg:rounded-[18px] lg:pe-1">
        <div className="space-y-4">
          {isLocked && (
            <p className="text-ink-3 rounded-[16px] border border-[var(--session-border)] bg-[var(--session-surface-2)] p-5 text-center text-sm leading-7">
              نظرات این جلسه بعد از خرید دوره فعال می‌شود.
            </p>
          )}
          {!isLocked && commentsQuery.isLoading && <CommentsSkeleton />}
          {commentsQuery.isError && <p className="text-danger text-sm">خطا در دریافت نظرات</p>}
          {!commentsQuery.isLoading && allComments.length === 0 ? (
            <p className="text-ink-3 rounded-[16px] border border-[var(--session-border)] bg-[var(--session-surface-2)] p-5 text-center text-sm">
              هنوز نظری برای این جلسه ثبت نشده است.
            </p>
          ) : (
            allComments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          )}
          <div ref={commentsEndRef} aria-hidden />

          {commentsQuery.hasNextPage && (
            <button
              type="button"
              onClick={() => commentsQuery.fetchNextPage()}
              className="text-gold hover:text-ember w-full rounded-[14px] border border-[var(--session-border)] bg-black/20 px-4 py-3 text-center text-sm font-black transition-colors"
              disabled={commentsQuery.isFetchingNextPage}
            >
              {commentsQuery.isFetchingNextPage ? (
                <InlineSkeleton className="mx-auto h-4 w-24" />
              ) : (
                'نمایش بیشتر'
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-[var(--session-border)] bg-black/25 p-2.5 sm:gap-3 sm:p-3">
        <UserAvatar name={userName ?? '?'} avatar={userAvatar ?? undefined} className="size-9 text-xs" />
        <Input
          placeholder="نظرت رو بنویس..."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          className="min-w-0 flex-1"
          onKeyDown={(event) => event.key === 'Enter' && submitAndFollowComment()}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={submitAndFollowComment}
          disabled={!commentText.trim() || isAddingComment}
          className="min-h-11 shrink-0 px-3 sm:px-4"
        >
          {isAddingComment ? 'در حال انتشار...' : 'انتشار'}
          <Icon name="send" size={15} />
        </Button>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const router = useRouter();
  const goToAuthor = () => {
    if (comment.authorId) router.push(`/social/users/${comment.authorId}`);
  };

  return (
    <div className="flex items-start gap-3 rounded-[16px] border border-[var(--session-border)] bg-[var(--session-surface-2)] p-3.5">
      <button
        type="button"
        disabled={!comment.authorId}
        onClick={goToAuthor}
        className="mt-0.5 disabled:cursor-default"
        aria-label={`مشاهده پروفایل ${comment.name}`}
      >
        <UserAvatar name={comment.name} avatar={comment.avatar} className="size-9 text-xs text-[#1a0a00]" />
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="min-w-0">
          <button
            type="button"
            disabled={!comment.authorId}
            onClick={goToAuthor}
            className="text-ink hover:text-gold max-w-full truncate text-sm font-black disabled:cursor-default disabled:hover:text-ink"
          >
            {comment.name}
          </button>
        </div>
        <p className="text-ink-3 text-sm leading-7">{comment.text}</p>
        <div className="flex justify-end">
          <time className="text-ink-4 text-xs font-bold" dateTime={comment.createdAt}>
            {comment.time ?? comment.createdAt ?? ''}
          </time>
        </div>
      </div>
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-4" aria-label="در حال بارگذاری نظرات" role="status">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
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
