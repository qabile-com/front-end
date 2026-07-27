import type { CoursePart } from './courses.data';
import type { Comment } from './comments-repository';

export interface SessionDetail {
  part: CoursePart;
  videoUrl?: string;
  audioUrl?: string;
  mediaUrl?: string;
  comments: Comment[];
}

export interface ISessionRepository {
  getSessionDetail(courseId: string, sectionId: string): Promise<SessionDetail>;
}
