export interface IFollowRepository {
  followUser(userId: string): Promise<void>;
  unfollowUser(userId: string): Promise<void>;
  getFollowStatus(userId: string): Promise<boolean>;
}
