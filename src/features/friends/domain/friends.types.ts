export type FriendStatus = 'verified' | 'registered' | 'pending' | 'not_registered';

export interface FriendProfile {
  id: string;
  name: string;
  username?: string | null;
  email?: string | null;
  avatar?: string | null;
  title?: string | null;
  level?: number | null;
  xp?: number | null;
}

export interface Friend {
  id: string;
  profile: FriendProfile;
  joinedAt: string;
  status: FriendStatus;
}

export interface FriendsMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface FriendsResponse {
  items: Friend[];
  meta: FriendsMeta;
}

export interface FriendsProgram {
  inviteCode: string | null;
  referralCode?: string | null;
  referralLink: string | null;
  exchangeReferralUrl: string | null;
  identity: string | null;
  totalFriends: number;
  verifiedFriends: number;
  pendingFriends: number;
}

export interface ExchangeDataInput {
  exchangeReferralUrl: string;
  identity: string;
}

export interface ExchangeDataResult {
  program: FriendsProgram;
}
