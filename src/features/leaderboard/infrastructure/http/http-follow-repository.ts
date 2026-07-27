import type { IFollowRepository } from '../../domain/follow-repository';
import {
  followUser as followUserApi,
  getFollowStatus as getFollowStatusApi,
  unfollowUser as unfollowUserApi,
} from '@/core/api/users.api';

export class HttpFollowRepository implements IFollowRepository {
  async followUser(userId: string): Promise<void> {
    await followUserApi(userId);
  }
  async unfollowUser(userId: string): Promise<void> {
    await unfollowUserApi(userId);
  }
  async getFollowStatus(userId: string): Promise<boolean> {
    const res = await getFollowStatusApi(userId);
    const data = res.data as { isFollowedByMe?: boolean; data?: { isFollowedByMe?: boolean } };
    return Boolean(data.data?.isFollowedByMe ?? data.isFollowedByMe);
  }
}
