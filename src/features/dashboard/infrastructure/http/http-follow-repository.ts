import type { IFollowRepository } from '../../domain/follow-repository';
import { httpClient } from '@/core/api/http-client';

export class HttpFollowRepository implements IFollowRepository {
  async followUser(userId: string): Promise<void> {
    await Promise.reject(new Error('Not implemented'));
  }
  async unfollowUser(userId: string): Promise<void> {
    await Promise.reject(new Error('Not implemented'));
  }
  async getFollowStatus(userId: string): Promise<boolean> {
    await Promise.reject(new Error('Not implemented'));
  }
}
