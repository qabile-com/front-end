// src/features/dashboard/infrastructure/mock-social-repository.ts

import type { ISocialRepository } from '../domain/social-repository';
import type { Post, ActiveUser, PostComment } from '../domain/social.data';
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

  async createPost(
    text: string,
    location?: string,
    emoji?: string,
    imageFile?: File | null,
    gifUrl?: string,
  ): Promise<Post> {
    await delay(300);

    let imageUrl: string | undefined;
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    } else if (gifUrl) {
      imageUrl = gifUrl;
    }

    const postText = text + (location ? `\n📍 ${location}` : '') + (emoji ? ` ${emoji}` : '');

    const newPost: Post = {
      id: crypto.randomUUID(),
      author: 'شما',
      authorId: 'me',
      avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
      badge: 'عضو',
      time: 'همین الان',
      text: postText,
      likes: 0,
      comments: [],
      image: imageUrl,
      hasImage: !!imageUrl,
    };
    this.posts.unshift(newPost);
    return newPost;
  }

  async addComment(postId: string, text: string): Promise<PostComment> {
    await delay(200);
    const post = this.posts.find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');
    const newComment: PostComment = {
      name: 'شما',
      text,
      time: 'همین الان',
    };
    post.comments.push(newComment);
    return newComment;
  }
}
