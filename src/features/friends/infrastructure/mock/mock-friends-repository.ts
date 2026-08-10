import type { IFriendsRepository } from '../../domain/friends-repository';
import type { ExchangeDataInput, ExchangeDataResult, Friend, FriendsProgram, FriendsResponse } from '../../domain/friends.types';

let program: FriendsProgram = {
  inviteCode: null,
  referralCode: null,
  referralLink: null,
  exchangeReferralUrl: null,
  identity: null,
  totalFriends: 15,
  verifiedFriends: 5,
  pendingFriends: 6,
};

const friends: Friend[] = [
  {
    id: 'friend-1',
    profile: { id: 'user-1', name: 'علی رضایی', username: 'ali_trader', title: 'ققنوس تازه‌نفس', level: 7, xp: 1240 },
    joinedAt: '2026-07-18T09:30:00Z',
    status: 'verified',
  },
  {
    id: 'friend-2',
    profile: { id: 'user-2', name: 'سارا محمدی', username: 'sara_fx', title: 'شاگرد مسیر', level: 4, xp: 720 },
    joinedAt: '2026-07-20T14:10:00Z',
    status: 'registered',
  },
  {
    id: 'friend-3',
    profile: { id: 'user-3', name: 'رضا کریمی', username: 'reza_crypto', title: 'در حال فعال‌سازی', level: 2, xp: 310 },
    joinedAt: '2026-07-23T11:45:00Z',
    status: 'pending',
  },
  {
    id: 'friend-4',
    profile: { id: 'user-4', name: 'مریم احمدی', username: null, title: 'دعوت‌شده', level: 1, xp: 80 },
    joinedAt: '2026-07-26T16:20:00Z',
    status: 'not_registered',
  },
  {
    id: 'friend-5',
    profile: { id: 'user-5', name: 'حسین نوری', username: 'hossein_gold', title: 'همراه قبیله', level: 9, xp: 1680 },
    joinedAt: '2026-07-29T08:00:00Z',
    status: 'verified',
  },
  {
    id: 'friend-6',
    profile: { id: 'user-6', name: 'نگار شریفی', username: 'negar_rsi', title: 'تازه‌وارد', level: 3, xp: 430 },
    joinedAt: '2026-08-01T12:25:00Z',
    status: 'registered',
  },
];

export class MockFriendsRepository implements IFriendsRepository {
  async getProgram(): Promise<FriendsProgram> {
    await delay(250);
    return { ...program };
  }

  async getFriends(params: { limit?: number; page?: number } = {}): Promise<FriendsResponse> {
    await delay(320);
    const limit = params.limit ?? 8;
    const page = params.page ?? 1;
    const start = (page - 1) * limit;
    const items = friends.slice(start, start + limit);

    return {
      items,
      meta: {
        totalItems: friends.length,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.max(1, Math.ceil(friends.length / limit)),
        currentPage: page,
      },
    };
  }

  async submitExchangeData(input: ExchangeDataInput): Promise<ExchangeDataResult> {
    await delay(500);
    const referralCode = program.referralCode ?? 'QABILE-ARASH';
    program = {
      ...program,
      inviteCode: referralCode,
      referralCode,
      referralLink: `${window.location.origin}/auth?ref=${encodeURIComponent(referralCode)}`,
      exchangeReferralUrl: input.exchangeReferralUrl,
      identity: input.identity,
    };

    return { program: { ...program } };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
