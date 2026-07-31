// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser, PostComment, AchievementCard } from './social.data';

export interface SocialFeedFilters {
  q?: string;
  hashtag?: string;
  authorId?: string;
  author?: string;
  followingOnly?: boolean;
}

export interface ISocialRepository {
  getFeed(limit?: number, offset?: number, filters?: SocialFeedFilters, options?: { signal?: AbortSignal }): Promise<Post[]>;
  getPost(postId: string, options?: { signal?: AbortSignal }): Promise<Post>;
  getPostComments(postId: string, limit?: number, offset?: number, options?: { signal?: AbortSignal }): Promise<PostComment[]>;
  getTrendingTags(options?: { signal?: AbortSignal }): Promise<string[]>;
  getActiveUsers(options?: { signal?: AbortSignal }): Promise<ActiveUser[]>;
  createPost(text: string, imageFile?: File | null, achievement?: AchievementCard | null): Promise<Post>;
  addComment(postId: string, text: string): Promise<Post>;
  likePost(postId: string): Promise<Post>;
  unlikePost(postId: string): Promise<Post>;
  followUser(userId: string): Promise<ActiveUser>;
  unfollowUser(userId: string): Promise<ActiveUser>;
  getFollowStatus(userId: string): Promise<boolean>;
}
