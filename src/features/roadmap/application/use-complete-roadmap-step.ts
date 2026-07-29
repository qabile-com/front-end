'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IRoadmapRepository } from '../domain/roadmap-repository';
import type { CompleteRoadmapStepInput } from '../domain/roadmap.types';
import { roadmapKeys } from './roadmap-query-keys';

export function useCompleteRoadmapStep(repo: IRoadmapRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompleteRoadmapStepInput) => repo.completeStep(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roadmapKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
    },
  });
}
