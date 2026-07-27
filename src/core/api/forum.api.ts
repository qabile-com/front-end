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
  attachment?: {
    id: string;
    kind: string;
    url: string;
  };
  likes: number;
  likedByMe: boolean;
  comments?: ForumCommentDto[];
  location?: string;
  emoji?: string;
  image?: string;
  tags?: string[];
  isPinned: boolean;
  canFollowAuthor?: boolean;
  isAuthorFollowedByMe?: boolean;
}
export interface ActiveUserDto {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isAdam?: boolean;
  canFollow?: boolean;
  isFollowedByMe?: boolean;
}

export interface ForumFeedResponse {
  data: ForumPostDto[];
  meta: { limit: number; offset: number; totalItems: number; totalPages: number };
  trendingTags: string[];
  activeUsers: ActiveUserDto[];
}

export const getForumFeed = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get<ForumFeedResponse>('/api/v1/forum/feed', { params });

export const getForumPost = (postId: string) =>
  httpClient.get<ForumPostDto>(`/api/v1/forum/posts/${postId}`);

export const getForumTrendingTags = () =>
  httpClient.get<{ data: string[] }>('/api/v1/forum/trending-tags');

export const getForumActiveUsers = (params?: { limit?: number }) =>
  httpClient.get<{ data: ActiveUserDto[] }>('/api/v1/forum/active-users', { params });

export const createForumPost = (body: {
  text: string;
  image?: File | null;
  tags?: string[];
}) => {
  if (body.image) {
    const formData = new FormData();
    formData.append('text', body.text);
    formData.append('image', body.image);
    body.tags?.forEach((tag) => formData.append('tags[]', tag));

    return httpClient.post<ForumPostDto>('/api/v1/forum/posts', formData);
  }

  return httpClient.post<ForumPostDto>('/api/v1/forum/posts', {
    text: body.text,
    tags: body.tags,
  });
};

export const addForumComment = (postId: string, body: { text: string }) =>
  httpClient.post<{ comments: ForumCommentDto[] }>(`/api/v1/forum/posts/${postId}/comments`, body);

// Like / unlike
export const likePost = (postId: string) =>
  httpClient.post<ForumPostDto>(`/api/v1/forum/posts/${postId}/like`);

export const unlikePost = (postId: string) =>
  httpClient.delete<ForumPostDto>(`/api/v1/forum/posts/${postId}/like`);

// Admin endpoints
export const adminPinPost = (postId: string, isPinned: boolean) =>
  httpClient.patch<ForumPostDto>(`/api/v1/admin/forum/posts/${postId}`, { isPinned });

export const adminDeletePost = (postId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/admin/forum/posts/${postId}`);

export const adminDeleteComment = (commentId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/admin/forum/comments/${commentId}`);
