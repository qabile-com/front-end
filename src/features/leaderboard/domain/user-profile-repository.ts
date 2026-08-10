// src/features/dashboard/domain/user-profile-repository.ts

import type { Achievement } from '@/features/dashboard/domain/dashboard.types';
import type { PostComment } from '@/features/social/domain/social.data';

export interface UserProfileData {
  id: string;
  name: string;
  username?: string | null;
  bio?: string | null;
  avatar: string;
  title: string;
  level: number;
  phone?: string | null;
  email?: string | null;
  role?: string;
  isAdam?: boolean;
  verified?: boolean;
  followedByMe?: boolean;
  blockedByMe?: boolean;
  canFollow?: boolean;
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
  achievements?: Achievement[];
  posts: {
    id: string;
    text: string;
    likes: number;
    comments: PostComment[];
    time: string;
  }[];
}

export interface UserProfilePost {
  id: string;
  text: string;
  likes: number;
  comments: PostComment[];
  time: string;
  image?: string;
  hasImage?: boolean;
  isPinned?: boolean;
}

export interface IUserProfileRepository {
  getUserProfile(userId: string): Promise<UserProfileData>;
  getUserPosts(userId: string, limit?: number, offset?: number): Promise<UserProfilePost[]>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
}
