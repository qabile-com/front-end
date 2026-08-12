// src/features/dashboard/presentation/sections/courses-tab.tsx
'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BaseModal,
  Button,
  ErrorState,
  Icon,
  InlineSpinner,
  MotionItem,
  MotionList,
  MotionPress,
  OptionalImage,
} from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { Course } from '../../domain/courses.data';
import { formatDuration } from '@/core/lib/format-duration';
import { usePurchaseCourse } from '../../application/use-courses';
import { coursesRepo } from '../../infrastructure/repository-factory';
import { useActionRewardQueue } from '@/features/dashboard/application/use-action-reward-queue';
import { ActionRewardModals } from '@/features/dashboard/presentation/components/action-reward-modals';

type AccessFilter = 'all' | 'continue' | 'owned' | 'free' | 'locked';

interface CoursesTabProps {
  courses: Course[];
  fireBalance: number;
  search: string;
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
}

const ACCESS_FILTERS: Array<{
  id: AccessFilter;
  label: string;
  icon: 'book' | 'play' | 'check' | 'flame' | 'lock';
}> = [
  { id: 'all', label: 'همه', icon: 'book' },
  { id: 'owned', label: 'خریداری‌شده', icon: 'check' },
  { id: 'locked', label: 'قفل‌شده', icon: 'lock' },
  { id: 'continue', label: 'ادامه آموزش', icon: 'play' },
  // { id: 'free', label: 'رایگان', icon: 'flame' },
];

