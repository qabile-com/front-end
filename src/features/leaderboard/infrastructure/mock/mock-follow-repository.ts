import type { IFollowRepository } from '../../domain/follow-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockFollowRepository implements IFollowRepository {
  private followedUsers = new Set<string>();

  async followUser(userId: string) {
    await delay(200);
    this.followedUsers.add(userId);
  }
  async unfollowUser(userId: string) {
    await delay(200);
    this.followedUsers.delete(userId);
  }
  async getFollowStatus(userId: string) {
    await delay(100);
    return this.followedUsers.has(userId);
  }
}
