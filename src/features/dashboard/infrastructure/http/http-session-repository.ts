import type { ISessionRepository, SessionDetail } from '../../domain/session-repository';
import { getCourseSection } from '@/core/api/courses.api';

type SessionDetailDto = Omit<SessionDetail, 'part'> & {
  part: SessionDetail['part'] & {
    previousId?: string | null;
    prevSectionId?: string | null;
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
        ...data.episode,
        courseId,
        previousSectionId:
          data.episode.previousSectionId ??
          data.episode.prevSectionId ??
          data.episode.previousId ??
          null,
        nextSectionId: data.episode.nextSectionId ?? data.episode.nextId ?? null,
      },
    };
  }
}
