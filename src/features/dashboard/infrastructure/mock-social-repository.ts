// src/features/dashboard/infrastructure/mock-social-repository.ts

import type { ISocialRepository } from '../domain/social-repository';
import type { Post, ActiveUser } from '../domain/social.data';
import { POSTS, TRENDING_TAGS, ACTIVE_USERS } from '../domain/social.data';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockSocialRepository implements ISocialRepository {
  // In-memory posts (starts with static data, new posts get prepended)
  private posts: Post[] = [...POSTS];

  async getFeed(): Promise<Post[]> {
    await delay(400);
    return this.posts;
  }

  async getTrendingTags(): Promise<string[]> {
    await delay(200);
    return [...TRENDING_TAGS];
  }

  async getActiveUsers(): Promise<ActiveUser[]> {
    await delay(200);
    return [...ACTIVE_USERS];
  }

  async createPost(text: string, location?: string, emoji?: string): Promise<Post> {
    await delay(300);
    const newPost: Post = {
      id: crypto.randomUUID(),
      author: 'شما',
      authorId: 'me',
      avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
      badge: 'عضو',
      time: 'همین الان',
      text: text + (location ? `\n📍 ${location}` : '') + (emoji || ''),
      likes: 0,
      comments: [],
    };
    this.posts.unshift(newPost);
    return newPost;
  }
}
