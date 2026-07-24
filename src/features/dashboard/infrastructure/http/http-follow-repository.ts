import type { IFollowRepository } from '../../domain/follow-repository';
import { httpClient } from '@/core/api/http-client';

export class HttpFollowRepository implements IFollowRepository {
  async followUser(userId: string) {
    // TODO: real endpoint
    // await httpClient.post(`/api/v1/users/${userId}/follow`);
    throw new Error('Not implemented');
  }
  async unfollowUser(userId: string) {
    // await httpClient.delete(`/api/v1/users/${userId}/follow`);
    throw new Error('Not implemented');
  }
  async getFollowStatus(userId: string) {
    // const res = await httpClient.get(`/api/v1/users/${userId}/follow-status`);
    // return res.data.isFollowed;
    throw new Error('Not implemented');
  }
}
