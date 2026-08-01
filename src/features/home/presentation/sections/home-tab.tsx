'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { Icon, MotionItem, MotionList, Panel } from '@/shared/ui';
import { ComingSoonModal } from '../components/coming-soon-modal';
import type { IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import type {
  CurrentUser,
  RoadmapItem,
  RoadmapStatus,
} from '@/features/dashboard/domain/dashboard.types';
import type { Course } from '@/features/courses/domain/courses.data';
import { PhoenixIcon } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import type { ActiveRoadmap } from '@/features/roadmap/domain/roadmap.types';
import {
  getRoadmapProgressPercent,
  mergeStaticRoadmapWithProgress,
} from '@/features/roadmap/application/roadmap-progress';

const HERO_SLIDES = [
  {
    id: 'adam',
    title: 'چت با آدم',
    eyebrow: 'هوش مصنوعی آدم',
    href: '/ai',
    imageSrc: '/assets/hero/adam-ai.webp',
  },
  {
    id: 'fire',
    title: 'تالار دانش',
    eyebrow: 'تالار دانش',
    href: '/courses',
    imageSrc: '/assets/hero/fire.webp',
    imageClassName: 'scale-[1.085] group-hover:scale-[1.115]',
  },
  {
    id: 'grow',
    title: 'مسیر رشد',
    eyebrow: 'نقشه راه',
    href: '/home',
    imageSrc: '/assets/hero/grow.webp',
  },
  {
    id: 'leaderboard',
    title: 'پرچم‌داران',
    eyebrow: 'لیدربورد',
    href: undefined,
    imageSrc: '/assets/hero/leaderboard.webp',
  },
] as const;

const QUICK_ACTIONS = [
  { label: 'نوشتن پیام', icon: 'quick-write', href: '/social' },
  { label: 'آخرین دوره ها', icon: 'quick-courses', href: '/courses' },
  { label: 'دعوت دوستان', icon: 'quick-invite', href: '#', invite: true as const },
] as const;

const COURSE_FALLBACKS = [
  'linear-gradient(135deg, rgba(255,98,0,.92), rgba(61,18,3,.95))',
  'linear-gradient(135deg, rgba(243,186,99,.88), rgba(55,22,3,.95))',
  'linear-gradient(135deg, rgba(255,126,36,.88), rgba(12,8,6,.96))',
];

const ROADMAP_STEP_TYPE_LABEL: Record<string, string> = {
  exercise: 'تمرین',
  lesson: 'درس',
};

interface HomeTabProps {
  user: CurrentUser;
  courses: Course[];
  activeRoadmap: ActiveRoadmap | null;
}

export function HomeTab({ user, courses, activeRoadmap }: HomeTabProps) {
  const recentCourses = useMemo(() => courses.slice(0, 3), [courses]);
  const roadmap = useMemo(() => mergeStaticRoadmapWithProgress(activeRoadmap), [activeRoadmap]);

  return (
    <div className="flex w-full max-w-full flex-col gap-5 overflow-x-clip">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,668px)_minmax(360px,400px)] xl:items-start xl:justify-center">
        <section className="min-w-0 space-y-5">
          <HeroCarousel user={user} />
          <QuickActions />
          <div className="hidden lg:block">
            <RecentCourses courses={recentCourses} />
          </div>
        </section>
        <RoadmapPanel roadmap={roadmap} activeRoadmap={activeRoadmap} />
      </div>
    </div>
  );
}

