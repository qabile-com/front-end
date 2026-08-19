'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyPushTokens, updateMyPushTokenMode, type PushNotificationMode } from '@/core/api/users.api';
import { getStoredNotificationToken } from './use-notification-registration';

export function useMyPushTokenDevice(options?: { enabled?: boolean }) {
  const token = getStoredNotificationToken();

  return useQuery({
    queryKey: ['push-tokens', 'me', token],
    queryFn: async ({ signal }) => {
      const res = await getMyPushTokens(token!, { signal });
      return res.data.data.find((device) => device.isCurrent) ?? res.data.data[0] ?? null;
    },
    enabled: Boolean(token) && (options?.enabled ?? true),
    staleTime: 30_000,
  });
}

export function useUpdatePushTokenMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tokenId, mode }: { tokenId: string; mode: PushNotificationMode }) =>
      updateMyPushTokenMode(tokenId, mode),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['push-tokens', 'me'] });
    },
  });
}
