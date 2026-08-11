// http-courses-repository.ts
import {
  getCourses,
  markEpisodeWatched,
  purchaseCourse,
  reportSectionWatchProgress,
  updateSectionProgress,
} from '@/core/api/courses.api';
import type {
  ICoursesRepository,
  MarkEpisodeWatchedResult,
} from '@/features/dashboard/domain/dashboard-repository';
import type { Course } from '../../domain/courses.data';
import { withCourseSectionNavigation } from '../../domain/courses.data';
import { normalizeCoursePartDto, type CoursePartMediaDto } from '../normalize-course-part-dto';
import type {
  ActionRewardResult,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '@/features/dashboard/domain/dashboard.types';
import { normalizeActionRewardResult } from '@/features/dashboard/domain/achievement-normalizer';

type CoursePartDto = CoursePartMediaDto & {
  previousId?: string | null;
  prevSectionId?: string | null;
  nextId?: string | null;
};

type CourseDto = Omit<Course, 'imageUrl' | 'episodes'> & {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  image?: string | null;
  xpPrice?: number;
  price?: number;
  priceInFire?: number;
  firePrice?: number;
  isUnlocked?: boolean;
  isPurchased?: boolean;
  purchased?: boolean;
  canAccess?: boolean;
  isFree?: boolean;
  userProgress?: {
    isUnlocked?: boolean;
    xpPrice?: number;
    progressPercent?: number;
    completedEpisodes?: number;
    totalEpisodes?: number;
  } | null;
  episodesCount?: number;
  episodes: CoursePartDto[];
};

type MarkEpisodeWatchedDto = {
  data?: MarkEpisodeWatchedDto;
  success?: boolean;
  userProgress?: {
    episode?: Record<string, unknown> | null;
    course?: {
      progressPercent?: number;
      completedEpisodes?: number;
      totalEpisodes?: number;
    } | null;
  } | null;
};

type PurchaseCourseDto = {
  course?: CourseDto;
  courseId?: string;
  xpSpent?: number;
  spentFire?: number;
  priceInFire?: number;
  remainingXp?: number;
  fireBalance?: number;
  balance?: {
    fire?: number;
    xp?: number;
  };
  isUnlocked?: boolean;
  reward?: ActionRewardResult | null;
  unlockedAchievements?: ActionRewardResult['unlockedAchievements'];
};

export class HttpCoursesRepository implements ICoursesRepository {
  async getCourses(
    filters?: { limit?: number; offset?: number; q?: string },
    options?: { signal?: AbortSignal },
  ): Promise<Course[]> {
    const res = await getCourses(filters, options);
    const courses = (res.data.data ?? res.data) as CourseDto[];
    return courses.map((course) =>
      withCourseSectionNavigation({
        ...course,
        imageUrl: course.imageUrl ?? course.thumbnailUrl ?? course.coverUrl ?? course.image ?? null,
        priceInFire: resolveCoursePrice(course),
        isUnlocked: resolveCourseAccess(course),
        isPurchased: resolveCourseAccess(course),
        isFree: course.isFree ?? resolveCoursePrice(course) <= 0,
        ...resolveCourseProgress(course),
        episodes: course.episodes.map((part) => ({
          ...normalizeCoursePartDto(part),
          previousSectionId:
            part.previousSectionId ?? part.prevSectionId ?? part.previousId ?? null,
          nextSectionId: part.nextSectionId ?? part.nextEpisodeId ?? part.nextId ?? null,
          nextEpisodeId: part.nextEpisodeId ?? part.nextSectionId ?? part.nextId ?? null,
        })),
      }),
    );
  }

  async purchaseCourse(courseId: string, options?: { signal?: AbortSignal }) {
    const res = await purchaseCourse(courseId, options);
    const data = (res.data.data ?? res.data) as PurchaseCourseDto;
    const course = data.course;

    return {
      courseId: data.courseId ?? course?.id ?? courseId,
      course: course
        ? withCourseSectionNavigation({
            ...course,
            imageUrl:
              course.imageUrl ?? course.thumbnailUrl ?? course.coverUrl ?? course.image ?? null,
            priceInFire: resolveCoursePrice(course),
            isUnlocked: true,
            isPurchased: true,
            isFree: course.isFree ?? resolveCoursePrice(course) <= 0,
            ...resolveCourseProgress(course),
            episodes: course.episodes.map((part) => ({
              ...normalizeCoursePartDto(part),
              nextSectionId: part.nextSectionId ?? part.nextEpisodeId ?? part.nextId ?? null,
              nextEpisodeId: part.nextEpisodeId ?? part.nextSectionId ?? part.nextId ?? null,
            })),
          })
        : undefined,
      balance: {
        fire: data.balance?.fire ?? data.balance?.xp ?? data.remainingXp ?? data.fireBalance ?? 0,
      },
      spentFire: data.spentFire ?? data.xpSpent ?? data.priceInFire ?? 0,
      isUnlocked: data.isUnlocked ?? true,
      reward: normalizeActionRewardResult(data),
    };
  }

  async updateSectionProgress(
    sectionId: string,
    body: { status: string; progress?: number },
    options?: { signal?: AbortSignal },
  ): Promise<ActionRewardResult> {
    const res = await updateSectionProgress(sectionId, body, options);
    const data = (res.data.data ?? res.data) as ActionRewardResult;
    return normalizeActionRewardResult(data) ?? {};
  }

  async reportSectionWatchProgress(
    sectionId: string,
    body: SectionWatchProgressInput,
    options?: { signal?: AbortSignal },
  ): Promise<SectionWatchProgressResult> {
    const res = await reportSectionWatchProgress(sectionId, body, options);
    const data = (res.data.data ?? res.data) as SectionWatchProgressResult;
    return {
      ...data,
      reward: normalizeActionRewardResult(data),
    };
  }

  async markEpisodeWatched(
    courseId: string,
    episodeId: string,
    options?: { signal?: AbortSignal },
  ): Promise<MarkEpisodeWatchedResult> {
    const res = await markEpisodeWatched(courseId, episodeId, options);
    // The reward payload (xp/streak/unlockedAchievements) sits on the envelope, while
    // userProgress is nested one level deeper.
    const payload = (res.data ?? {}) as MarkEpisodeWatchedDto;
    const data = (payload.data ?? payload) as MarkEpisodeWatchedDto;

    return {
      success: data.success ?? true,
      reward: normalizeActionRewardResult(data) ?? normalizeActionRewardResult(payload),
      courseProgress: data.userProgress?.course ?? null,
    };
  }
}

function resolveCoursePrice(course: CourseDto): number {
  return (
    course.priceInFire ??
    course.firePrice ??
    course.xpPrice ??
    course.userProgress?.xpPrice ??
    course.price ??
    0
  );
}

// The API already computes completion in `userProgress`; deriving it from the episode list
// client-side gave different answers on different screens (episode-watch average vs. count of
// finished episodes), so the server value is the single source of truth when present.
function resolveCourseProgress(course: CourseDto) {
  const progress = course.userProgress;
  const totalEpisodes =
    progress?.totalEpisodes ?? course.episodesCount ?? course.episodes?.length ?? 0;
  const completedEpisodes =
    progress?.completedEpisodes ??
    course.episodes?.filter((part) => part.status === 'done').length ??
    0;

  const percent =
    progress?.progressPercent ??
    (totalEpisodes > 0 ? Math.round((completedEpisodes / totalEpisodes) * 100) : 0);

  return {
    progressPercent: Math.min(100, Math.max(0, Math.round(percent))),
    completedEpisodes,
    totalEpisodes,
  };
}

function resolveCourseAccess(course: CourseDto): boolean {
  const price = resolveCoursePrice(course);
  return Boolean(
    course.isUnlocked ??
    course.userProgress?.isUnlocked ??
    course.isPurchased ??
    course.purchased ??
    course.canAccess ??
    course.isFree ??
    price <= 0,
  );
}