function HeroCarousel({ user }: { user: CurrentUser }) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselResetKey, setCarouselResetKey] = useState(0);
  const [dragX, setDragX] = useState(0);
  const active = HERO_SLIDES[activeIndex]!;
  const heroFrameClass =
    'group border-hair focus-visible:ring-ember relative block h-[140px] overflow-hidden rounded-[20px] border bg-black shadow-[0_24px_80px_-46px_var(--glow)] outline-none focus-visible:ring-2 sm:h-[210px] sm:rounded-[24px] lg:h-[262px]';

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HERO_SLIDES.length);
      setDragX(0);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [carouselResetKey, reduceMotion]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number }; velocity: { x: number } }) => {
      const swipeThreshold = 60;
      const velocityThreshold = 300;
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (offset < -swipeThreshold || velocity < -velocityThreshold) {
        setActiveIndex((index) => (index + 1) % HERO_SLIDES.length);
      } else if (offset > swipeThreshold || velocity > velocityThreshold) {
        setActiveIndex((index) => (index - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
      }
      setDragX(0);
      setCarouselResetKey((key) => key + 1);
    },
    [],
  );

  const heroImage = (
    <AnimatePresence mode="wait">
      <motion.div
        key={active.id}
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
        transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
      >
        <img
          src={active.imageSrc}
          alt=""
          className={cn(
            'size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]',
            'imageClassName' in active ? active.imageClassName : undefined,
          )}
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
          draggable={false}
        />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <section className="min-w-0">
      {active.href ? (
        <Link
          href={active.href}
          className={heroFrameClass}
          aria-label={`${active.eyebrow}: ${active.title}`}
        >
          {heroImage}
        </Link>
      ) : (
        <div className={heroFrameClass} aria-label={`${active.eyebrow}: ${active.title}`}>
          {heroImage}
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-2" aria-label="اسلایدهای خانه">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`نمایش اسلاید ${toPersianDigits(index + 1)}`}
            onClick={() => {
              setActiveIndex(index);
              setCarouselResetKey((key) => key + 1);
            }}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300',
              index === activeIndex
                ? 'bg-ember w-8'
                : 'w-2.5 bg-[rgba(243,186,99,.35)] hover:bg-[rgba(243,186,99,.65)]',
            )}
          />
        ))}
      </div>

      <p className="sr-only">
        خوش آمدی {user.name}. این بنرها قابل کلیک هستند و هرکدام به صفحه مرتبط می‌روند.
      </p>
    </section>
  );
}

function QuickActions() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <MotionList className="grid min-w-0 grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action, index) => {
          const isInvite = (action as any).invite === true;
          return (
            <MotionItem key={action.label}>
              <Link
                href={isInvite ? '#' : action.href}
                onClick={(event) => {
                  if (isInvite) {
                    event.preventDefault();
                    setInviteOpen(true);
                  }
                }}
                className={cn(
                  'border-hair group focus-visible:ring-ember flex min-h-24 min-w-0 flex-col items-center justify-center gap-3 rounded-[18px] border px-2 text-center transition-[transform,border-color,box-shadow] duration-300 [background:var(--glass)] hover:-translate-y-1 hover:border-[rgba(255,98,0,.65)] hover:shadow-[0_18px_55px_-36px_var(--glow)] focus-visible:ring-2 focus-visible:outline-none',
                  index === 0 && 'border-r-3 border-r-[rgba(255,98,0,.85)]',
                  index === QUICK_ACTIONS.length - 1 &&
                    'border-l-3 border-l-[rgba(255,98,0,.85)]',
                )}
              >
                <span className="text-gold group-hover:text-ember grid size-9 place-items-center rounded-xl">
                  <Icon name={action.icon as IconName} size={32} />
                </span>
                <b className="truncate text-[13px] font-extrabold sm:text-[14px]">
                  {action.label}
                </b>
              </Link>
            </MotionItem>
          );
        })}
      </MotionList>
      <ComingSoonModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}

const RM_ICON: Record<RoadmapStatus, { name: IconName; cls: string; size: number }> = {
  done: {
    name: 'check',
    cls: 'text-white [background:linear-gradient(135deg,#1f8a5b,#29c89d)] shadow-[0_18px_40px_-22px_rgba(43,212,168,.9)]',
    size: 28,
  },
  current: {
    name: 'flame',
    cls: 'text-[#180803] [background:var(--fire-grad)] shadow-[0_0_36px_-8px_var(--glow)]',
    size: 26,
  },
  next: {
    name: 'lock',
    cls: 'text-[#8b6d5a] border border-[rgba(255,98,0,.22)] [background:rgba(82,33,14,.42)]',
    size: 22,
  },
};

