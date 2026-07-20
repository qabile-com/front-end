import { httpClient } from './http-client';

export interface ForumCommentDto {
  name: string;
  text: string;
  createdAt: string;
}

export interface ForumPostDto {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  badge?: string;
  isAdam?: boolean;
  verified?: boolean;
  createdAt: string;
  text: string;
  achievement?: {
    title: string;
    sub: string;
    icon: string;
  };
  hasImage?: boolean;
  likes: number;
  comments?: ForumCommentDto[];
  location?: string;
  emoji?: string;
  image?: string;
  tags?: string[];
}

export interface ActiveUserDto {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAdam?: boolean;
  canFollow?: boolean;
}

export interface ForumFeedResponse {
  data: ForumPostDto[];
  meta: { limit: number; offset: number; totalItems: number; totalPages: number };
  trendingTags: string[];
  activeUsers: ActiveUserDto[];
}

export const getForumFeed = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get<ForumFeedResponse>('/api/v1/forum/feed', { params });

export const createForumPost = (body: {
  text: string;
  location?: string;
  emoji?: string;
  tags?: string[];
}) => httpClient.post<ForumPostDto>('/api/v1/forum/posts', body);

export const addForumComment = (postId: string, body: { text: string }) =>
  httpClient.post<{ comments: ForumCommentDto[] }>(`/api/v1/forum/posts/${postId}/comments`, body);