export function CoursesTab({
  courses,
  fireBalance,
  search,
  isSearching = false,
  onSearchChange,
}: CoursesTabProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const purchaseCourse = usePurchaseCourse(coursesRepo);
  const { currentReward, enqueueReward, dismissCurrentReward } = useActionRewardQueue();

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category).filter(Boolean))),
    [courses],
  );

  const visibleCourses = useMemo(() => {
    return courses.filter((course) => {
      const access = getCourseAccess(course);
      const progress = getCourseProgress(course);
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      const matchesAccess =
        accessFilter === 'all' ||
        (accessFilter === 'continue' && access.canAccess && progress > 0 && progress < 100) ||
        (accessFilter === 'owned' && access.canAccess && !access.isFree) ||
        (accessFilter === 'free' && access.isFree) ||
        (accessFilter === 'locked' && !access.canAccess);

      return matchesCategory && matchesAccess;
    });
  }, [accessFilter, categoryFilter, courses]);

  const featuredCourse = useMemo(() => {
    return (
      visibleCourses.find((course) => {
        const access = getCourseAccess(course);
        const progress = getCourseProgress(course);
        return access.canAccess && progress > 0 && progress < 100;
      }) ??
      visibleCourses.find((course) => getCourseAccess(course).canAccess) ??
      visibleCourses[0] ??
      null
    );
  }, [visibleCourses]);

  const stats = useMemo(() => getCourseStats(courses), [courses]);

  const openCourse = (course: Course) => {
    const firstSectionId =
      course.episodes.find((part) => part.status === 'partial')?.id ??
      course.episodes.find((part) => part.status === 'none')?.id ??
      course.episodes[0]?.id;
    if (!firstSectionId) return;
    router.push(`/courses/${course.id}/sections/${firstSectionId}`);
  };

  const handlePurchase = async () => {
    if (!selectedCourse) return;
    try {
      const result = await purchaseCourse.mutateAsync(selectedCourse.id);
      enqueueReward(result.reward);
      const firstSectionId = result.course?.episodes[0]?.id ?? selectedCourse.episodes[0]?.id;
      setSelectedCourse(null);
      showSuccess('کورس با موفقیت باز شد.');
      if (firstSectionId) {
        router.push(`/courses/${result.courseId}/sections/${firstSectionId}`);
      }
    } catch (error) {
      showError(error instanceof Error ? error.message : 'خرید دوره انجام نشد.');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* <CoursesHero
        coursesCount={courses.length}
        ownedCount={stats.owned}
        lockedCount={stats.locked}
        totalFire={stats.totalFire}
        fireBalance={fireBalance}
      /> */}

        <section className="border-hair overflow-hidden rounded-[26px] border [background:linear-gradient(135deg,rgba(255,98,0,.09),rgba(20,9,4,.84))]">
          <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
            <label className="relative block min-w-0">
              <span className="sr-only">جستجوی کورس</span>
              <Icon
                name="search"
                size={19}
                className="text-ember absolute top-1/2 right-4 -translate-y-1/2"
              />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="جستجوی کورس، موضوع یا مهارت..."
                className="border-hair focus:border-ember placeholder:text-ink-4 h-13 w-full rounded-[18px] border bg-black/28 pr-12 pl-12 text-base font-bold transition-colors outline-none"
              />
              {isSearching && (
                <InlineSpinner className="text-ember absolute top-1/2 left-4 size-4 -translate-y-1/2" />
              )}
            </label>

            <div className="flex min-w-0 [scrollbar-width:none] gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
              {ACCESS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setAccessFilter(filter.id)}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl border px-3.5 text-[12.5px] font-black transition-[transform,border-color,background,color] duration-300 active:scale-95',
                    accessFilter === filter.id
                      ? 'border-transparent text-[#1a0a00] [background:var(--fire-grad)]'
                      : 'border-hair text-ink-2 hover:text-gold bg-black/20 hover:border-[rgba(255,98,0,.38)]',
                  )}
                >
                  <Icon name={filter.icon} size={15} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="border-hair flex [scrollbar-width:none] gap-2 overflow-x-auto border-t px-4 py-3 sm:px-5 [&::-webkit-scrollbar]:hidden">
              <CategoryChip
                active={categoryFilter === 'all'}
                onClick={() => setCategoryFilter('all')}
              >
                همه دسته‌ها
              </CategoryChip>
              {categories.map((category) => (
                <CategoryChip
                  key={category}
                  active={categoryFilter === category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </CategoryChip>
              ))}
            </div>
          )}
        </section>

        {featuredCourse && (
          <FeaturedCourse
            course={featuredCourse}
            fireBalance={fireBalance}
            onOpen={() => openCourse(featuredCourse)}
            onBuy={() => setSelectedCourse(featuredCourse)}
          />
        )}

        {visibleCourses.length === 0 ? (
          <ErrorState
            title="کورسی پیدا نشد"
            message="جستجو یا فیلترها را تغییر بده تا کورس‌های بیشتری ببینی."
            icon="search"
            action={{
              label: 'پاک کردن فیلترها',
              onClick: () => {
                onSearchChange('');
                setAccessFilter('all');
                setCategoryFilter('all');
              },
              icon: 'x',
            }}
          />
        ) : (
          <MotionList className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {visibleCourses.map((course) => (
              <MotionItem key={course.id}>
                <CourseCard
                  course={course}
                  fireBalance={fireBalance}
                  onOpen={() => openCourse(course)}
                  onBuy={() => setSelectedCourse(course)}
                />
              </MotionItem>
            ))}
          </MotionList>
        )}

        <PurchaseCourseModal
          course={selectedCourse}
          fireBalance={fireBalance}
          isPurchasing={purchaseCourse.isPending}
          onClose={() => setSelectedCourse(null)}
          onConfirm={() => void handlePurchase()}
        />
      </div>
      <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
    </>
  );
}

function CoursesHero({
  coursesCount,
  ownedCount,
  lockedCount,
  totalFire,
  fireBalance,
}: {
  coursesCount: number;
  ownedCount: number;
  lockedCount: number;
  totalFire: number;
  fireBalance: number;
}) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[rgba(255,98,0,.24)] bg-[radial-gradient(circle_at_15%_10%,rgba(255,98,0,.20),transparent_34%),radial-gradient(circle_at_85%_35%,rgba(243,186,99,.12),transparent_34%),rgba(17,8,4,.88)] p-5 shadow-[0_34px_100px_-64px_var(--glow)] sm:p-6 lg:p-7">
      <div className="bg-ember/10 pointer-events-none absolute -top-28 -left-20 size-64 rounded-full blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <span className="text-ember mb-3 inline-flex min-h-8 items-center gap-2 rounded-full border border-[rgba(255,98,0,.28)] bg-black/24 px-3 text-xs font-black">
            <Icon name="book-f" size={15} />
            تالار دانش
          </span>
          <h2 className="max-w-2xl text-2xl leading-10 font-black text-white sm:text-3xl">
            کورس بعدی‌ات را انتخاب کن و آتش بیشتری به مسیرت اضافه کن
          </h2>
          <p className="text-ink-3 mt-3 max-w-2xl text-sm leading-7">
            کورس‌های آزاد، خریدنی و در حال پیشرفت اینجا کنار هم هستند؛ سریع جستجو کن، فیلتر کن و
            ادامه مسیر را باز کن.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[520px]">
          <HeroStat icon="book" label="کورس" value={coursesCount} />
          <HeroStat icon="check" label="فعال" value={ownedCount} />
          <HeroStat icon="lock" label="قفل" value={lockedCount} />
          <HeroStat icon="flame" label="آتش شما" value={fireBalance || totalFire} fire />
        </div>
      </div>
    </section>
  );
}

