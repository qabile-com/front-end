import type { ActiveUser } from '@/features/social/domain/social.data';
import type { WithActionReward } from '@/features/dashboard/domain/achievement-normalizer';

export interface IFollowRepository {
  followUser(userId: string): Promise<WithActionReward<ActiveUser>>;
  unfollowUser(userId: string): Promise<ActiveUser>;
  getFollowStatus(userId: string): Promise<boolean>;
}
