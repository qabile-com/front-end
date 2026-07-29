import { HttpLeaderboardRepository } from './http/http-leaderboard-repository';
import { HttpSeasonRepository } from './http/http-season-repository';
import { HttpUserProfileRepository } from './http/http-user-profile-repository';
import { HttpFollowRepository } from './http/http-follow-repository';
import { HttpUserRepository } from '@/features/dashboard/infrastructure/http/http-user-repository';

export const leaderboardRepo = new HttpLeaderboardRepository();
export const userDetailRepo = new HttpUserRepository();
export const seasonRepo = new HttpSeasonRepository();
export const userProfileRepo = new HttpUserProfileRepository();
export const followRepo = new HttpFollowRepository();
