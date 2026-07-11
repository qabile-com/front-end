// src/features/dashboard/domain/social-repository.ts

import type { Post, ActiveUser } from './social.data';

export interface ISocialRepository {
  getFeed(): Promise<Post[]>;
  getTrendingTags(): Promise<string[]>;
  getActiveUsers(): Promise<ActiveUser[]>;
  /**
   * Publish a new post. Returns the created post with server‑generated id/timestamp.
   * For mock, we generate these client‑side.
   */
  createPost(text: string, location?: string, emoji?: string): Promise<Post>;
}
