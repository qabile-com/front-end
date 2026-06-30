'use client';

import { useState } from 'react';
import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { COURSES, type Course, type CoursePart } from '@/features/dashboard/domain/courses.data';
import { PhoenixIcon } from './dashboard-sidebar';

export function CoursesTab() {
  const [selected, setSelected] = useState<Course | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[26px] font-black">کورس‌ها</h2>
        <p className="text-ink-2 text-sm">آموزش‌های ویدیویی تخصصی قبیله ققنوس</p>
      </div>

      <div className="grid gap-6 min-[1200px]:grid-cols-[1fr_380px]">
        <div className="grid grid-cols-1 gap-5 min-[1500px]:grid-cols-3 sm:grid-cols-2">
          {COURSES.map((course) => {
            const done = course.parts.filter((p) => p.status === 'done').length;
            const pct = Math.round((done / course.parts.length) * 100);
            const isSel = selected?.id === course.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelected(course)}
                className={cn(
                  'border-hair hover:border-hair-2 overflow-hidden rounded-[18px] border text-start transition-[transform,border-color] duration-300 [background:var(--glass)] hover:-translate-y-1',
                  isSel && 'border-[rgba(255,98,0,.4)] shadow-[0_12px_36px_-16px_var(--glow)]',
                )}
              >
                <div
                  className="relative grid h-28 place-items-center"
                  style={{ background: course.gradient }}
                >
                  <Icon name="play" size={34} className="text-white/90" />
                  <span className="absolute end-2.5 top-2.5 rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-bold text-white">
                    {course.duration}
                  </span>
                </div>
                <div className="p-4">
                  <span className="text-gold text-[11px] font-bold">{course.category}</span>
                  <h3 className="mt-1 text-[15px] font-extrabold">{course.title}</h3>
                  <div className="text-ink-3 mt-2 flex items-center gap-3 text-[12px]">
                    <span className="flex items-center gap-1">
                      <Icon name="play" size={12} />
                      {course.views}
                    </span>
                    <span className="text-gold flex items-center gap-1">
                      <PhoenixIcon className="size-3.5 rounded-full" />+{toPersianDigits(course.xp)}
                    </span>
                  </div>
                  <div className="mt-3 h-[3px] overflow-hidden rounded-full [background:var(--color-hair)]">
                    <div
                      className="h-full [background:linear-gradient(90deg,var(--color-ember),var(--color-gold))]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-hair sticky top-[88px] h-fit overflow-hidden rounded-[20px] border [background:var(--glass)] max-[1200px]:static">
          {selected ? <CourseDetail course={selected} /> : <DetailEmpty />}
        </div>
      </div>
    </div>
  );
}

function DetailEmpty() {
  return (
    <div className="text-ink-3 grid min-h-[300px] place-items-center p-8 text-center">
      <div>
        <Icon name="book" size={40} className="mx-auto mb-3 opacity-50" />
        یک کورس رو انتخاب کن تا سرفصل بخش‌هاش رو ببینی
      </div>
    </div>
  );
}

function CourseDetail({ course }: { course: Course }) {
  const done = course.parts.filter((p) => p.status === 'done').length;
  return (
    <div className="flex max-h-[calc(100vh-120px)] flex-col">
      <div className="border-hair border-b p-5">
        <span className="text-gold text-[11px] font-bold">{course.category}</span>
        <h3 className="mt-1 text-lg font-black">{course.title}</h3>
        <div className="mt-3 flex items-center gap-2">
          <PhoenixIcon className="size-5 rounded-full" />
          <b className="text-gold text-[14px] font-extrabold">
            +{toPersianDigits(course.xp)} امتیاز
          </b>
        </div>
        <small className="text-ink-3 mt-1 block text-[12px]">
          {toPersianDigits(done)} از {toPersianDigits(course.parts.length)} بخش تکمیل شده
        </small>
      </div>
      <div className="flex flex-col gap-2 overflow-y-auto p-4">
        {course.parts.map((part, i) => (
          <PartRow key={i} part={part} index={i} />
        ))}
      </div>
    </div>
  );
}

function PartRow({ part, index }: { part: CoursePart; index: number }) {
  const status =
    part.status === 'done'
      ? { label: 'تکمیل شده', cls: 'text-[#2bd4a8]' }
      : part.status === 'partial'
        ? { label: `${toPersianDigits(part.progress ?? 0)}٪ دیده شده`, cls: 'text-ember' }
        : { label: 'دیده نشده', cls: 'text-ink-3' };

  return (
    <div className="border-hair flex items-center gap-3 rounded-[14px] border p-3 [background:var(--glass-2)]">
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
        <span className="text-ink-4 grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold [background:var(--glass-2)]">
          {toPersianDigits(index + 1)}
        </span>
      )}
      <span className="min-w-0 flex-1 leading-tight">
        <b className="block truncate text-[13.5px] font-bold">{part.title}</b>
        <span className="text-ink-3 flex items-center gap-1 text-[11.5px]">
          <Icon name="clock" size={12} />
          {part.duration}
        </span>
      </span>
      <span className={cn('shrink-0 text-[11px] font-bold', status.cls)}>{status.label}</span>
    </div>
  );
}
