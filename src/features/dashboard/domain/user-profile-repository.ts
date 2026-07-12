// src/features/dashboard/domain/user-profile-repository.ts

import type { Post } from '../domain/social.data'; // need to adjust path
import { Achievement } from './dashboard.types';

export interface UserProfileData {
  id: string;
  name: string;
  avatar: string; // gradient string
  title: string;
  level: number;
  stats: {
    xp: number;
    streak: number;
    peersFollowed: number;
    peersFollowing: number;
  };
  posts: Post[];
  achievements?: Achievement[];
}

export interface IUserProfileRepository {
  getUserProfile(userId: string): Promise<UserProfileData>;
}
