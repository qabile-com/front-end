import {
  MockLeaderboardRepository,
  MockUserDetailRepository,
} from '@/features/dashboard/infrastructure/mock/mock-dashboard-repository';
import { HttpLeaderboardRepository } from './http/http-leaderboard-repository';
import { MockSeasonRepository } from './mock/mock-season-repository';
import { HttpSeasonRepository } from './http/http-season-repository';
import { MockUserProfileRepository } from './mock/mock-user-profile-repository';
import { HttpUserProfileRepository } from './http/http-user-profile-repository';
import { MockFollowRepository } from './mock/mock-follow-repository';
import { HttpFollowRepository } from './http/http-follow-repository';
import { HttpUserRepository } from '@/features/dashboard/infrastructure/http/http-user-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const leaderboardRepo = isMock
  ? new MockLeaderboardRepository()
  : new HttpLeaderboardRepository();
export const userDetailRepo = isMock ? new MockUserDetailRepository() : new HttpUserRepository();
export const seasonRepo = isMock ? new MockSeasonRepository() : new HttpSeasonRepository();
export const userProfileRepo = isMock
  ? new MockUserProfileRepository()
  : new HttpUserProfileRepository();
export const followRepo = isMock ? new MockFollowRepository() : new HttpFollowRepository();
