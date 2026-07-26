// src/features/dashboard/infrastructure/http-user-repository.ts

import type { IUserRepository } from '../../domain/dashboard-repository';
import { getDashboardBundle } from '@/core/api/dashboard.api';
import { DEFAULT_AVATAR_GRADIENT, type CurrentUser } from '../../domain/dashboard.types';

export class HttpUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<CurrentUser> {
    const res = await getDashboardBundle();
    const user = res.data.user;
    return {
      name: user.name,
      lastName: user.lastName,
      role: normalizeRole(user.role),
      initial: user.name[0] ?? '?', // guarantee a string
      title: user.title,
      level: user.level,
      xp: user.xp,
      xpMax: user.xpMax,
      streak: user.streak,
      avatar: user.avatar ?? DEFAULT_AVATAR_GRADIENT,
      achievements: user.achievements,
    };
  }
}

function normalizeRole(role: string | undefined): CurrentUser['role'] {
  if (role === 'admin' || role === 'super_admin') return role;
  return 'user';
}
