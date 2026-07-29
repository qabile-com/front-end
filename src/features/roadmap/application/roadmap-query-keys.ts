export const roadmapKeys = {
  all: ['dashboard', 'roadmaps'] as const,
  active: () => [...roadmapKeys.all, 'active'] as const,
  list: (params?: { limit?: number; offset?: number; q?: string }) =>
    [...roadmapKeys.all, 'list', params ?? {}] as const,
};
