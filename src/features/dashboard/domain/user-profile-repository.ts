// src/features/dashboard/domain/user-profile-repository.ts

import type { Post, PostComment } from '../domain/social.data';

export interface UserProfileData {
  id: string;
  name: string;
  avatar: string;
  title: string;
  level: number;
  phone?: string | null;
  email?: string | null;
  role?: string;
  xp: number;
  xpMax: number;
  streak: number;
  stats: {
    xp: number;
    streak: number;
    peersFollowed: number;
    peersFollowing: number;
  };
  profileStats: {
    value: string;
    label: string;
  }[];
  posts: {
    id: string;
    text: string;
    likes: number;
    comments: PostComment[];
    time: string;
  }[];
}

export interface IUserProfileRepository {
  getUserProfile(userId: string): Promise<UserProfileData>;
}
