// http-courses-repository.ts
import {
  getCourses,
  purchaseCourse,
  reportSectionWatchProgress,
  updateSectionProgress,
} from '@/core/api/courses.api';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type { Course } from '../../domain/courses.data';
import { withCourseSectionNavigation } from '../../domain/courses.data';
import { normalizeCoursePartDto, type CoursePartMediaDto } from '../normalize-course-part-dto';
import type {
  ActionRewardResult,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '@/features/dashboard/domain/dashboard.types';

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
  } | null;
  episodes: CoursePartDto[];
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
};

export class HttpCoursesRepository implements ICoursesRepository {
  async getCourses(filters?: { limit?: number; offset?: number; q?: string }): Promise<Course[]> {
    const res = await getCourses(filters);
    const courses = (res.data.data ?? res.data) as CourseDto[];
    return courses.map((course) =>
      withCourseSectionNavigation({
        ...course,
        imageUrl: course.imageUrl ?? course.thumbnailUrl ?? course.coverUrl ?? course.image ?? null,
        priceInFire: resolveCoursePrice(course),
        isUnlocked: resolveCourseAccess(course),
        isPurchased: resolveCourseAccess(course),
        isFree: course.isFree ?? resolveCoursePrice(course) <= 0,
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

  async purchaseCourse(courseId: string) {
    const res = await purchaseCourse(courseId);
    const data = (res.data.data ?? res.data) as PurchaseCourseDto;
    const course = data.course;

    return {
      courseId: data.courseId ?? course?.id ?? courseId,
      course: course
        ? withCourseSectionNavigation({
            ...course,
            imageUrl: course.imageUrl ?? course.thumbnailUrl ?? course.coverUrl ?? course.image ?? null,
            priceInFire: resolveCoursePrice(course),
            isUnlocked: true,
            isPurchased: true,
            isFree: course.isFree ?? resolveCoursePrice(course) <= 0,
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
    };
  }

  async updateSectionProgress(
    sectionId: string,
    body: { status: string; progress?: number },
  ): Promise<ActionRewardResult> {
    const res = await updateSectionProgress(sectionId, body);
    return (res.data.data ?? res.data ?? {}) as ActionRewardResult;
  }

  async reportSectionWatchProgress(
    sectionId: string,
    body: SectionWatchProgressInput,
  ): Promise<SectionWatchProgressResult> {
    const res = await reportSectionWatchProgress(sectionId, body);
    return (res.data.data ?? res.data) as SectionWatchProgressResult;
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
