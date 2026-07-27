// http-user-profile-repository.ts
import { getUserPosts as getUserPostsApi, getUserProfile } from '@/core/api/users.api';
import type {
  IUserProfileRepository,
  UserProfileData,
  UserProfilePost,
} from '../../domain/user-profile-repository';
import { DEFAULT_AVATAR_GRADIENT } from '@/features/dashboard/domain/dashboard.types';

type UserProfileDto = Omit<UserProfileData, 'avatar' | 'profileStats' | 'posts' | 'achievements'> & {
  avatar?: string | null;
  profileStats: { value: string; label: string }[];
  achievements?: (NonNullable<UserProfileData['achievements']>[number] & {
    timesAchieved?: number;
    earnedCount?: number;
  })[];
  posts?: {
    id: string;
    text: string;
    likes: number;
    createdAt: string;
  }[];
};

export class HttpUserProfileRepository implements IUserProfileRepository {
  async getUserProfile(userId: string): Promise<UserProfileData> {
    const res = await getUserProfile(userId);
    const data = (res.data.data ?? res.data) as UserProfileDto;

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar ?? DEFAULT_AVATAR_GRADIENT,
      title: data.title,
      level: data.level,
      phone: data.phone,
      email: data.email,
      role: data.role,
      xp: data.xp,
      xpMax: data.xpMax,
      streak: data.streak,
      stats: {
        xp: data.stats.xp,
        streak: data.stats.streak,
        peersFollowed: data.stats.peersFollowed,
        peersFollowing: data.stats.peersFollowing,
      },
      profileStats: data.profileStats.map((ps) => ({
        value: ps.value,
        label: ps.label,
      })),
      achievements: data.achievements?.map((achievement) => ({
        ...achievement,
        count: achievement.count ?? achievement.timesAchieved ?? achievement.earnedCount,
      })),
      posts: (data.posts || []).map((p) => ({
        id: p.id,
        text: p.text,
        likes: p.likes,
        comments: [],
        time: p.createdAt,
      })),
    };
  }

  async getUserPosts(userId: string, limit = 6, offset = 0): Promise<UserProfilePost[]> {
    const res = await getUserPostsApi(userId, { limit, offset });
    const posts = (res.data.data ?? res.data) as {
      id: string;
      text: string;
      likes: number;
      comments?: { name: string; text: string; createdAt?: string; time?: string }[];
      createdAt?: string;
      time?: string;
      image?: string;
      hasImage?: boolean;
    }[];

    return posts.map((post) => ({
      id: post.id,
      text: post.text,
      likes: post.likes,
      comments: (post.comments ?? []).map((comment) => ({
        name: comment.name,
        text: comment.text,
        time: comment.createdAt ?? comment.time ?? '',
      })),
      time: post.createdAt ?? post.time ?? '',
      image: post.image,
      hasImage: post.hasImage,
    }));
  }
}
