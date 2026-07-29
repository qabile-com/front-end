// http-user-profile-repository.ts
import {
  blockForumUser,
  getForumUser,
  getForumUserPosts,
  unblockForumUser,
  type ForumPostDto,
  type ForumUserProfileDto,
} from '@/core/api/forum.api';
import type {
  IUserProfileRepository,
  UserProfileData,
  UserProfilePost,
} from '../../domain/user-profile-repository';
import { DEFAULT_AVATAR_GRADIENT } from '@/features/dashboard/domain/dashboard.types';

export class HttpUserProfileRepository implements IUserProfileRepository {
  async getUserProfile(userId: string): Promise<UserProfileData> {
    const res = await getForumUser(userId);
    const payload = res.data as ForumUserProfileDto | { data?: ForumUserProfileDto };
    const data = ('data' in payload && payload.data ? payload.data : res.data) as ForumUserProfileDto;
    const name = normalizeForumUserName(data);
    const followersCount = data.stats?.followersCount ?? data.followersCount ?? 0;
    const followingCount = data.stats?.followingCount ?? 0;
    const postsCount = data.stats?.postsCount ?? 0;
    const likesReceived = data.stats?.totalLikesReceived ?? 0;
    const commentsReceived = data.stats?.totalCommentsReceived ?? 0;

    return {
      id: data.id,
      name,
      avatar: data.avatar ?? DEFAULT_AVATAR_GRADIENT,
      title: data.title ?? data.role ?? '',
      level: 0,
      role: data.role,
      isAdam: data.isAdam,
      verified: data.verified,
      followedByMe: data.followedByMe ?? data.isFollowedByMe,
      blockedByMe: data.blockedByMe,
      canFollow: data.canFollow,
      xp: data.activityScore ?? 0,
      xpMax: 0,
      streak: 0,
      stats: {
        xp: likesReceived,
        streak: postsCount,
        peersFollowed: followersCount,
        peersFollowing: followingCount,
      },
      profileStats: [
        { value: String(postsCount), label: 'پست' },
        { value: String(likesReceived), label: 'لایک' },
        { value: String(commentsReceived), label: 'کامنت' },
        { value: String(followersCount), label: 'هم‌پرواز' },
      ],
      achievements: [],
      posts: [],
    };
  }

  async getUserPosts(userId: string, limit = 6, offset = 0): Promise<UserProfilePost[]> {
    const res = await getForumUserPosts(userId, { limit, offset });
    const posts = (res.data.data ?? []) as ForumPostDto[];

    return posts.map((post) => ({
      id: post.id,
      text: post.text,
      likes: post.likes,
      comments: (post.comments ?? []).map((comment) => ({
        name: comment.name ?? normalizeForumUserName(comment.author),
        text: comment.text,
        time: comment.createdAt ?? '',
      })),
      time: post.createdAt ?? '',
      image: post.image ?? post.attachment?.url,
      hasImage: post.hasImage ?? Boolean(post.attachment),
    }));
  }

  async blockUser(userId: string): Promise<void> {
    await blockForumUser(userId);
  }

  async unblockUser(userId: string): Promise<void> {
    await unblockForumUser(userId);
  }
}

function normalizeForumUserName(user: ForumUserProfileDto | ForumPostDto['comments'][number]['author'] | undefined) {
  if (!user) return 'کاربر قبیله';
  return (
    user.displayName ??
    user.name ??
    [user.firstName, user.lastName].filter(Boolean).join(' ') ??
    user.username ??
    'کاربر قبیله'
  );
}
