// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser, PostComment } from './social.data';

export interface SocialFeedFilters {
  q?: string;
  hashtag?: string;
  authorId?: string;
  author?: string;
  followingOnly?: boolean;
}

export interface ISocialRepository {
  getFeed(limit?: number, offset?: number, filters?: SocialFeedFilters): Promise<Post[]>;
  getPost(postId: string): Promise<Post>;
  getPostComments(postId: string, limit?: number, offset?: number): Promise<PostComment[]>;
  getTrendingTags(): Promise<string[]>;
  getActiveUsers(): Promise<ActiveUser[]>;
  createPost(text: string, imageFile?: File | null): Promise<Post>;
  addComment(postId: string, text: string): Promise<PostComment>;
  likePost(postId: string): Promise<Post>;
  unlikePost(postId: string): Promise<Post>;
  followUser(userId: string): Promise<ActiveUser>;
  unfollowUser(userId: string): Promise<ActiveUser>;
  getFollowStatus(userId: string): Promise<boolean>;
}
