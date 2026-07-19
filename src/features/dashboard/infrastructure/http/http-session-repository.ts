import type { ISessionRepository, SessionDetail } from '../../domain/session-repository';
import { httpClient } from '@/core/api/http-client';

export class HttpSessionRepository implements ISessionRepository {
  async getSessionDetail(courseId: string, partTitle: string): Promise<SessionDetail> {
    // TODO: replace with real endpoint when available
    // const res = await httpClient.get(`/api/v1/courses/${courseId}/parts/${encodeURIComponent(partTitle)}/detail`);
    // return res.data;
    throw new Error('HTTP session detail endpoint not implemented yet');
  }
}
