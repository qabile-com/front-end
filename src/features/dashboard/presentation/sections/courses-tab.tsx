// src/features/dashboard/presentation/sections/courses-tab.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Icon, OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import type { Course } from '../../domain/courses.data';
import { formatDuration } from '@/core/lib/format-duration';

interface CoursesTabProps {
  courses: Course[];
}

export function CoursesTab({ courses }: CoursesTabProps) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[26px] font-black">کورس‌ها</h2>
        <p className="text-ink-2 text-sm">آموزش‌های ویدیویی تخصصی قبیله ققنوس</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 min-[1500px]:grid-cols-3">
        {courses.map((course) => {
          const done = course.episodes.filter((p) => p.status === 'done').length;
          const pct = Math.round((done / course.episodes.length) * 100);
          return (
            <button
              key={course.id}
              type="button"
              onClick={() => router.push(`/dashboard/session/${course.id}/${course.episodes[0]?.id}`)}
              className={cn(
                'flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[18px] border text-start transition-[transform,border-color] duration-300 [background:var(--glass)] hover:-translate-y-1',
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
                      <div className="size-3.5 rounded-full [background:var(--fire-grad)]" />
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
  return toPersianDigits(formatDuration(totalSeconds));
}
