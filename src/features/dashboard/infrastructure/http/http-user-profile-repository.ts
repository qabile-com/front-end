// http-user-profile-repository.ts
import { getUserProfile } from '@/core/api/users.api';
import type { IUserProfileRepository, UserProfileData } from '../../domain/user-profile-repository';

export class HttpUserProfileRepository implements IUserProfileRepository {
  async getUserProfile(userId: string): Promise<UserProfileData> {
    const res = await getUserProfile(userId);
    const data = res.data;

    return {
      id: data.id,
      name: data.name,
      avatar: data.avatar,
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
      profileStats: data.profileStats.map((ps: any) => ({
        value: ps.value,
        label: ps.label,
      })),
      posts: (data.posts || []).map((p: any) => ({
        id: p.id,
        text: p.text,
        likes: p.likes,
        comments: [],
        time: p.createdAt,
      })),
    };
  }
}
