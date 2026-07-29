import type { IFollowRepository } from '../../domain/follow-repository';
import type { ActiveUser } from '@/features/social/domain/social.data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockFollowedUsers = new Set<string>();

export class MockFollowRepository implements IFollowRepository {
  async followUser(userId: string): Promise<ActiveUser> {
    await delay(200);
    mockFollowedUsers.add(userId);
    return mockFollowUser(userId, true);
  }

  async unfollowUser(userId: string): Promise<ActiveUser> {
    await delay(200);
    mockFollowedUsers.delete(userId);
    return mockFollowUser(userId, false);
  }

  async getFollowStatus(userId: string) {
    await delay(100);
    return mockFollowedUsers.has(userId);
  }
}

function mockFollowUser(userId: string, followed: boolean): ActiveUser {
  return {
    id: userId,
    name: 'کاربر قبیله',
    role: 'عضو قبیله',
    avatar: 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)',
    followersCount: followed ? 121 : 120,
    followedByMe: followed,
    isFollowedByMe: followed,
    canFollow: true,
  };
}
