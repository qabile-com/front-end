// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser, PostComment, AchievementCard } from './social.data';
import type { WithActionReward } from '@/features/dashboard/domain/achievement-normalizer';

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
  createPost(text: string, imageFile?: File | null, achievement?: AchievementCard | null): Promise<WithActionReward<Post>>;
  deletePost(postId: string): Promise<void>;
  pinPost(postId: string, isPinned: boolean): Promise<Post>;
  addComment(postId: string, text: string): Promise<WithActionReward<PostComment>>;
  deleteComment(postId: string, commentId: string): Promise<void>;
  likePost(postId: string): Promise<WithActionReward<Post>>;
  unlikePost(postId: string): Promise<Post>;
  followUser(userId: string): Promise<WithActionReward<ActiveUser>>;
  unfollowUser(userId: string): Promise<ActiveUser>;
  getFollowStatus(userId: string): Promise<boolean>;
}
