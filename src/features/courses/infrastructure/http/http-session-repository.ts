import type { ISessionRepository, SessionDetail } from '../../domain/session-repository';
import { getCourseSection } from '@/core/api/courses.api';
import { normalizeCoursePartDto, type CoursePartMediaDto } from '../normalize-course-part-dto';

type SessionDetailDto = Omit<SessionDetail, 'part'> & {
  episode: CoursePartMediaDto & {
    previousId?: string | null;
    prevSectionId?: string | null;
    previousEpisodeId?: string | null;
    nextEpisodeId?: string | null;
    nextId?: string | null;
  };
};

export class HttpSessionRepository implements ISessionRepository {
  async getSessionDetail(courseId: string, sectionId: string): Promise<SessionDetail> {
    const res = await getCourseSection(courseId, sectionId);
    const data = (res.data.data ?? res.data) as SessionDetailDto;
    return {
      ...data,
      part: {
        ...normalizeCoursePartDto(data.episode),
        courseId,
        previousSectionId:
          data.episode.previousSectionId ??
          data.episode.prevSectionId ??
          data.episode.previousId ??
          data.episode.previousEpisodeId ??
          null,
        nextSectionId:
          data.episode.nextSectionId ??
          data.episode.nextId ??
          data.episode.nextEpisodeId ??
          null,
      },
    };
  }
}
