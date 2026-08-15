import {
  addForumComment,
  createForumPost,
  deleteForumAttachment,
  deleteForumPostComment,
  deleteForumPost,
  followForumUser,
  getForumFeed,
  getForumComments,
  getForumPost,
  getForumPostingStatus,
  getForumUser,
  likePost,
  pinForumPost,
  uploadForumAttachment,
  unlikePost,
  unfollowForumUser,
  type ForumCommentDto,
  type ForumPostDto,
  type ForumTagDto,
  type ForumUserDto,
} from '@/core/api/forum.api';
import type { ISocialRepository, PostingStatus } from '../../domain/social-repository';
import type { SocialFeedFilters } from '../../domain/social-repository';
import type { ActiveUser, AchievementCard, Post, PostComment } from '../../domain/social.data';
import {
  unwrapActionResponse,
  type WithActionReward,
} from '@/features/dashboard/domain/achievement-normalizer';

const FALLBACK_AVATAR = 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)';

export class HttpSocialRepository implements ISocialRepository {
  private feedExtras: { tags: string[]; activeUsers: ActiveUser[] } = { tags: [], activeUsers: [] };

  async getFeed(
    limit = 10,
    offset = 0,
    filters: SocialFeedFilters = {},
    options?: { signal?: AbortSignal },
  ): Promise<Post[]> {
    const res = await getForumFeed(
      {
        limit,
        offset,
        q: filters.q,
        hashtag: filters.hashtag,
        authorId: filters.authorId,
        author: filters.author,
        followingOnly: filters.followingOnly,
      },
      options,
    );

    this.feedExtras = {
      tags: normalizeTags(res.data.trendingTags),
      activeUsers: (res.data.activeUsers ?? []).map(apiUserToDomain),
    };

    return res.data.data.map(apiForumPostToDomain);
  }

  async getPost(postId: string, options?: { signal?: AbortSignal }): Promise<Post> {
    const res = await getForumPost(postId, options);
    const data = res.data as ForumPostDto | { data: ForumPostDto };
    return apiForumPostToDomain('data' in data ? data.data : data);
  }

  async getPostComments(
    postId: string,
    limit = 30,
    offset = 0,
    options?: { signal?: AbortSignal },
  ): Promise<PostComment[]> {
    const res = await getForumComments(postId, { limit, offset }, options);
    const payload = res.data;
    return (payload.data ?? []).map(apiCommentToDomain);
  }

  async getPostingStatus(options?: { signal?: AbortSignal }): Promise<PostingStatus> {
    const res = await getForumPostingStatus(options);
    const payload = res.data;
    const data = 'data' in payload ? payload.data : payload;

    return {
      canCreatePost: Boolean(data.canCreatePost),
      isLocked: Boolean(data.isLocked),
      cooldownHours: data.cooldownHours ?? 12,
      lastPostAt: data.lastPostAt ?? null,
      lockedUntil: data.lockedUntil ?? null,
      remainingSeconds: data.remainingSeconds ?? null,
    };
  }

  async getTrendingTags(options?: { signal?: AbortSignal }): Promise<string[]> {
    if (this.feedExtras.tags.length) return this.feedExtras.tags;

    const res = await getForumFeed({ limit: 1, offset: 0 }, options);
    this.feedExtras.tags = normalizeTags(res.data.trendingTags);
    this.feedExtras.activeUsers = (res.data.activeUsers ?? []).map(apiUserToDomain);
    return this.feedExtras.tags;
  }

  async getActiveUsers(options?: { signal?: AbortSignal }): Promise<ActiveUser[]> {
    if (this.feedExtras.activeUsers.length) return this.feedExtras.activeUsers;

    const res = await getForumFeed({ limit: 1, offset: 0 }, options);
    this.feedExtras.tags = normalizeTags(res.data.trendingTags);
    this.feedExtras.activeUsers = (res.data.activeUsers ?? []).map(apiUserToDomain);
    return this.feedExtras.activeUsers;
  }

  async createPost(
    text: string,
    imageFile?: File | null,
    achievement?: AchievementCard | null,
  ): Promise<WithActionReward<Post>> {
    const attachmentIds: string[] = [];

    try {
      if (imageFile) {
        const attachment = await uploadForumAttachment(imageFile);
        attachmentIds.push(attachment.data.id);
      }

      const res = await createForumPost({
        text,
        attachmentIds: attachmentIds.length ? attachmentIds : undefined,
        achievementId: achievement?.id,
      });
      return unwrapActionResponse(res.data, apiForumPostToDomain);
    } catch (error) {
      await Promise.allSettled(attachmentIds.map((id) => deleteForumAttachment(id)));
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    await deleteForumPost(postId);
  }

  async pinPost(postId: string, isPinned: boolean): Promise<Post> {
    const response = await pinForumPost(postId, isPinned);
    return apiForumPostToDomain(response.data);
  }

  async addComment(postId: string, text: string): Promise<WithActionReward<PostComment>> {
    const res = await addForumComment(postId, { text });
    const result = unwrapActionResponse(res.data, apiForumPostToDomain);
    return {
      data: result.data.comments.at(-1) ?? { name: '', text, time: new Date().toISOString(), avatar: null },
      reward: result.reward,
    };
  }

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await deleteForumPostComment(postId, commentId);
  }

  async likePost(postId: string): Promise<WithActionReward<Post>> {
    const res = await likePost(postId);
    return unwrapActionResponse(res.data, apiForumPostToDomain);
  }

