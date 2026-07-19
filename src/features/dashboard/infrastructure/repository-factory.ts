import {
  MockUserRepository,
  MockHomeRepository,
  MockLeaderboardRepository,
  MockCoursesRepository,
  MockProfileRepository,
  MockUserDetailRepository,
} from './mock/mock-dashboard-repository';
import { MockSocialRepository } from './mock/mock-social-repository';
import { MockSeasonRepository } from './mock/mock-season-repository';

import { HttpHomeRepository } from './http/http-home-repository';
import { HttpLeaderboardRepository } from './http/http-leaderboard-repository';
import { HttpCoursesRepository } from './http/http-courses-repository';
import { HttpProfileRepository } from './http/http-profile-repository';
import { HttpSocialRepository } from './http/http-social-repository';
import { HttpSeasonRepository } from './http/http-season-repository';
import { HttpUserRepository } from './http/http-user-repository';
import { MockRoadmapStepRepository } from './mock/mock-roadmap-repository';
import { HttpRoadmapStepRepository } from './http/http-roadmap-step-repository';
import { MockUserProfileRepository } from './mock/mock-user-profile-repository';
import { HttpUserProfileRepository } from './http/http-user-profile-repository';
import { MockSessionRepository } from './mock/mock-session-repository';
import { HttpSessionRepository } from './http/http-session-repository';
import { MockCommentsRepository } from './mock/mock-comments-repository';
import { HttpCommentsRepository } from './http/http-comments-repository';
// import all HTTP repositories

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const userRepo = isMock ? new MockUserRepository() : new HttpUserRepository();
export const homeRepo = isMock ? new MockHomeRepository() : new HttpHomeRepository();
export const leaderboardRepo = isMock
  ? new MockLeaderboardRepository()
  : new HttpLeaderboardRepository();
export const coursesRepo = isMock ? new MockCoursesRepository() : new HttpCoursesRepository();
export const profileRepo = isMock ? new MockProfileRepository() : new HttpProfileRepository();
export const userDetailRepo = isMock ? new MockUserDetailRepository() : new HttpUserRepository();
export const socialRepo = isMock ? new MockSocialRepository() : new HttpSocialRepository();
export const seasonRepo = isMock ? new MockSeasonRepository() : new HttpSeasonRepository();
export const roadmapStepRepo = isMock
  ? new MockRoadmapStepRepository()
  : new HttpRoadmapStepRepository();
export const userProfileRepo = isMock
  ? new MockUserProfileRepository()
  : new HttpUserProfileRepository();
export const sessionRepo = isMock ? new MockSessionRepository() : new HttpSessionRepository();
export const commentsRepo = isMock ? new MockCommentsRepository() : new HttpCommentsRepository();
