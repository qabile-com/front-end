// src/features/dashboard/infrastructure/http-user-repository.ts

import type { IUserRepository } from '../../domain/dashboard-repository';
import { getDashboardBundle } from '@/core/api/dashboard.api';
import { updateMyOnboarding } from '@/core/api/users.api';
import { DEFAULT_AVATAR_GRADIENT, type CurrentUser } from '../../domain/dashboard.types';
import { getAvatarInitial } from '@/core/lib/avatar';

export class HttpUserRepository implements IUserRepository {
  async getCurrentUser(): Promise<CurrentUser> {
    const res = await getDashboardBundle();
    return normalizeCurrentUser(res.data.user);
  }

  async updateOnboardingCompletion(isCompleteOnboarding: boolean): Promise<CurrentUser> {
    const res = await updateMyOnboarding(isCompleteOnboarding);
    const payload = res.data.data ?? res.data;
    return normalizeCurrentUser(payload);
  }
}

type CurrentUserDto = Omit<Partial<CurrentUser>, 'role'> & {
  role?: string;
  displayName?: string | null;
  firstName?: string | null;
};

function normalizeCurrentUser(user: CurrentUserDto): CurrentUser {
  const displayName = user.displayName?.trim();
  const name = displayName || user.name?.trim() || [user.firstName, user.lastName].filter(Boolean).join(' ') || '';
  return {
    id: user.id ?? '',
    name,
    lastName: user.lastName ?? '',
    role: normalizeRole(user.role),
    initial: getAvatarInitial(name),
    title: user.title ?? '',
    level: user.level ?? 0,
    xp: user.xp ?? 0,
    xpMax: user.xpMax ?? 0,
    streak: user.streak ?? 0,
    avatar: user.avatar ?? DEFAULT_AVATAR_GRADIENT,
    achievements: user.achievements,
    isCompleteOnboarding: user.isCompleteOnboarding ?? false,
  };
}

function normalizeRole(role: string | undefined): CurrentUser['role'] {
  if (role === 'admin' || role === 'super_admin') return role;
  return 'user';
}
