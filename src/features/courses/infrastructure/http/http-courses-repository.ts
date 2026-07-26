// http-courses-repository.ts
import {
  getCourses,
  reportSectionWatchProgress,
  updateSectionProgress,
} from '@/core/api/courses.api';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type { Course, CoursePart } from '../../domain/courses.data';
import { withCourseSectionNavigation } from '../../domain/courses.data';
import type {
  ActionRewardResult,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '@/features/dashboard/domain/dashboard.types';

type CoursePartDto = CoursePart & {
  previousId?: string | null;
  prevSectionId?: string | null;
  nextId?: string | null;
};

type CourseDto = Omit<Course, 'imageUrl' | 'episodes'> & {
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  coverUrl?: string | null;
  image?: string | null;
  episodes: CoursePartDto[];
};

export class HttpCoursesRepository implements ICoursesRepository {
  async getCourses(): Promise<Course[]> {
    const res = await getCourses();
    const courses = (res.data.data ?? res.data) as CourseDto[];
    return courses.map((course) =>
      withCourseSectionNavigation({
        ...course,
        imageUrl: course.imageUrl ?? course.thumbnailUrl ?? course.coverUrl ?? course.image ?? null,
        episodes: course.episodes.map((part) => ({
          ...part,
          previousSectionId:
            part.previousSectionId ?? part.prevSectionId ?? part.previousId ?? null,
          nextSectionId: part.nextSectionId ?? part.nextId ?? null,
        })),
      }),
    );
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
