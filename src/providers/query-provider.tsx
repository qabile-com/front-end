'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AUTH_SESSION_EVENT, getAccessToken } from '@/core/auth/token';

let globalQueryClient: QueryClient | null = null;

export function getGlobalQueryClient(): QueryClient | null {
  return globalQueryClient;
}

export function resetAllQueries() {
  if (globalQueryClient) {
    globalQueryClient.clear();
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  useEffect(() => {
    globalQueryClient = queryClient;
  }, [queryClient]);

  useEffect(() => {
    const handler = () => {
      if (!getAccessToken()) {
        resetAllQueries();
      }
    };
    window.addEventListener(AUTH_SESSION_EVENT, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(AUTH_SESSION_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
