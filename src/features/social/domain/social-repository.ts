// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser, PostComment } from './social.data';

export interface ISocialRepository {
  getFeed(limit?: number, offset?: number): Promise<Post[]>;
  getPost(postId: string): Promise<Post>;
  getTrendingTags(): Promise<string[]>;
  getActiveUsers(): Promise<ActiveUser[]>;
  createPost(text: string, imageFile?: File | null): Promise<Post>;
  addComment(postId: string, text: string): Promise<PostComment>;
  likePost(postId: string): Promise<Post>;
  unlikePost(postId: string): Promise<Post>;
}
