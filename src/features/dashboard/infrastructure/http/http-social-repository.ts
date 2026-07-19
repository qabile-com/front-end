// http-social-repository.ts
import { getForumFeed, createForumPost, addForumComment } from '@/core/api/forum.api';
import type { ISocialRepository } from '../../domain/social-repository';
import type { Post, ActiveUser, PostComment } from '../../domain/social.data';

export class HttpSocialRepository implements ISocialRepository {
  async getFeed(): Promise<Post[]> {
    const res = await getForumFeed();
    return res.data.data.map(apiPostToDomain);
  }
  async getTrendingTags(): Promise<string[]> {
    const res = await getForumFeed();
    return res.data.trendingTags;
  }
  async getActiveUsers(): Promise<ActiveUser[]> {
    const res = await getForumFeed();
    return res.data.activeUsers;
  }
  async createPost(text: string, location?: string, emoji?: string): Promise<Post> {
    const res = await createForumPost({ text, location, emoji });
    return apiPostToDomain(res.data);
  }
  async addComment(postId: string, text: string): Promise<PostComment> {
    const res = await addForumComment(postId, { text });
    // The response is the whole post, but we just need the last comment
    const comments = res.data.comments;
    const newComment = comments[comments.length - 1];
    return {
      name: newComment.name,
      text: newComment.text,
      time: newComment.createdAt,
    };
  }
}

function apiPostToDomain(api: any): Post {
  return {
    id: api.id,
    author: api.author,
    authorId: api.authorId,
    avatar: api.avatar,
    badge: api.badge,
    isAdam: api.isAdam,
    verified: api.verified,
    time: api.createdAt,
    text: api.text,
    achievement: api.achievement,
    hasImage: api.hasImage,
    likes: api.likes,
    comments: (api.comments || []).map((c: any) => ({
      name: c.name,
      text: c.text,
      time: c.createdAt,
    })),
    location: api.location,
    emoji: api.emoji,
    image: api.image,
    tags: api.tags,
  };
}