function HeroStat({
  icon,
  label,
  value,
  fire = false,
}: {
  icon: 'book' | 'check' | 'lock' | 'flame';
  label: string;
  value: number;
  fire?: boolean;
}) {
  return (
    <div className="border-hair min-w-0 rounded-[18px] border bg-black/24 p-3">
      <span className="text-ink-3 mb-3 flex items-center justify-between gap-2 text-[11px] font-black">
        {label}
        <Icon name={icon} size={15} className={fire ? 'text-ember' : 'text-gold'} />
      </span>
      <b className="text-gold block truncate text-lg font-black">{formatPersianNumber(value)}</b>
    </div>
  );
}

function FeaturedCourse({
  course,
  fireBalance,
  onOpen,
  onBuy,
}: {
  course: Course;
  fireBalance: number;
  onOpen: () => void;
  onBuy: () => void;
}) {
  const access = getCourseAccess(course);
  const progress = getCourseProgress(course);
  const price = course.priceInFire ?? 0;
  const nextEpisode = getNextEpisodeTitle(course);
  const actionLabel = getCourseActionLabel(access.canAccess, progress);
  const totalEpisodes = course.totalEpisodes ?? course.episodes.length;
  const completedEpisodes =
    course.completedEpisodes ?? course.episodes.filter((part) => part.status === 'done').length;

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[rgba(255,98,0,.20)] p-3 shadow-[0_28px_90px_-62px_var(--glow)] [background:linear-gradient(145deg,rgba(22,10,4,.96),rgba(7,4,2,.96))] sm:p-4">
      <span className="pointer-events-none absolute inset-x-8 top-0 h-px [background:linear-gradient(90deg,transparent,rgba(255,98,0,.6),transparent)]" />
      <div className="grid gap-4 lg:grid-cols-[minmax(250px,360px)_minmax(0,1fr)] xl:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]">
        <button
          type="button"
          onClick={onOpen}
          className="group relative grid h-[clamp(190px,48vw,300px)] place-items-center overflow-hidden rounded-[24px] border border-[rgba(255,98,0,.18)] p-3 text-start shadow-[inset_0_0_0_1px_rgba(255,255,255,.03)] [background:linear-gradient(135deg,rgba(255,98,0,.10),rgba(0,0,0,.42))] sm:p-4 lg:h-full lg:min-h-[270px]"
          style={{ background: course.imageUrl ? undefined : getCourseFallbackGradient(course.id) }}
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,98,0,.18),transparent_48%)]" />
          {course.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- optional course artwork from backend/CDN
            <img
              src={course.imageUrl}
              alt={course.title}
              className="relative z-[1] max-h-full max-w-full object-contain transition-[filter,transform] duration-500 select-none group-hover:scale-[1.015] group-hover:brightness-110"
              loading="lazy"
              draggable={false}
            />
          ) : (
            <Icon name={access.canAccess ? 'play' : 'lock'} size={42} className="relative z-[1]" />
          )}
          <span className="absolute right-4 bottom-4 z-[2] grid size-12 place-items-center rounded-2xl border border-black/20 text-[#1a0a00] shadow-[0_16px_44px_-20px_var(--glow)] [background:var(--fire-grad)]">
            <Icon name={access.canAccess ? 'play' : 'lock'} size={22} />
          </span>
        </button>

        <div className="flex min-w-0 flex-col justify-between rounded-[24px] border border-[rgba(253,238,226,.08)] p-4 [background:rgba(0,0,0,.20)] sm:p-5 lg:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-ember rounded-full border border-[rgba(255,98,0,.24)] bg-black/20 px-3 py-1 text-xs font-black">
                پیشنهاد مسیر
              </span>
              <span className="text-gold rounded-full border border-[rgba(243,186,99,.18)] bg-black/20 px-3 py-1 text-xs font-black">
                {course.category}
              </span>
            </div>

            <h3 className="mt-4 text-[clamp(1.35rem,2vw,2rem)] leading-[1.45] font-black text-white">
              {course.title}
            </h3>
            <p className="text-ink-3 mt-3 max-w-[68ch] text-sm leading-7">
              {access.canAccess
                ? `جلسه بعدی: ${nextEpisode}`
                : 'می‌توانی سرفصل‌ها را ببینی؛ برای دسترسی به آموزش باید دوره را با آتش باز کنی.'}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 xl:grid-cols-4">
              <CourseMiniStat
                icon="clock"
                label="زمان"
                value={formatDurationFa(course.durationSeconds ?? course.duration)}
              />
              <CourseMiniStat
                icon="episodes"
                label="جلسه"
                value={toPersianDigits(course.episodes.length)}
              />
              <CourseMiniStat icon="eye" label="بازدید" value={toPersianDigits(course.views)} />
              <CourseMiniStat
                icon="flame"
                label="آتش"
                value={`+${formatPersianNumber(course.xp)}`}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            {access.canAccess && (
              <div className="min-w-0">
                <div className="mb-2 flex items-baseline justify-between gap-3 text-xs font-black">
                  <span className="text-ink-3 min-w-0 truncate">
                    پیشرفت دوره
                    {totalEpisodes > 0 && (
                      <span className="text-ink-4 font-bold">
                        {' · '}
                        {toPersianDigits(completedEpisodes)} از {toPersianDigits(totalEpisodes)}{' '}
                        جلسه
                      </span>
                    )}
                  </span>
                  <span className="text-gold shrink-0 tabular-nums">
                    {toPersianDigits(progress)}٪
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 [background:var(--fire-grad)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row xl:shrink-0">
              <Button type="button" className="min-w-0 flex-1" onClick={onOpen}>
                <span className="truncate">{actionLabel}</span>
                <Icon name="arrow-left" size={18} className="shrink-0" />
              </Button>
              {!access.canAccess && (
                <Button
                  type="button"
                  variant="ghost"
                  className="border-gold/25 text-gold min-w-0 flex-1"
                  disabled={fireBalance < price}
                  onClick={onBuy}
                >
                  <span className="truncate">خرید با {formatPersianNumber(price)} آتش</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseCard({
  course,
  fireBalance,
  onOpen,
  onBuy,
}: {
  course: Course;
  fireBalance: number;
  onOpen: () => void;
  onBuy: () => void;
}) {
  const access = getCourseAccess(course);
  const progress = getCourseProgress(course);
  const price = course.priceInFire ?? 0;
  const canBuy = fireBalance >= price;
  const actionLabel = getCourseActionLabel(access.canAccess, progress);

  return (
    <MotionPress>
      <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[rgba(255,98,0,.16)] transition-[border-color,box-shadow,transform] duration-300 [background:linear-gradient(180deg,rgba(22,10,5,.88),rgba(9,5,3,.94))] hover:-translate-y-1 hover:border-[rgba(255,98,0,.48)] hover:shadow-[0_24px_70px_-48px_var(--glow)]">
        <button
          type="button"
          onClick={onOpen}
          className="relative aspect-[16/10] w-full overflow-hidden text-start min-[430px]:aspect-[16/9] min-[1320px]:aspect-[16/9] lg:aspect-[16/10]"
          style={{ background: getCourseFallbackGradient(course.id) }}
        >
          {course.imageUrl && (
            <OptionalImage
              src={course.imageUrl}
              alt={course.title}
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          )}
          <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.72))]" />
          <span className="absolute top-3 right-3 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-black text-white backdrop-blur-md">
            {course.category}
          </span>
          <span
            className={cn(
              'absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black backdrop-blur-md',
              access.canAccess
                ? 'border-[#2bd4a8]/25 bg-[#2bd4a8]/10 text-[#2bd4a8]'
                : 'text-gold border-[rgba(255,98,0,.28)] bg-black/45',
            )}
          >
            <Icon name={access.canAccess ? 'check' : 'lock'} size={13} />
            {access.canAccess ? 'باز' : 'نیاز به خرید'}
          </span>
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-xs font-black text-white backdrop-blur-md">
            <Icon name="clock" size={14} />
            {formatDurationFa(course.durationSeconds ?? course.duration)}
          </span>
          <span className="absolute bottom-3 left-3 grid size-11 place-items-center rounded-2xl text-[#1a0a00] [background:var(--fire-grad)]">
            <Icon name={access.canAccess ? 'play' : 'lock'} size={18} />
          </span>
        </button>

        <div className="flex flex-1 flex-col p-4">
          <button type="button" onClick={onOpen} className="text-start">
            <h3 className="group-hover:text-gold line-clamp-2 text-base leading-7 font-black text-white transition-colors">
              {course.title}
            </h3>
          </button>

          <div className="mt-3 flex flex-wrap gap-2">
            <CourseCardBadge
              icon="episodes"
              value={`${toPersianDigits(course.episodes.length)} جلسه`}
            />
            <CourseCardBadge icon="eye" value={toPersianDigits(course.views)} />
            <CourseCardBadge tone="reward">
              <span>پاداش:</span>
              <Icon name="flame" size={16} className="text-ember" />
              <span>+{formatPersianNumber(course.xp)}</span>
            </CourseCardBadge>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-black">
              <span className="text-ink-3">پیشرفت</span>
              <span className="text-gold">{toPersianDigits(progress)}٪</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
              <div
                className="h-full rounded-full [background:var(--fire-grad)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button type="button" size="sm" className="flex-1" onClick={onOpen}>
              {actionLabel}
            </Button>
            {!access.canAccess && (
              <button
                type="button"
                disabled={!canBuy}
                onClick={onBuy}
                className="text-gold inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[rgba(255,98,0,.32)] bg-[rgba(255,98,0,.08)] px-3 text-xs font-black transition-colors hover:border-[rgba(243,186,99,.38)] disabled:opacity-45"
                title={`قیمت دوره: ${formatPersianNumber(price)} آتش`}
              >
                <Icon name="lock" size={16} />
                <span> قیمت:</span>
                <Icon name="flame" size={16} className="text-ember" />
                {formatPersianNumber(price)}
              </button>
            )}
          </div>
        </div>
      </article>
    </MotionPress>
  );
}

function CourseCardBadge({
  icon,
  value,
  tone = 'muted',
  children,
}: {
  icon?: 'episodes' | 'eye' | 'flame';
  value?: string;
  tone?: 'muted' | 'reward';
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-h-9 min-w-0 items-center gap-1.75 rounded-xl border px-3 text-[11.5px] font-black whitespace-nowrap',
        tone === 'reward'
          ? 'text-gold border-[rgba(243,186,99,.20)] bg-[rgba(243,186,99,.08)]'
          : 'border-hair text-ink-3 bg-black/24',
      )}
    >
      {children ?? (
        <>
          {icon && (
            <Icon
              name={icon}
              size={16}
              className={tone === 'reward' ? 'text-ember' : 'text-gold'}
            />
          )}
          {value}
        </>
      )}
    </span>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-9 shrink-0 rounded-full border px-3.5 text-xs font-black transition-[background,border-color,color,transform] duration-300 active:scale-95',
        active
          ? 'text-gold border-[rgba(243,186,99,.45)] bg-[rgba(243,186,99,.14)]'
          : 'border-hair text-ink-3 hover:text-ink-2 bg-black/20 hover:border-[rgba(243,186,99,.24)]',
      )}
    >
      {children}
    </button>
  );
}

