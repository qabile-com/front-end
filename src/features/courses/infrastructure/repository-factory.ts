import { MockCoursesRepository } from '@/features/dashboard/infrastructure/mock/mock-dashboard-repository';
import { HttpCoursesRepository } from './http/http-courses-repository';
import { MockSessionRepository } from './mock/mock-session-repository';
import { HttpSessionRepository } from './http/http-session-repository';
import { MockCommentsRepository } from './mock/mock-comments-repository';
import { HttpCommentsRepository } from './http/http-comments-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const coursesRepo = isMock ? new MockCoursesRepository() : new HttpCoursesRepository();
export const sessionRepo = isMock ? new MockSessionRepository() : new HttpSessionRepository();
export const commentsRepo = isMock ? new MockCommentsRepository() : new HttpCommentsRepository();
