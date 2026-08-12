import { httpClient } from './http-client';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';
import type { AchievementDto } from '@/features/dashboard/domain/achievement-normalizer';

export interface ForumUserDto {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  username?: string | null;
  bio?: string | null;
  name?: string;
  role?: string;
  title?: string;
  avatar?: string | null;
  isAdam?: boolean;
  verified?: boolean;
  followersCount?: number;
  followedByMe?: boolean;
  isFollowedByMe?: boolean;
  blockedByMe?: boolean;
  canFollow?: boolean;
  activityScore?: number;
}

export interface ForumUserProfileDto extends ForumUserDto {
  stats?: {
    postsCount?: number;
    totalLikesReceived?: number;
    totalCommentsReceived?: number;
    followersCount?: number;
    followingCount?: number;
  };
  topTags?: ForumTagDto[];
  achievements?: AchievementDto[];
}

export interface ForumCommentDto {
  id?: string;
  authorId?: string;
  author?: ForumUserDto;
  name?: string;
  text: string;
  createdAt: string;
}

export interface ForumAttachmentDto {
  id: string;
  kind: string;
  url: string;
  mimeType?: string;
  originalName?: string;
  sizeBytes?: number;
}

export interface ForumTagDto {
  tag: string;
  count: number;
}

export interface ForumPostDto {
  id: string;
  author?: ForumUserDto | string;
  authorId?: string;
  avatar?: string;
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
  attachment?: ForumAttachmentDto | null;
  attachments?: ForumAttachmentDto[];
  likes: number;
  commentsCount?: number;
  likedByMe: boolean;
  commentedByMe?: boolean;
  followsAuthor?: boolean;
  comments?: ForumCommentDto[];
  location?: string;
  emoji?: string;
  image?: string;
  tags?: string[];
  isPinned: boolean;
  canFollowAuthor?: boolean;
  isAuthorFollowedByMe?: boolean;
}

export interface ForumFeedResponse {
  data: ForumPostDto[];
  meta: { limit: number; offset: number; totalItems: number; totalPages: number };
  trendingTags?: Array<string | ForumTagDto>;
  activeUsers?: ForumUserDto[];
  matchedUsers?: ForumUserDto[];
  postingStatus?: ForumPostingStatusDto;
}

export interface ForumCommentsResponse {
  data: ForumCommentDto[];
  meta?: { limit: number; offset: number; totalItems: number; totalPages: number };
}

export interface ForumUserStatsDto {
  postsCount: number;
  totalLikesReceived: number;
  totalCommentsReceived: number;
  givenLikesCount: number;
  givenCommentsCount: number;
  followersCount: number;
  followingCount: number;
}

export interface ForumPostingStatusDto {
  canCreatePost: boolean;
  isLocked: boolean;
  cooldownHours?: number;
  cooldownSeconds?: number;
  lastPostAt?: string | null;
  lockedUntil?: string | null;
  remainingSeconds?: number | null;
}

export interface ActionResponse<T> {
  data?: T;
  reward?: ActionRewardResult | null;
  unlockedAchievements?: ActionRewardResult['unlockedAchievements'];
  achievements?: ActionRewardResult['achievements'];
  xpGranted?: number;
}

export const getForumUserStats = (userId: string, options?: { signal?: AbortSignal }) =>
  httpClient.get<ForumUserStatsDto>(`/api/v1/forum/users/${userId}/stats`, { signal: options?.signal });

export const getForumFeed = (params?: {
  limit?: number;
  offset?: number;
  q?: string;
  hashtag?: string;
  authorId?: string;
  author?: string;
  followingOnly?: boolean;
}, options?: { signal?: AbortSignal }) => httpClient.get<ForumFeedResponse>('/api/v1/forum/feed', { params, signal: options?.signal });

export const getForumUserPosts = (
  userId: string,
  params?: { limit?: number; offset?: number; q?: string; hashtag?: string; author?: string },
  options?: { signal?: AbortSignal },
) => httpClient.get<ForumFeedResponse>(`/api/v1/forum/users/${userId}/posts`, { params, signal: options?.signal });

