// http-social-repository.ts
import {
  addForumComment,
  createForumPost,
  getForumActiveUsers,
  getForumFeed,
  getForumPost,
  getForumTrendingTags,
  likePost,
  unlikePost,
  type ActiveUserDto,
  type ForumPostDto,
} from '@/core/api/forum.api';
import type { ISocialRepository } from '../../domain/social-repository';
import type { Post, ActiveUser, PostComment } from '../../domain/social.data';

export class HttpSocialRepository implements ISocialRepository {
  async getFeed(limit = 10, offset = 0): Promise<Post[]> {
    const res = await getForumFeed({ limit, offset });

    return res.data.data.map(apiPostToDomain);
  }
  async getPost(postId: string): Promise<Post> {
    const res = await getForumPost(postId);
    const data = res.data as ForumPostDto | { data: ForumPostDto };
    return apiPostToDomain('data' in data ? data.data : data);
  }
  async getTrendingTags(): Promise<string[]> {
    const res = await getForumTrendingTags();
    const data = res.data as string[] | { data: string[] };
    return Array.isArray(data) ? data : data.data;
  }
  async getActiveUsers(): Promise<ActiveUser[]> {
    const res = await getForumActiveUsers({ limit: 8 });
    const data = res.data as ActiveUserDto[] | { data: ActiveUserDto[] };
    return (Array.isArray(data) ? data : data.data).map(apiActiveUserToDomain);
  }
  async createPost(text: string, imageFile?: File | null): Promise<Post> {
    const res = await createForumPost({ text, image: imageFile });
    return apiPostToDomain(res.data);
  }
  async addComment(postId: string, text: string): Promise<PostComment> {
    const res = await addForumComment(postId, { text });
    // The response is the whole post, but we just need the last comment
    const comments = res.data.comments;
    const newComment = comments[comments.length - 1];
    return {
      name: newComment?.name ?? '',
      text: newComment?.text ?? text,
      time: newComment?.createdAt ?? '',
    };
  }

  async likePost(postId: string): Promise<Post> {
    const res = await likePost(postId);
    return apiPostToDomain(res.data);
  }
  async unlikePost(postId: string): Promise<Post> {
    const res = await unlikePost(postId);
    return apiPostToDomain(res.data);
  }
}

function apiPostToDomain(api: ForumPostDto): Post {
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
    attachment: api.attachment
      ? {
          id: api.attachment.id,
          kind: api.attachment.kind,
          url: api.attachment.url,
        }
      : undefined,
    likes: api.likes,
    likedByMe: api.likedByMe,
    comments: (api.comments || []).map((c) => ({
      name: c.name,
      text: c.text,
      time: c.createdAt,
    })),
    location: api.location,
    emoji: api.emoji,
    image: api.image,
    tags: api.tags,
    isPinned: api.isPinned,
    canFollowAuthor: api.canFollowAuthor,
    isAuthorFollowedByMe: api.isAuthorFollowedByMe,
  };
}

function apiActiveUserToDomain(api: ActiveUserDto): ActiveUser {
  return {
    id: api.id,
    name: api.name,
    role: api.role,
    avatar: api.avatar,
    isAdam: api.isAdam,
    canFollow: api.canFollow,
    isFollowedByMe: api.isFollowedByMe,
  };
}
