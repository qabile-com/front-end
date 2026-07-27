import type { ISessionRepository, SessionDetail } from '../../domain/session-repository';
import { COURSES } from '../../domain/courses.data';
import { applyMockWatchState } from './mock-course-watch-store';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockSessionRepository implements ISessionRepository {
  async getSessionDetail(courseId: string, sectionId: string): Promise<SessionDetail> {
    await delay(400);
    const course = COURSES.find((c) => c.id === courseId);
    const part = course?.episodes.find((p) => p.id === sectionId);
    if (!course || !part) throw new Error('Session not found');

    const comments = [
      { id: `${sectionId}-c1`, name: 'سارا محمدی', text: 'خیلی مفید بود!', time: '۲ روز پیش' },
      { id: `${sectionId}-c2`, name: 'مهدی عباسی', text: 'توضیحات عالی بود', time: '۱ روز پیش' },
    ];

    return {
      part: applyMockWatchState(part),
      videoUrl:
        part.mediaType === 'audio'
          ? undefined
          : (part.videoUrl ?? 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'),
      audioUrl: part.audioUrl ?? undefined,
      mediaUrl: part.mediaUrl ?? undefined,
      comments,
    };
  }
}
