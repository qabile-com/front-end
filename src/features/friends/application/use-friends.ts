'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IFriendsRepository } from '../domain/friends-repository';
import type { ExchangeDataInput } from '../domain/friends.types';

export function useFriendsProgram(repo: IFriendsRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'friends', 'program'],
    queryFn: ({ signal }) => repo.getProgram({ signal }),
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    program: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useFriends(repo: IFriendsRepository, params: { limit?: number; page?: number } = {}) {
  const query = useQuery({
    queryKey: ['dashboard', 'friends', 'list', params],
    queryFn: ({ signal }) => repo.getFriends(params, { signal }),
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    friends: query.data?.items ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}

export function useSubmitExchangeData(repo: IFriendsRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExchangeDataInput) => repo.submitExchangeData(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'friends'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
    },
  });
}
