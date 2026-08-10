import type { ExchangeDataInput, ExchangeDataResult, FriendsProgram, FriendsResponse } from './friends.types';

export interface IFriendsRepository {
  getProgram(options?: { signal?: AbortSignal }): Promise<FriendsProgram>;
  getFriends(params?: { limit?: number; page?: number }, options?: { signal?: AbortSignal }): Promise<FriendsResponse>;
  submitExchangeData(input: ExchangeDataInput): Promise<ExchangeDataResult>;
}