export const getForumUser = (userId: string, options?: { signal?: AbortSignal }) =>
  httpClient.get<ForumUserProfileDto>(`/api/v1/forum/users/${userId}`, { signal: options?.signal });

export const getForumPost = (postId: string, options?: { signal?: AbortSignal }) =>
  httpClient.get<ForumPostDto>(`/api/v1/forum/posts/${postId}`, { signal: options?.signal });

export const getForumPostingStatus = (options?: { signal?: AbortSignal }) =>
  httpClient.get<{ data: ForumPostingStatusDto } | ForumPostingStatusDto>(
    '/api/v1/forum/posting-status',
    { signal: options?.signal },
  );

export const getForumTrendingTags = (options?: { signal?: AbortSignal }) =>
  httpClient.get<{ data: Array<string | ForumTagDto> } | Array<string | ForumTagDto>>(
    '/api/v1/forum/trending-tags',
    { signal: options?.signal },
  );

export const getForumActiveUsers = (params?: { limit?: number }, options?: { signal?: AbortSignal }) =>
  httpClient.get<{ data: ForumUserDto[] } | ForumUserDto[]>('/api/v1/forum/active-users', {
    params,
    signal: options?.signal,
  });

export const createForumPost = (body: {
  text: string;
  tags?: string[];
  achievementId?: string;
  attachmentIds?: string[];
}) => {
  return httpClient.post<ActionResponse<ForumPostDto> | ForumPostDto>('/api/v1/forum/posts', {
    text: body.text,
    tags: body.tags,
    achievementId: body.achievementId,
    attachmentIds: body.attachmentIds,
  });
};

export const uploadForumAttachment = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return httpClient.post<ForumAttachmentDto>('/api/v1/forum/attachments', formData);
};

export const uploadForumAttachments = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return httpClient.post<{ data: ForumAttachmentDto[] }>('/api/v1/forum/attachments/batch', formData);
};

export const deleteForumAttachment = (attachmentId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/forum/attachments/${attachmentId}`);

export const deleteForumPost = (postId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/forum/posts/${postId}`);

export const pinForumPost = (postId: string, isPinned: boolean) =>
  httpClient.patch<ForumPostDto>(`/api/v1/forum/posts/${postId}/pin`, { isPinned });

export const addForumComment = (postId: string, body: { text: string }) =>
  httpClient.post<ActionResponse<ForumPostDto> | ForumPostDto>(`/api/v1/forum/posts/${postId}/comments`, body);

export const getForumComments = (postId: string, params?: { limit?: number; offset?: number }, options?: { signal?: AbortSignal }) =>
  httpClient.get<ForumCommentsResponse>(`/api/v1/forum/posts/${postId}/comments`, { params, signal: options?.signal });

export const deleteForumComment = (commentId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/forum/comments/${commentId}`);

export const deleteForumPostComment = (postId: string, commentId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/forum/posts/${postId}/comments/${commentId}`);

export const likePost = (postId: string) =>
  httpClient.post<ActionResponse<ForumPostDto> | ForumPostDto>(`/api/v1/forum/posts/${postId}/like`);

export const unlikePost = (postId: string) =>
  httpClient.delete<ForumPostDto>(`/api/v1/forum/posts/${postId}/like`);

export const followForumUser = (userId: string) =>
  httpClient.post<ActionResponse<ForumUserDto> | ForumUserDto>(`/api/v1/forum/users/${userId}/follow`);

export const unfollowForumUser = (userId: string) =>
  httpClient.delete<ForumUserDto>(`/api/v1/forum/users/${userId}/follow`);

export const blockForumUser = (userId: string) =>
  httpClient.post<{ success: boolean }>(`/api/v1/forum/users/${userId}/block`);

export const unblockForumUser = (userId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/forum/users/${userId}/block`);

export const adminPinPost = (postId: string, isPinned: boolean) =>
  httpClient.patch<ForumPostDto>(`/api/v1/admin/forum/posts/${postId}`, { isPinned });

export const adminDeletePost = (postId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/admin/forum/posts/${postId}`);

export const adminDeleteComment = (commentId: string) =>
  httpClient.delete<{ success: boolean }>(`/api/v1/admin/forum/comments/${commentId}`);

