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
        ...data.part,
        courseId,
        previousSectionId:
          data.part.previousSectionId ?? data.part.prevSectionId ?? data.part.previousId ?? null,
        nextSectionId: data.part.nextSectionId ?? data.part.nextId ?? null,
      },
    };
  }
}
