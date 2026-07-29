import {
  addForumComment,
  createForumPost,
  followForumUser,
  getForumFeed,
  getForumComments,
  getForumPost,
  getForumUser,
  likePost,
  unlikePost,
  unfollowForumUser,
  type ForumCommentDto,
  type ForumPostDto,
  type ForumTagDto,
  type ForumUserDto,
} from '@/core/api/forum.api';
import type { ISocialRepository } from '../../domain/social-repository';
import type { SocialFeedFilters } from '../../domain/social-repository';
import type { ActiveUser, Post, PostComment } from '../../domain/social.data';

const FALLBACK_AVATAR = 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)';

export class HttpSocialRepository implements ISocialRepository {
  private feedExtras: { tags: string[]; activeUsers: ActiveUser[] } = { tags: [], activeUsers: [] };

  async getFeed(limit = 10, offset = 0, filters: SocialFeedFilters = {}): Promise<Post[]> {
    const res = await getForumFeed({
      limit,
      offset,
      q: filters.q,
      hashtag: filters.hashtag,
      authorId: filters.authorId,
      author: filters.author,
      followingOnly: filters.followingOnly,
    });

    this.feedExtras = {
      tags: normalizeTags(res.data.trendingTags),
      activeUsers: (res.data.activeUsers ?? []).map(apiUserToDomain),
    };

    return res.data.data.map(apiForumPostToDomain);
  }

  async getPost(postId: string): Promise<Post> {
    const res = await getForumPost(postId);
    const data = res.data as ForumPostDto | { data: ForumPostDto };
    return apiForumPostToDomain('data' in data ? data.data : data);
  }

  async getPostComments(postId: string, limit = 30, offset = 0): Promise<PostComment[]> {
    const res = await getForumComments(postId, { limit, offset });
    const payload = res.data;
    return (payload.data ?? []).map(apiCommentToDomain);
  }

  async getTrendingTags(): Promise<string[]> {
    if (this.feedExtras.tags.length) return this.feedExtras.tags;

    const res = await getForumFeed({ limit: 1, offset: 0 });
    this.feedExtras.tags = normalizeTags(res.data.trendingTags);
    this.feedExtras.activeUsers = (res.data.activeUsers ?? []).map(apiUserToDomain);
    return this.feedExtras.tags;
  }

  async getActiveUsers(): Promise<ActiveUser[]> {
    if (this.feedExtras.activeUsers.length) return this.feedExtras.activeUsers;

    const res = await getForumFeed({ limit: 1, offset: 0 });
    this.feedExtras.tags = normalizeTags(res.data.trendingTags);
    this.feedExtras.activeUsers = (res.data.activeUsers ?? []).map(apiUserToDomain);
    return this.feedExtras.activeUsers;
  }

  async createPost(text: string, imageFile?: File | null): Promise<Post> {
    const res = await createForumPost({ text, image: imageFile });
    return apiForumPostToDomain(res.data);
  }

  async addComment(postId: string, text: string): Promise<PostComment> {
    const res = await addForumComment(postId, { text });
    const post = apiForumPostToDomain(res.data);
    return post.comments.at(-1) ?? { name: '', text, time: new Date().toISOString() };
  }

  async likePost(postId: string): Promise<Post> {
    const res = await likePost(postId);
    return apiForumPostToDomain(res.data);
  }

  async unlikePost(postId: string): Promise<Post> {
    const res = await unlikePost(postId);
    return apiForumPostToDomain(res.data);
  }

  async followUser(userId: string): Promise<ActiveUser> {
    const res = await followForumUser(userId);
    const payload = res.data as ForumUserDto | { data?: ForumUserDto };
    const user = apiUserToDomain(('data' in payload && payload.data ? payload.data : res.data) as ForumUserDto);
    this.syncFollowedUser(userId, user);
    return user;
  }

  async unfollowUser(userId: string): Promise<ActiveUser> {
    const res = await unfollowForumUser(userId);
    const payload = res.data as ForumUserDto | { data?: ForumUserDto };
    const user = apiUserToDomain(('data' in payload && payload.data ? payload.data : res.data) as ForumUserDto);
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
    avatar: author.avatar,
    badge: author.role || api.badge,
    isAdam: author.isAdam ?? api.isAdam,
    verified: author.verified ?? api.verified,
    time: api.createdAt,
    text: api.text,
    achievement: api.achievement as Post['achievement'],
    hasImage: api.hasImage ?? Boolean(api.attachment || api.image),
    attachment: api.attachment
      ? {
          id: api.attachment.id,
          kind: api.attachment.kind,
          url: api.attachment.url,
        }
      : undefined,
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

function apiCommentToDomain(comment: ForumCommentDto): PostComment {
  const author = comment.author ? apiUserToDomain(comment.author) : null;

  return {
    id: comment.id,
    authorId: comment.authorId ?? comment.author?.id,
    name: author?.name ?? comment.name ?? 'کاربر قبیله',
    text: comment.text,
    time: comment.createdAt,
  };
}

function apiUserToDomain(api: ForumUserDto): ActiveUser {
  const name = normalizeName(api);

  return {
    id: api.id,
    name,
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
  return (
    user.displayName ??
    user.name ??
    [user.firstName, user.lastName].filter(Boolean).join(' ') ??
    user.username ??
    'کاربر قبیله'
  );
}

function normalizeTags(tags: Array<string | ForumTagDto> | undefined) {
  return (tags ?? []).map((item) => (typeof item === 'string' ? item : item.tag));
}

