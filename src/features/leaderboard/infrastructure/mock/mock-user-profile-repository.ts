// src/features/dashboard/infrastructure/mock-user-profile-repository.ts

import type { IUserProfileRepository, UserProfileData } from '../../domain/user-profile-repository';
import {
  ACHIEVEMENTS,
  LEADERBOARD,
  PROFILE_STATS,
  USER as CURRENT_USER,
} from '@/features/dashboard/domain/dashboard.data';
import { POSTS } from '@/features/social/domain/social.data';

// Utility: derive a Persian title from a streak number
function getTitleFromStreak(streak: number): string {
  if (streak >= 30) return 'ققنوس افسانه‌ای';
  if (streak >= 20) return 'ققنوس طلایی';
  if (streak >= 10) return 'ققنوس نقره‌ای';
  return 'ققنوس برنزی';
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockUserProfileRepository implements IUserProfileRepository {
  async getUserProfile(userId: string): Promise<UserProfileData> {
    await delay(300);
    // Simulate finding user in leaderboard or current user
    let name = userId;
    let avatar = 'linear-gradient(135deg,#ff8a3d,#cc4308)';
    let title = 'ققنوس طلایی';
    let level = 24;
    let xp = 6800;
    let xpMax = 10000;
    let streak = 31;
    const peersFollowed = 120;
    const peersFollowing = 85;

    if (userId === CURRENT_USER.name) {
      // return current user data
      name = CURRENT_USER.name;
      avatar = CURRENT_USER.avatar;
      title = CURRENT_USER.title;
      level = CURRENT_USER.level;
      xp = CURRENT_USER.xp;
      xpMax = CURRENT_USER.xpMax;
    } else {
      const row = LEADERBOARD.find((r) => r.name === userId);
      if (row) {
        name = row.name;
        avatar = row.avatar;
        const streakNumber = parseInt(row.streak, 10) || 0;
        level = Math.floor(streakNumber / 3) + 1 || 1;
        title = getTitleFromStreak(streakNumber);
        xp = parseInt(row.points.replace(/\D/g, ''), 10) || 0;
        streak = streakNumber;
      }
    }

    const userPosts = POSTS.filter(
      (p) => p.authorId === (userId === CURRENT_USER.name ? 'arash' : 'other'),
    )
      .slice(0, 3)
      .map((post) => ({
        id: post.id,
        text: post.text,
        likes: post.likes,
        comments: post.comments,
        time: post.time,
      }));

    return {
      id: userId,
      name,
      avatar,
      title,
      level,
      phone: null,
      email: null,
      role: 'user',
      xp,
      xpMax,
      streak,
      stats: { xp, streak, peersFollowed, peersFollowing },
      profileStats: PROFILE_STATS,
      achievements: ACHIEVEMENTS,
      posts: userPosts,
    };
  }
}
