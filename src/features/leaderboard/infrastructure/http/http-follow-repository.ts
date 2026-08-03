import type { IFollowRepository } from '../../domain/follow-repository';
import {
  followForumUser,
  getForumUser,
  unfollowForumUser,
  type ForumUserDto,
} from '@/core/api/forum.api';
import type { ActiveUser } from '@/features/social/domain/social.data';
import {
  unwrapActionResponse,
  type WithActionReward,
} from '@/features/dashboard/domain/achievement-normalizer';

export class HttpFollowRepository implements IFollowRepository {
  async followUser(userId: string): Promise<WithActionReward<ActiveUser>> {
    const res = await followForumUser(userId);
    return unwrapActionResponse(res.data, forumUserToActiveUser);
  }

  async unfollowUser(userId: string): Promise<ActiveUser> {
    const res = await unfollowForumUser(userId);
    const payload = res.data as ForumUserDto | { data?: ForumUserDto };
    return forumUserToActiveUser(('data' in payload && payload.data ? payload.data : res.data) as ForumUserDto);
  }

  async getFollowStatus(userId: string): Promise<boolean> {
    const res = await getForumUser(userId);
    const payload = res.data as typeof res.data | { data?: typeof res.data };
    const data = 'data' in payload && payload.data ? payload.data : res.data;
    return Boolean(data.followedByMe ?? data.isFollowedByMe);
  }
}

function forumUserToActiveUser(user: ForumUserDto): ActiveUser {
  const name =
    user.displayName ??
    user.name ??
    [user.firstName, user.lastName].filter(Boolean).join(' ') ??
    user.username ??
    'کاربر قبیله';

  const followedByMe = user.isFollowedByMe ?? user.followedByMe;

  return {
    id: user.id,
    name,
    role: user.title ?? user.role ?? '',
    avatar: user.avatar ?? 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)',
    isAdam: user.isAdam,
    verified: user.verified,
    followersCount: user.followersCount,
    followedByMe,
    isFollowedByMe: followedByMe,
    canFollow: user.canFollow,
    blockedByMe: user.blockedByMe,
    activityScore: user.activityScore,
  };
}
