// src/features/dashboard/presentation/sections/courses-tab.tsx
'use client';

import { useCallback, useState } from 'react';
import { Icon, OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import type { Course, CoursePart } from '../../domain/courses.data';
import { CourseSessionModal } from '../components/course-session-modal';
import { StreakSuccessModal } from '../components/streak-success-modal';
import { AchievementEarnedModal } from '../components/achievement-earned-modal';
import { XpEarnedModal } from '../components/xp-earned-modal';
import { PhoenixIcon } from './dashboard-sidebar';
import { useSessionDetail } from '../../application/use-session-detail';
import { commentsRepo, coursesRepo, sessionRepo } from '../../infrastructure/repository-factory';
import { useReportSectionWatchProgress } from '../../application/use-courses';
import { useAddSessionComment, useSessionComments } from '../../application/use-session-comments';
import type {
  Achievement,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '../../domain/dashboard.types';
import { formatDuration } from '@/core/lib/format-duration';

interface CoursesTabProps {
  courses: Course[];
  userName?: string;
}

export function CoursesTab({ courses, userName }: CoursesTabProps) {
  const [selected, setSelected] = useState<Course | null>(null);
  const [selectedPart, setSelectedPart] = useState<CoursePart | null>(null);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [streakReward, setStreakReward] = useState<number | null>(null);
  const [earnedAchievement, setEarnedAchievement] = useState<Achievement | null>(null);
  // const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: sessionDetail, isLoading } = useSessionDetail(
    sessionRepo,
    selected?.id ?? null,
    selectedPart?.id ?? null,
  );
  console.log(sessionDetail);
  console.log(selectedPart);
  const commentsQuery = useSessionComments(
    commentsRepo,
    selected?.id ?? null,
    selectedPart?.id ?? null,
  );
  const addComment = useAddSessionComment(commentsRepo);
  const reportWatchProgress = useReportSectionWatchProgress(coursesRepo);

  const handleWatchProgressResult = useCallback((result: SectionWatchProgressResult) => {
    setSelectedPart((part) =>
      part && part.id === result.section.id
        ? {
            ...part,
            status: result.section.status,
            progress: result.section.progress,
            watchedSeconds: result.section.watchedSeconds,
            completedAt: result.section.completedAt,
            xpGrantedAt: result.section.xpGrantedAt,
          }
        : part,
    );

    if (result.reward?.xpGranted) setEarnedXp(result.reward.xpGranted);
    if (result.reward?.streak?.increased) setStreakReward(result.reward.streak.current);
    if (result.reward?.achievements?.[0]) setEarnedAchievement(result.reward.achievements[0]);
  }, []);
  const handleAddComment = (text: string) => {
    if (!selected || !selectedPart) return;
    addComment.mutate({ courseId: selected.id, sectionId: selectedPart.id, text });
  };

  const handleWatchProgress = useCallback(
    (body: SectionWatchProgressInput) => {
      if (!selectedPart) return;

      reportWatchProgress.mutate(
        {
          sectionId: selectedPart.id,
          body,
        },
        {
          onSuccess: handleWatchProgressResult,
        },
      );
    },
    [selectedPart?.id, reportWatchProgress],
  );

  const handleNextSession = () => {
    const nextSectionId = sessionDetail?.part.nextSectionId ?? selectedPart?.nextSectionId;
    if (!selected || !nextSectionId) return;
    const nextPart = selected.episodes.find((part) => part.id === nextSectionId);
    setSelectedPart(
      nextPart ?? {
        id: nextSectionId,
        title: '',
        durationSeconds: 0,
        status: 'none',
      },
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[26px] font-black">کورس‌ها</h2>
        <p className="text-ink-2 text-sm">آموزش‌های ویدیویی تخصصی قبیله ققنوس</p>
      </div>

      <div className="grid items-start gap-6 min-[1200px]:grid-cols-[1fr_380px]">
        <div className="grid grid-cols-1 gap-5 min-[1500px]:grid-cols-3 sm:grid-cols-2">
          {courses.map((course) => {
            console.log(course);
            const done = course.episodes.filter((p) => p.status === 'done').length;
            const pct = Math.round((done / course.episodes.length) * 100);
            const isSel = selected?.id === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelected(course)}
                className={cn(
                  'flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[18px] border text-start transition-[transform,border-color] duration-300 [background:var(--glass)] hover:-translate-y-1',
                  'border-hair hover:border-hair-2',
                  isSel && 'border-[rgba(255,98,0,.4)] shadow-[0_12px_36px_-16px_var(--glow)]',
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
                    {formatDurationFa(course.duration)}
                  </span>
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
                        <PhoenixIcon className="size-3.5 rounded-full" />
                        {toPersianDigits(course.xp)}+
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
            );
          })}
        </div>

        <div className="border-hair sticky top-22 h-fit overflow-hidden rounded-[20px] border [background:var(--glass)] max-[1200px]:static">
          {selected ? (
            <CourseDetail course={selected} onPartClick={setSelectedPart} />
          ) : (
            <DetailEmpty />
          )}
        </div>
      </div>

      {/* Course Session Modal */}
      {selectedPart && sessionDetail && (
        <CourseSessionModal
          isOpen={!!selectedPart && !isLoading}
          onClose={() => {
            setSelectedPart(null);
          }}
          session={selectedPart}
          videoUrl={selectedPart?.videoUrl}
          commentsQuery={commentsQuery}
          onNextSession={handleNextSession}
          onWatchProgress={handleWatchProgress}
          onAddComment={handleAddComment}
          userName={userName}
          isAddingComment={addComment.isPending}
        />
      )}

      <StreakSuccessModal
        isOpen={streakReward !== null}
        streak={streakReward ?? 0}
        onClose={() => setStreakReward(null)}
      />
      <XpEarnedModal
        xp={earnedXp}
        description="آتش این جلسه به حساب قبیله‌ات اضافه شد."
        onClose={() => setEarnedXp(null)}
      />
      <AchievementEarnedModal
        achievement={earnedAchievement}
        onClose={() => setEarnedAchievement(null)}
      />
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

function DetailEmpty() {
  return (
    <div className="text-ink-3 grid min-h-75 place-items-center p-8 text-center">
      <div>
        <Icon name="book" size={40} className="mx-auto mb-3 opacity-50" />
        یک کورس رو انتخاب کن تا سرفصل بخش‌هاش رو ببینی
      </div>
    </div>
  );
}

function CourseDetail({
  course,
  onPartClick,
}: {
  course: Course;
  onPartClick: (part: CoursePart) => void;
}) {
  const done = course.episodes.filter((p) => p.status === 'done').length;
  return (
    <div className="flex max-h-[calc(100vh-120px)] flex-col">
      <div className="border-hair border-b p-5">
        <span className="text-[11px] font-bold text-[#FF6200]">{course.category}</span>
        <h3 className="mt-1 text-lg font-black">{course.title}</h3>
        <div className="text-gold mt-2 flex items-center gap-3 rounded-[14px] border border-[#F3BA632E] px-3.5 py-3 text-[14.5px] font-extrabold shadow-[0_4px_16px_-8px_#F3BA632E] transition-colors [background:linear-gradient(135deg,#F3BA6314,rgba(243,186,99,.08))]">
          <PhoenixIcon className="size-10 rounded-full" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <b className="text-gold text-[14px] font-extrabold">
                +{toPersianDigits(course.xp)} آتش
              </b>
            </div>
            <small className="text-ink-3 mt-1 block text-[12px]">
              {toPersianDigits(done)} از {toPersianDigits(course.episodes.length)} بخش تکمیل شده
            </small>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-4">
        {course.episodes.map((part, i) => (
          <PartRow
            key={i}
            part={part}
            index={i}
            onClick={() => {
              console.log(part);
              onPartClick(part);
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
}: {
  part: CoursePart;
  index: number;
  onClick: () => void;
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
      className="flex w-full items-center justify-between gap-3 p-3 text-start transition-colors hover:cursor-pointer hover:bg-(--glass-3)"
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
      <Icon name="arrow-left" size={18} className="text-ink-3 shrink-0" />
    </button>
  );
}

export function formatDurationFa(totalSeconds: number | string): string {
  return toPersianDigits(formatDuration(totalSeconds));
}
