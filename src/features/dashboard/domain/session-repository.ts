import type { CoursePart } from './courses.data';

export interface SessionDetail {
  part: CoursePart;
  videoUrl?: string;
  comments: {
    name: string;
    text: string;
    time: string;
  }[];
}

export interface ISessionRepository {
  getSessionDetail(courseId: string, partTitle: string): Promise<SessionDetail>;
}