function CourseMiniStat({
  icon,
  label,
  value,
}: {
  icon: 'clock' | 'episodes' | 'eye' | 'flame';
  label: string;
  value: string;
}) {
  return (
    <div className="border-hair flex min-h-11 min-w-0 items-center justify-between gap-2 rounded-2xl border bg-black/24 px-3 py-2">
      <span className="text-ink-4 inline-flex min-w-0 items-center gap-1.5 text-[11px] font-black">
        <Icon
          name={icon}
          size={14}
          className={cn('shrink-0', icon === 'flame' ? 'text-ember' : 'text-gold')}
        />
        <span className="truncate">{label}</span>
      </span>
      <b className="text-ink shrink-0 text-xs font-black whitespace-nowrap sm:text-[13px]">
        {value}
      </b>
    </div>
  );
}

export function PurchaseCourseModal({
  course,
  fireBalance,
  isPurchasing,
  onClose,
  onConfirm,
}: {
  course: Course | null;
  fireBalance: number;
  isPurchasing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const price = course?.priceInFire ?? 0;
  const hasEnoughFire = fireBalance >= price;

  return (
    <BaseModal
      isOpen={Boolean(course)}
      onClose={onClose}
      title="خرید دوره"
      panelClassName="w-full max-w-[440px] overflow-hidden rounded-[26px] border border-[rgba(255,98,0,.24)] [background:radial-gradient(circle_at_50%_0%,rgba(255,98,0,.16),transparent_38%),var(--color-bg-2)] shadow-[0_24px_90px_-38px_var(--glow)]"
    >
      {course && (
        <div className="p-5 sm:p-6">
          <div
            className="relative mb-5 aspect-video overflow-hidden rounded-[20px]"
            style={{ background: getCourseFallbackGradient(course.id) }}
          >
            {course.imageUrl && (
              <OptionalImage src={course.imageUrl} alt={course.title} className="object-cover" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-4 bottom-4">
              <span className="text-gold text-xs font-extrabold">{course.category}</span>
              <h3 className="mt-1 text-xl font-black text-white">{course.title}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FireBox label="قیمت دوره" value={price} />
            <FireBox label="آتش شما" value={fireBalance} muted={!hasEnoughFire} />
          </div>

          <p className="text-ink-2 mt-4 text-sm leading-7">
            با خرید این دوره، دسترسی همه جلسه‌های آن برای حساب تو فعال می‌شود و آتش از موجودی‌ات کم
            می‌شود.
          </p>

          {!hasEnoughFire && (
            <div className="mt-4 rounded-2xl border border-red-500/25 px-4 py-3 text-sm font-bold text-red-300 [background:rgba(239,68,68,.08)]">
              آتش کافی برای خرید این دوره نداری.
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              انصراف
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={!hasEnoughFire || isPurchasing}
              onClick={onConfirm}
            >
              {isPurchasing ? 'در حال خرید...' : 'خرید دوره'}
            </Button>
          </div>
        </div>
      )}
    </BaseModal>
  );
}

function FireBox({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-3 py-3 text-center [background:rgba(255,98,0,.08)]',
        muted ? 'border-red-500/25' : 'border-[rgba(255,98,0,.22)]',
      )}
    >
      <span className="text-ink-3 block text-xs font-bold">{label}</span>
      <b
        className={cn(
          'mt-1 inline-flex items-center justify-center gap-1.5 text-lg font-black',
          muted ? 'text-red-300' : 'text-gold',
        )}
      >
        <span className="relative size-5 shrink-0">
          <OptionalImage src="/assets/phoenix_badge.webp" alt="" className="object-contain" />
        </span>
        {formatPersianNumber(value)}
      </b>
    </div>
  );
}

function getCourseStats(courses: Course[]) {
  return courses.reduce(
    (stats, course) => {
      const access = getCourseAccess(course);
      return {
        owned: stats.owned + (access.canAccess ? 1 : 0),
        locked: stats.locked + (access.canAccess ? 0 : 1),
        totalFire: stats.totalFire + (course.xp ?? 0),
      };
    },
    { owned: 0, locked: 0, totalFire: 0 },
  );
}

function getCourseAccess(course: Course) {
  const price = course.priceInFire ?? 0;
  const isFree = Boolean(course.isFree || price <= 0);
  const canAccess = Boolean(isFree || course.isPurchased || course.isUnlocked);
  return { isFree, canAccess };
}

function getCourseProgress(course: Course) {
  if (course.progressPercent != null) {
    return Math.min(100, Math.max(0, Math.round(course.progressPercent)));
  }

  if (!course.episodes.length) return 0;
  const total = course.episodes.reduce((sum, part) => {
    if (part.status === 'done') return sum + 100;
    return sum + (part.progress ?? 0);
  }, 0);
  return Math.min(100, Math.round(total / course.episodes.length));
}

function getCourseActionLabel(canAccess: boolean, progress: number) {
  if (!canAccess) return 'مشاهده دوره';
  if (progress >= 100) return 'مرور دوره';
  if (progress > 0) return 'ادامه دوره';
  return 'شروع دوره';
}

function getNextEpisodeTitle(course: Course) {
  return (
    course.episodes.find((part) => part.status === 'partial')?.title ??
    course.episodes.find((part) => part.status === 'none')?.title ??
    course.episodes[0]?.title ??
    'شروع مسیر'
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
  if (typeof totalSeconds === 'string' && totalSeconds.includes(':')) {
    return toPersianDigits(totalSeconds);
  }

  return toPersianDigits(formatDuration(totalSeconds));
}
