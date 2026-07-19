// src/features/dashboard/infrastructure/http-user-repository.ts

import type { IUserRepository } from '../../domain/dashboard-repository';
import { getDashboardBundle } from '@/core/api/dashboard.api';

export class HttpUserRepository implements IUserRepository {
  async getCurrentUser() {
    const res = await getDashboardBundle();
    const user = res.data.user;
    return {
      name: user.name,
      initial: user.name[0] ?? '?', // guarantee a string
      title: user.title,
      level: user.level,
      xp: user.xp,
      xpMax: user.xpMax,
      avatar: user.avatar,
    };
  }
}
