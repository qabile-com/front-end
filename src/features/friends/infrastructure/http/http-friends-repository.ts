import {
  getMyFriends,
  getMyReferral,
  submitMyExchangeReferral,
} from '@/core/api/users.api';
import type { IFriendsRepository } from '../../domain/friends-repository';
import type {
  ExchangeDataInput,
  ExchangeDataResult,
  Friend,
  FriendsProgram,
  FriendsResponse,
} from '../../domain/friends.types';

interface ReferralDto {
  inviteCode?: string | null;
  referralCode?: string | null;
  exchangeReferralLink?: string | null;
  exchangeReferralIdentity?: string | null;
  hasExchangeReferralDetails?: boolean;
  friendsCount?: number;
}

interface FriendDto {
  id: string;
  displayName?: string | null;
  username?: string | null;
  avatar?: string | null;
  joinedAt?: string;
}

interface FriendsPayload {
  data?: FriendDto[];
  meta?: {
    limit?: number;
    offset?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

export class HttpFriendsRepository implements IFriendsRepository {
  async getProgram(options?: { signal?: AbortSignal }): Promise<FriendsProgram> {
    const response = await getMyReferral(options);
    return normalizeReferral(response.data.data ?? response.data);
  }

  async getFriends(
    params: { limit?: number; page?: number } = {},
    options?: { signal?: AbortSignal },
  ): Promise<FriendsResponse> {
    const limit = params.limit ?? 10;
    const page = params.page ?? 1;
    const offset = (page - 1) * limit;
    const response = await getMyFriends({ limit, offset }, options);
    const payload = (response.data ?? {}) as FriendsPayload | FriendDto[];
    const items = Array.isArray(payload) ? payload : payload.data ?? [];
    const meta = Array.isArray(payload) ? undefined : payload.meta;
    const totalItems = meta?.totalItems ?? items.length;

    return {
      items: items.map(normalizeFriend),
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: meta?.limit ?? limit,
        totalPages: meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / limit)),
        currentPage: Math.floor((meta?.offset ?? offset) / limit) + 1,
      },
    };
  }

  async submitExchangeData(input: ExchangeDataInput): Promise<ExchangeDataResult> {
    const response = await submitMyExchangeReferral(input);
    return { program: normalizeReferral(response.data.data ?? response.data) };
  }
}

function normalizeReferral(data: ReferralDto): FriendsProgram {
  const referralCode = data.referralCode ?? data.inviteCode ?? null;

  return {
    inviteCode: data.inviteCode ?? referralCode,
    referralCode,
    referralLink: referralCode ? createReferralLink(referralCode) : null,
    exchangeReferralUrl: data.exchangeReferralLink ?? null,
    identity: data.exchangeReferralIdentity ?? null,
    totalFriends: data.friendsCount ?? 0,
    verifiedFriends: data.friendsCount ?? 0,
    pendingFriends: 0,
  };
}

function normalizeFriend(friend: FriendDto): Friend {
  return {
    id: friend.id,
    profile: {
      id: friend.id,
      name: friend.displayName ?? friend.username ?? 'کاربر قبیله',
      username: friend.username,
      avatar: friend.avatar,
      xp: 5,
    },
    joinedAt: friend.joinedAt ?? new Date().toISOString(),
    status: 'verified',
  };
}

function createReferralLink(referralCode: string) {
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  return `${origin}/auth?ref=${encodeURIComponent(referralCode)}`;
}