const RM_CARD: Record<RoadmapStatus, string> = {
  done: 'border-[rgba(255,98,0,.20)] [background:rgba(18,9,6,.80)]',
  current:
    'border-[rgba(255,98,0,.62)] [background:radial-gradient(circle_at_70%_50%,rgba(255,98,0,.14),transparent_42%),rgba(33,12,4,.88)] shadow-[0_25px_70px_-42px_var(--glow)]',
  next: 'border-[rgba(255,98,0,.16)] [background:rgba(18,9,6,.72)] opacity-90',
};

const RM_BADGE: Record<RoadmapStatus, { label: string; cls: string }> = {
  done: {
    label: 'تکمیل شد',
    cls: 'text-[#2bd4a8] [background:rgba(43,212,168,.13)] border-[rgba(43,212,168,.36)]',
  },
  current: {
    label: 'در جریان',
    cls: 'text-ember [background:rgba(255,98,0,.14)] border-[rgba(255,98,0,.32)]',
  },
  next: {
    label: 'شروع نشده',
    cls: 'text-[#8b6d5a] [background:rgba(82,33,14,.30)] border-[rgba(255,98,0,.16)]',
  },
};

function RoadmapPanel({
  roadmap,
  activeRoadmap,
}: {
  roadmap: RoadmapItem[];
  activeRoadmap: ActiveRoadmap | null;
}) {
  const percent = getRoadmapProgressPercent(activeRoadmap);

  return (
    <Panel
      title="نقشه راه من"
      action={
        <Link href="/roadmap" className="text-gold text-[12.5px] font-extrabold">
          مشاهده همه
        </Link>
      }
      className="w-full border-0 bg-transparent [background:transparent] xl:sticky xl:top-0 xl:max-w-[400px]"
      bodyClassName="p-0"
    >
      {/* {activeRoadmap && (
        <div className="px-3 pt-3 sm:px-4">
          <div className="border-hair rounded-2xl border bg-black/25 px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-black">
              <span className="text-ink-2 truncate">{activeRoadmap.title}</span>
              <span className="text-gold shrink-0">{toPersianDigits(percent)}٪</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
              <div className="h-full rounded-full [background:var(--fire-grad)]" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>
      )} */}
      <MotionList className="relative min-w-0 p-3 sm:p-4">
        {roadmap.map((item, index) => {
          const icon = RM_ICON[item.status];
          const nextItem = roadmap[index + 1];
          const connectorIsLit = item.status === 'done' || nextItem?.status === 'current';

          return (
            <MotionItem key={item.num} className="relative pb-7 last:pb-0">
              <Link
                href={`/roadmap/steps/${item.num}`}
                className={cn(
                  'group focus-visible:ring-ember flex min-h-[94px] w-full min-w-0 items-center gap-3 overflow-hidden rounded-[18px] border px-3.5 py-3 text-start transition-[transform,border-color,box-shadow,opacity] duration-300 hover:-translate-y-0.5 hover:border-[rgba(255,98,0,.58)] focus-visible:ring-2 focus-visible:outline-none sm:rounded-[20px] sm:px-4',
                  RM_CARD[item.status],
                )}
              >
                <span
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-[15px] transition-transform duration-300 group-hover:scale-105 sm:size-12 sm:rounded-[17px]',
                    icon.cls,
                  )}
                  aria-hidden="true"
                >
                  <Icon name={icon.name} size={icon.size} />
                </span>

                <span className="flex min-w-0 flex-1 flex-col items-start justify-center leading-tight">
                  <span className="text-ink-3 mb-2 block text-[11px] font-extrabold sm:text-[12px]">
                    {ROADMAP_STEP_TYPE_LABEL[item.type] || item.type}
                  </span>
                  <b className="block max-w-full truncate text-[13px] font-black text-white sm:text-[14px]">
                    {item.title}
                  </b>
                  <span
                    className={cn(
                      'mt-2.5 inline-flex min-h-7 items-center rounded-[9px] border px-3 py-0.5 text-[11px] font-black',
                      RM_BADGE[item.status].cls,
                    )}
                  >
                    {RM_BADGE[item.status].label}
                  </span>
                </span>

                <span className="text-gold ms-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[rgba(255,98,0,.22)] bg-black/24 px-2.5 py-1 text-[12.5px] font-black sm:px-3 sm:text-[13px]">
                  <Icon name="flame" size={15} className="text-ember" />
                  {formatPersianNumber(item.xp)}
                </span>
              </Link>
              {index < roadmap.length - 1 && (
                <span
                  className={cn(
                    'absolute right-[8%] bottom-2.5 h-3 w-1.5 rounded-full transition-[background,box-shadow,opacity] duration-300',
                    connectorIsLit
                      ? 'bg-ember shadow-[0_0_18px_-3px_var(--glow)]'
                      : 'bg-[rgba(255,98,0,.20)] opacity-55',
                  )}
                  aria-hidden="true"
                />
              )}
            </MotionItem>
          );
        })}
      </MotionList>
    </Panel>
  );
}

