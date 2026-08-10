import type { QueryClient } from '@tanstack/react-query';

export function invalidateSocialPostCreation(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['social-feed'] });
  queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] });
  queryClient.invalidateQueries({ queryKey: ['user-profile'] });
  queryClient.invalidateQueries({ queryKey: ['roadmap-step-condition'] });
}
