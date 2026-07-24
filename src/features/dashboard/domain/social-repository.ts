// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser, PostComment } from './social.data';

export interface ISocialRepository {
  getFeed(limit?: number, offset?: number): Promise<Post[]>;
  getTrendingTags(): Promise<string[]>;
  getActiveUsers(): Promise<ActiveUser[]>;
  createPost(
    text: string,
    location?: string,
    emoji?: string,
    imageFile?: File | null,
    gifUrl?: string,
  ): Promise<Post>;
  addComment(postId: string, text: string): Promise<PostComment>;
  likePost(postId: string): Promise<Post>;
  unlikePost(postId: string): Promise<Post>;
}