function RecentCourses({ courses }: { courses: Course[] }) {
  const visibleCourses = courses.slice(0, 3);

  return (
    <Panel
      title="آخرین دوره‌ها"
      action={
        <Link href="/courses" className="text-gold text-[12.5px] font-extrabold">
          نمایش همه
        </Link>
      }
      bodyClassName="p-3 sm:p-4"
    >
      {visibleCourses.length === 0 ? (
        <div className="text-ink-3 rounded-2xl border border-dashed border-[rgba(255,98,0,.22)] p-6 text-center text-sm">
          هنوز دوره‌ای برای نمایش نداریم.
        </div>
      ) : (
        <MotionList className="flex min-w-0 flex-col gap-3">
          {visibleCourses.map((course, index) => (
            <MotionItem key={course.id}>
              <RecentCourseCard course={course} index={index} />
            </MotionItem>
          ))}
        </MotionList>
      )}
    </Panel>
  );
}

function RecentCourseCard({ course, index }: { course: Course; index: number }) {
  const firstPlayable =
    course.episodes.find((part) => part.status === 'partial') ??
    course.episodes.find((part) => part.status === 'none') ??
    course.episodes[0];
  const completed = course.episodes.filter((part) => part.status === 'done').length;
  const progress = course.episodes.length
    ? Math.round((completed / course.episodes.length) * 100)
    : 0;
  const href = firstPlayable
    ? `/courses/${course.id}/sections/${firstPlayable.id}?from=home`
    : '/courses';
  const fallback = COURSE_FALLBACKS[index % COURSE_FALLBACKS.length]!;

  return (
    <Link
      href={href}
      className="group focus-visible:ring-ember flex min-w-0 items-center gap-3 rounded-[18px] p-3 transition-[transform,border-color,background] duration-300 [background:rgba(14,7,4,.72)] hover:border hover:border-[rgba(255,98,0,.42)] focus-visible:ring-2 focus-visible:outline-none"
    >
      <span
        className="relative block aspect-[1.18] w-20 shrink-0 overflow-hidden rounded-[14px] sm:w-24"
        style={{ background: course.imageUrl ? undefined : fallback }}
      >
        {course.imageUrl ? (
          <img src={course.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <>
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,210,128,.34),transparent_32%)]" />
            <PhoenixIcon className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 opacity-90" />
          </>
        )}
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="text-ember mb-1 block text-[13px] font-extrabold">{course.category}</span>
        <b className="block truncate text-[14px] font-black sm:text-[15px]">{course.title}</b>
        {/* <span className="text-ink-3 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
          <span className="inline-flex items-center gap-1">
            <Icon name="book" size={14} />
            {toPersianDigits(course.episodes.length)} جلسه
          </span>
          <span className="inline-flex items-center gap-1">
            <PhoenixIcon className="size-3.5 rounded-full" />
            {formatPersianNumber(course.xp)} آتش
          </span>
        </span> */}
        <span className="mt-3 grid h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
          <span
            className="rounded-full [background:var(--fire-grad)]"
            style={{ width: `${Math.max(progress, 8)}%` }}
          />
        </span>
      </span>

      <span className="ms-auto grid size-10 shrink-0 place-items-center rounded-full text-[#ff62008c] transition-[transform,border-color] duration-300 group-hover:-translate-x-1 group-hover:border-[#ff62008c]">
        <Icon name="arrow-left" size={20} />
      </span>
    </Link>
  );
}
