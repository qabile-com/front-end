import type { IFollowRepository } from '../../domain/follow-repository';

export class HttpFollowRepository implements IFollowRepository {
  async followUser(userId: string): Promise<void> {
    throw new Error(`Follow user endpoint is not implemented yet: ${userId}`);
  }
  async unfollowUser(userId: string): Promise<void> {
    throw new Error(`Unfollow user endpoint is not implemented yet: ${userId}`);
  }
  async getFollowStatus(userId: string): Promise<boolean> {
    throw new Error(`Follow status endpoint is not implemented yet: ${userId}`);
  }
}