  async unlikePost(postId: string): Promise<Post> {
    const res = await unlikePost(postId);
    return apiForumPostToDomain(res.data);
  }

  async followUser(userId: string): Promise<WithActionReward<ActiveUser>> {
    const res = await followForumUser(userId);
    const result = unwrapActionResponse(res.data, apiUserToDomain);
    this.syncFollowedUser(userId, result.data);
    return result;
  }

  async unfollowUser(userId: string): Promise<ActiveUser> {
    const res = await unfollowForumUser(userId);
    const payload = res.data as ForumUserDto | { data?: ForumUserDto };
    const user = apiUserToDomain(
      ('data' in payload && payload.data ? payload.data : res.data) as ForumUserDto,
    );
    this.syncFollowedUser(userId, user);
    return user;
  }

  async getFollowStatus(userId: string): Promise<boolean> {
    const res = await getForumUser(userId);
    const payload = res.data as typeof res.data | { data?: typeof res.data };
    const user = 'data' in payload && payload.data ? payload.data : res.data;
    return Boolean(user.followedByMe ?? user.isFollowedByMe);
  }

  private syncFollowedUser(userId: string, user: ActiveUser) {
    const followed = user.isFollowedByMe ?? user.followedByMe ?? false;
    this.feedExtras = {
      ...this.feedExtras,
      activeUsers: this.feedExtras.activeUsers.map((item) =>
        item.id === userId
          ? {
              ...item,
              ...user,
              followedByMe: followed,
              isFollowedByMe: followed,
            }
          : item,
      ),
    };
  }
}

export function apiForumPostToDomain(api: ForumPostDto): Post {
  const author = normalizeAuthor(api);

  return {
    id: api.id,
    author: author.name,
    authorId: author.id,
    authorUsername: author.username,
    avatar: author.avatar,
    badge: author.role || api.badge,
    isAdam: author.isAdam ?? api.isAdam,
    verified: author.verified ?? api.verified,
    time: api.createdAt,
    text: api.text,
    achievement: api.achievement
      ? {
          title: api.achievement.title,
          sub: api.achievement.sub,
          icon: api.achievement.icon || 'flame',
        }
      : undefined,
    hasImage: api.hasImage ?? Boolean(api.attachments?.length || api.attachment || api.image),
    attachment: normalizeAttachment(api.attachments?.[0] ?? api.attachment),
    attachments: api.attachments?.map(normalizeAttachment).filter(Boolean),
    likes: api.likes,
    likedByMe: api.likedByMe,
    commentsCount: api.commentsCount ?? api.comments?.length ?? 0,
    commentedByMe: api.commentedByMe,
    comments: (api.comments || []).map(apiCommentToDomain),
    location: api.location,
    emoji: api.emoji,
    image: api.image,
    tags: api.tags,
    isPinned: api.isPinned,
    canFollowAuthor: api.canFollowAuthor ?? author.canFollow,
    isAuthorFollowedByMe:
      api.isAuthorFollowedByMe ?? api.followsAuthor ?? author.followedByMe ?? author.isFollowedByMe,
  };
}

function normalizeAttachment(attachment?: ForumPostDto['attachments'][number] | null) {
  if (!attachment) return undefined;

  return {
    id: attachment.id,
    kind: attachment.kind,
    url: attachment.url,
    mimeType: attachment.mimeType,
    originalName: attachment.originalName,
    sizeBytes: attachment.sizeBytes,
  };
}

function apiCommentToDomain(comment: ForumCommentDto): PostComment {
  const author = comment.author ? apiUserToDomain(comment.author) : null;

  return {
    id: comment.id,
    authorId: comment.authorId ?? comment.author?.id,
    name: author?.name ?? comment.name ?? 'کاربر قبیله',
    username: author?.username,
    text: comment.text,
    time: comment.createdAt,
    avatar: author?.avatar ?? null,
    badge: author?.role,
    isAdam: author?.isAdam,
    verified: author?.verified,
  };
}

function apiUserToDomain(api: ForumUserDto): ActiveUser {
  const name = normalizeName(api);

  return {
    id: api.id,
    name,
    username: api.username,
    role: api.title ?? api.role ?? '',
    avatar: api.avatar ?? FALLBACK_AVATAR,
    isAdam: api.isAdam,
    verified: api.verified,
    followersCount: api.followersCount,
    followedByMe: api.followedByMe ?? api.isFollowedByMe,
    canFollow: api.canFollow,
    isFollowedByMe: api.isFollowedByMe ?? api.followedByMe,
    blockedByMe: api.blockedByMe,
    activityScore: api.activityScore,
  };
}

function normalizeAuthor(api: ForumPostDto): ActiveUser {
  if (api.author && typeof api.author === 'object') {
    return apiUserToDomain(api.author);
  }

  return {
    id: api.authorId ?? String(api.author ?? 'unknown-author'),
    name: typeof api.author === 'string' ? api.author : 'کاربر قبیله',
    role: api.badge ?? '',
    avatar: api.avatar ?? FALLBACK_AVATAR,
    isAdam: api.isAdam,
    verified: api.verified,
  };
}

function normalizeName(user: ForumUserDto) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.displayName?.trim() || user.name?.trim() || user.username?.trim() || 'کاربر قبیله';
}

function normalizeTags(tags: Array<string | ForumTagDto> | undefined) {
  return (tags ?? []).map((item) => (typeof item === 'string' ? item : item.tag));
}
