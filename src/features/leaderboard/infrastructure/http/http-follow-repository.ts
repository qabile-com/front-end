import type { IFollowRepository } from '../../domain/follow-repository';
import {
  followForumUser,
  getForumUser,
  unfollowForumUser,
} from '@/core/api/forum.api';

export class HttpFollowRepository implements IFollowRepository {
  async followUser(userId: string): Promise<void> {
    await followForumUser(userId);
  }
  async unfollowUser(userId: string): Promise<void> {
    await unfollowForumUser(userId);
  }
  async getFollowStatus(userId: string): Promise<boolean> {
    const res = await getForumUser(userId);
    const payload = res.data as typeof res.data | { data?: typeof res.data };
    const data = 'data' in payload && payload.data ? payload.data : res.data;
    return Boolean(data.followedByMe ?? data.isFollowedByMe);
  }
}
