import type { ActiveUser } from '@/features/social/domain/social.data';

export interface IFollowRepository {
  followUser(userId: string): Promise<ActiveUser>;
  unfollowUser(userId: string): Promise<ActiveUser>;
  getFollowStatus(userId: string): Promise<boolean>;
}
