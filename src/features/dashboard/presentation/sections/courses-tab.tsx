// src/features/dashboard/presentation/sections/courses-tab.tsx
'use client';

import { useState } from 'react';
import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import type { Course, CoursePart } from '../../domain/courses.data';
import { CourseSessionModal } from '../components/course-session-modal';
import { PhoenixIcon } from './dashboard-sidebar';
import { useSessionDetail } from '../../application/use-session-detail';
import { commentsRepo, sessionRepo } from '../../infrastructure/repository-factory';
import { useSessionComments } from '../../application/use-session-comments';

interface CoursesTabProps {
  courses: Course[];
}

export function CoursesTab({ courses }: CoursesTabProps) {
  const [selected, setSelected] = useState<Course | null>(null);
  const [selectedPart, setSelectedPart] = useState<CoursePart | null>(null);
  // const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const { data: sessionDetail, isLoading } = useSessionDetail(
    sessionRepo,
    selected?.id ?? null,
    selectedPart?.title ?? null,
  );
  const commentsQuery = useSessionComments(
    commentsRepo,
    selected?.id ?? null,
    selectedPart?.title ?? null,
  );

  const handleAddComment = (text: string) => {
    // TODO: Replace with a proper mutation to add comment
    console.log('New comment:', text);
    // You can optimistically update the commentsQuery cache here
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
            const done = course.parts.filter((p) => p.status === 'done').length;
            const pct = Math.round((done / course.parts.length) * 100);
            const isSel = selected?.id === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelected(course)}
                className={cn(
                  'flex h-full flex-col overflow-hidden rounded-[18px] border text-start transition-[transform,border-color] duration-300 [background:var(--glass)] hover:-translate-y-1',
                  'border-hair hover:border-hair-2',
                  isSel && 'border-[rgba(255,98,0,.4)] shadow-[0_12px_36px_-16px_var(--glow)]',
                )}
              >
                {/* Fixed‑height image area */}
                <div
                  className="relative grid h-40 shrink-0 place-items-center"
                  style={{ background: course.gradient }}
                >
                  <Icon name="play" size={34} className="text-white/90" />
                  <span className="absolute end-2.5 top-2.5 rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-bold text-white">
                    {course.duration}
                  </span>
                </div>

                {/* Text content – fills remaining space */}
                <div className="flex flex-1 flex-col p-4">
                  <span className="text-gold text-[11px] font-bold">{course.category}</span>
                  <h3 className="mt-1 text-[15px] font-extrabold">{course.title}</h3>
                  <div className="mt-auto">
                    <div className="text-ink-3 mt-2 flex items-center justify-between gap-3 text-[12px]">
                      <span className="flex items-center gap-1">
                        <Icon name="eye" size={12} />
                        {course.views}
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
          session={sessionDetail.part}
          videoUrl={sessionDetail.videoUrl}
          commentsQuery={commentsQuery}
          onMarkComplete={() => {
            setSelectedPart(null);
          }}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
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
  const done = course.parts.filter((p) => p.status === 'done').length;
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
                +{toPersianDigits(course.xp)} امتیاز
              </b>
            </div>
            <small className="text-ink-3 mt-1 block text-[12px]">
              {toPersianDigits(done)} از {toPersianDigits(course.parts.length)} بخش تکمیل شده
            </small>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-4">
        {course.parts.map((part, i) => (
          <PartRow key={i} part={part} index={i} onClick={() => onPartClick(part)} />
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
            {part.duration}
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
