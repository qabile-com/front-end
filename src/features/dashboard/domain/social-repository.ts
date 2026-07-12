// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser, PostComment } from './social.data';

export interface ISocialRepository {
  getFeed(): Promise<Post[]>;
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
}
