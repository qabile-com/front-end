import type { ISessionRepository, SessionDetail } from '../../domain/session-repository';
import { COURSES } from '../../domain/courses.data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockSessionRepository implements ISessionRepository {
  async getSessionDetail(courseId: string, partTitle: string): Promise<SessionDetail> {
    await delay(400);
    const course = COURSES.find((c) => c.id === courseId);
    const part = course?.parts.find((p) => p.title === partTitle);
    if (!course || !part) throw new Error('Session not found');

    const comments = [
      { name: 'سارا محمدی', text: 'خیلی مفید بود!', time: '۲ روز پیش' },
      { name: 'مهدی عباسی', text: 'توضیحات عالی بود', time: '۱ روز پیش' },
    ];

    return {
      part,
      videoUrl: undefined,
      comments,
    };
  }
}
