'use client';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Icon, MotionItem, MotionList, Panel } from '@/shared/ui';
import type { IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import type {
  Achievement,
  CurrentUser,
  RoadmapItem,
  RoadmapStatus,
} from '@/features/dashboard/domain/dashboard.types';
import type { Course } from '@/features/courses/domain/courses.data';
import { PhoenixIcon } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import { StepModalContainer } from '../components/step-modal-container';
import { StreakSuccessModal } from '@/features/profile/presentation/components/streak-success-modal';
import { AchievementEarnedModal } from '@/features/profile/presentation/components/achievement-earned-modal';
import { XpEarnedModal } from '@/features/profile/presentation/components/xp-earned-modal';
import { roadmapStepRepo } from '@/features/home/infrastructure/repository-factory';
import { useCompleteRoadmapStep } from '../../application/use-complete-roadmap-step';

const HERO_SLIDES = [
  {
    id: 'adam',
    title: 'همیشه آنلاین، همیشه در کنار تو',
    eyebrow: 'هوش مصنوعی آدم',
    description: 'برای برنامه‌ریزی، تمرکز و مسیر رشدت از آدم کمک بگیر.',
    href: '/ai',
    imageSrc: '/assets/adam-ai.png',
    accent: 'from-orange-500 to-amber-300',
  },
  {
    id: 'courses',
    title: 'آتش یادگیری را روشن نگه دار',
    eyebrow: 'تالار دانش',
    description: 'آخرین دوره‌ها و جلسه‌های نیمه‌تمامت همین‌جا منتظرت هستند.',
    href: '/courses',
    imageSrc: '/assets/hero-phoenix.webp',
    accent: 'from-[#ff6200] to-[#f3ba63]',
  },
  {
    id: 'social',
    title: 'تنها پرواز نکن',
    eyebrow: 'انجمن قبیله',
    description: 'با هم‌پروازهایت حرف بزن، پست بنویس و از مسیرشان الهام بگیر.',
    href: '/social',
    imageSrc: '/assets/leaderboard-phoenix.webp',
    accent: 'from-teal-500 to-emerald-300',
  },
] as const;

const QUICK_ACTIONS = [
  { label: 'نوشتن پیام', icon: 'quick-write', href: '/social' },
  { label: 'آخرین دوره ها', icon: 'quick-courses', href: '/courses' },
  { label: 'دعوت دوستان', icon: 'quick-invite', href: '' },
] as const;

const COURSE_FALLBACKS = [
  'linear-gradient(135deg, rgba(255,98,0,.92), rgba(61,18,3,.95))',
  'linear-gradient(135deg, rgba(243,186,99,.88), rgba(55,22,3,.95))',
  'linear-gradient(135deg, rgba(255,126,36,.88), rgba(12,8,6,.96))',
];

interface HomeTabProps {
  user: CurrentUser;
  roadmap: RoadmapItem[];
  courses: Course[];
}

export function HomeTab({ user, roadmap: initialRoadmap, courses }: HomeTabProps) {
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(initialRoadmap);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);
  const [streakReward, setStreakReward] = useState<number | null>(null);
  const [earnedAchievement, setEarnedAchievement] = useState<Achievement | null>(null);
  const completeStep = useCompleteRoadmapStep(roadmapStepRepo);

  const recentCourses = useMemo(() => courses.slice(0, 3), [courses]);

  const handleCompleteStep = async (stepNum: number) => {
    const reward = await completeStep.mutateAsync(stepNum);
    setRoadmap((prev) =>
      prev.map((item) =>
        item.num === stepNum ? { ...item, status: 'done' as RoadmapStatus } : item,
      ),
    );
    setSelectedStepId(null);
    if (reward.xpGranted) setEarnedXp(reward.xpGranted);
    if (reward.streak?.increased) setStreakReward(reward.streak.current);
    if (reward.achievements?.[0]) setEarnedAchievement(reward.achievements[0]);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 overflow-x-clip">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] xl:items-start">
        <section className="min-w-0 space-y-5">
          <HeroCarousel user={user} />
          <QuickActions />
          <div className="hidden sm:block">
            <RecentCourses courses={recentCourses} />
          </div>
        </section>
        <RoadmapPanel roadmap={roadmap} onItemClick={(num) => setSelectedStepId(num)} />
      </div>

      {selectedStepId !== null && (
        <StepModalContainer
          stepId={selectedStepId}
          onClose={() => setSelectedStepId(null)}
          onComplete={() => void handleCompleteStep(selectedStepId)}
          isCompleting={completeStep.isPending}
          repository={roadmapStepRepo}
        />
      )}

      <StreakSuccessModal
        isOpen={streakReward !== null}
        streak={streakReward ?? 0}
        onClose={() => setStreakReward(null)}
      />
      <XpEarnedModal
        xp={earnedXp}
        description="آتش این قدم از نقشه راه به حساب قبیله‌ات اضافه شد."
        onClose={() => setEarnedXp(null)}
      />
      <AchievementEarnedModal
        achievement={earnedAchievement}
        onClose={() => setEarnedAchievement(null)}
      />
    </div>
  );
}

