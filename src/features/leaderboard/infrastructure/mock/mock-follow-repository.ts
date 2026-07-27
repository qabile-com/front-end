import type { IFollowRepository } from '../../domain/follow-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockFollowedUsers = new Set<string>();

export class MockFollowRepository implements IFollowRepository {
  async followUser(userId: string) {
    await delay(200);
    mockFollowedUsers.add(userId);
  }
  async unfollowUser(userId: string) {
    await delay(200);
    mockFollowedUsers.delete(userId);
  }
  async getFollowStatus(userId: string) {
    await delay(100);
    return mockFollowedUsers.has(userId);
  }
}
