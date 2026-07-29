import { HttpCoursesRepository } from './http/http-courses-repository';
import { HttpSessionRepository } from './http/http-session-repository';
import { HttpCommentsRepository } from './http/http-comments-repository';

export const coursesRepo = new HttpCoursesRepository();
export const sessionRepo = new HttpSessionRepository();
export const commentsRepo = new HttpCommentsRepository();