function HeroCarousel({ user }: { user: CurrentUser }) {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const active = HERO_SLIDES[activeIndex]!;

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <section className="min-w-0">
      <Link
        href={active.href}
        className="group border-hair focus-visible:ring-ember relative block aspect-[16/8.2] min-h-[210px] overflow-hidden rounded-[24px] border bg-black shadow-[0_24px_80px_-46px_var(--glow)] outline-none focus-visible:ring-2 sm:aspect-[16/6.5]"
        aria-label={`${active.eyebrow}: ${active.title}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={active.imageSrc}
              alt=""
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              loading={activeIndex === 0 ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.10),rgba(0,0,0,.55)_55%,rgba(0,0,0,.88))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,98,0,.24),transparent_30%)]" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 flex h-full max-w-[72%] flex-col justify-end p-5 sm:p-7">
          <span
            className={cn(
              'mb-3 w-fit rounded-full px-3 py-1 text-[11px] font-extrabold text-[#1a0a00] shadow-[0_10px_32px_-16px_var(--glow)] [background:linear-gradient(135deg,var(--tw-gradient-stops))]',
              active.accent,
            )}
          >
            {active.eyebrow}
          </span>
          <h2 className="max-w-[420px] text-2xl leading-tight font-black text-balance text-white sm:text-4xl">
            {active.title}
          </h2>
          <p className="text-ink-2 mt-3 hidden max-w-[420px] text-sm leading-7 sm:block">
            {active.description}
          </p>
          <span className="text-gold mt-4 inline-flex items-center gap-2 text-sm font-extrabold">
            ورود به مسیر
            <Icon name="arrow-left" size={18} />
          </span>
        </div>
      </Link>

      <div className="mt-3 flex items-center justify-center gap-2" aria-label="اسلایدهای خانه">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`نمایش اسلاید ${toPersianDigits(index + 1)}`}
            onClick={() => setActiveIndex(index)}
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
  return (
    <MotionList className="grid min-w-0 grid-cols-3 gap-3">
      {QUICK_ACTIONS.map((action, index) => (
        <MotionItem key={action.label}>
          <Link
            href={action.href}
            className={cn(
              'border-hair group focus-visible:ring-ember flex min-h-24 min-w-0 flex-col items-center justify-center gap-3 rounded-[18px] border px-2 text-center transition-[transform,border-color,box-shadow] duration-300 [background:var(--glass)] hover:-translate-y-1 hover:border-[rgba(255,98,0,.65)] hover:shadow-[0_18px_55px_-36px_var(--glow)] focus-visible:ring-2 focus-visible:outline-none',
              index === 0 && 'border-r-2 border-r-[rgba(255,98,0,.85)]',
              index === QUICK_ACTIONS.length - 1 && 'border-l-2 border-l-[rgba(255,98,0,.85)]',
            )}
          >
            <span className="text-gold group-hover:text-ember grid size-9 place-items-center rounded-xl">
              <Icon name={action.icon as IconName} size={32} />
            </span>
            <b className="truncate text-[13px] font-extrabold sm:text-[14px]">{action.label}</b>
          </Link>
        </MotionItem>
      ))}
    </MotionList>
  );
}

const RM_NUM: Record<RoadmapStatus, string> = {
  done: 'text-white [background:linear-gradient(135deg,#1f8a5b,#2bd4a8)]',
  current: 'text-[#1a0a00] [background:var(--fire-grad)] shadow-[0_0_26px_-8px_var(--glow)]',
  next: 'text-ink-3 [background:var(--glass-2)]',
};

const RM_BADGE: Record<RoadmapStatus, { label: string; cls: string }> = {
  done: {
    label: 'تکمیل شد',
    cls: 'text-[#2bd4a8] [background:rgba(43,212,168,.12)] border-[rgba(43,212,168,.22)]',
  },
  current: {
    label: 'در جریان',
    cls: 'text-ember [background:rgba(255,98,0,.14)] border-[rgba(255,98,0,.20)]',
  },
  next: { label: 'شروع نشده', cls: 'text-ink-3 [background:var(--glass-2)] border-hair' },
};

function RoadmapPanel({
  roadmap,
  onItemClick,
}: {
  roadmap: RoadmapItem[];
  onItemClick: (num: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleRoadmap = expanded ? roadmap : roadmap.slice(0, 5);

  return (
    <Panel
      title="نقشه راه من"
      action={
        roadmap.length > 5 ? (
          <button
            type="button"
            className="text-gold text-[12.5px] font-extrabold"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? 'نمایش کمتر' : 'نمایش همه'}
          </button>
        ) : (
          <span className="text-gold text-[12.5px] font-extrabold">نمایش همه</span>
        )
      }
      className="w-full xl:sticky xl:top-0 xl:max-w-[380px]"
      bodyClassName="p-0"
    >
      <MotionList className="relative min-w-0 p-4">
        {/* <span className="absolute top-6 right-[42px] bottom-6 hidden w-px bg-[linear-gradient(180deg,transparent,rgba(255,98,0,.45),transparent)] sm:block" /> */}
        {visibleRoadmap.map((item) => (
          <MotionItem key={item.num} className="relative pb-4 last:pb-0">
            <button
              type="button"
              onClick={() => onItemClick(item.num)}
              className={cn(
                'border-hair group flex w-full min-w-0 items-center gap-3 rounded-[18px] border p-4 text-start transition-[transform,border-color,box-shadow] duration-300 [background:rgba(24,10,4,.62)] hover:-translate-y-0.5 hover:border-[rgba(255,98,0,.42)]',
                item.status === 'current' &&
                  'border-[rgba(255,98,0,.5)] shadow-[0_20px_62px_-42px_var(--glow)]',
              )}
            >
              <span
                className={cn(
                  'grid size-11 shrink-0 place-items-center rounded-[13px] text-sm font-extrabold',
                  RM_NUM[item.status],
                )}
              >
                {item.status === 'done' ? (
                  <Icon name="check" size={18} />
                ) : item.status === 'current' ? (
                  <Icon name="flame" size={18} />
                ) : (
                  toPersianDigits(item.num)
                )}
              </span>

              <span className="min-w-0 flex-1 leading-tight">
                <span className="text-ink-3 mb-2 block text-[11px] font-bold">{item.type}</span>
                <b className="block truncate text-[14px] font-extrabold sm:text-[15px]">
                  {item.title}
                </b>
                <span
                  className={cn(
                    'mt-3 inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold',
                    RM_BADGE[item.status].cls,
                  )}
                >
                  {RM_BADGE[item.status].label}
                </span>
              </span>

              <span className="text-gold flex shrink-0 items-center gap-1 text-[12.5px] font-black">
                <PhoenixIcon className="size-4 rounded-full" />
                {formatPersianNumber(item.xp)}
              </span>
            </button>
          </MotionItem>
        ))}
      </MotionList>
    </Panel>
  );
}

function RecentCourses({ courses }: { courses: Course[] }) {
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
      {courses.length === 0 ? (
        <div className="text-ink-3 rounded-2xl border border-dashed border-[rgba(255,98,0,.22)] p-6 text-center text-sm">
          هنوز دوره‌ای برای نمایش نداریم.
        </div>
      ) : (
        <MotionList className="flex min-w-0 flex-col gap-3">
          {courses.map((course, index) => (
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
      className="border-hair group focus-visible:ring-ember flex min-w-0 items-center gap-3 rounded-[18px] border p-3 transition-[transform,border-color,background] duration-300 [background:rgba(14,7,4,.72)] hover:-translate-y-0.5 hover:border-[rgba(255,98,0,.42)] focus-visible:ring-2 focus-visible:outline-none"
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

      <span className="text-gold ms-auto grid size-10 shrink-0 place-items-center rounded-full border border-[rgba(243,186,99,.18)] bg-[rgba(243,186,99,.08)] transition-[transform,border-color] duration-300 group-hover:-translate-x-1 group-hover:border-[rgba(255,98,0,.55)]">
        <Icon name="arrow-left" size={18} />
      </span>
    </Link>
  );
}
