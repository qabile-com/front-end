'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IRoadmapStepRepository } from '../domain/roadmap-repository';

export function useCompleteRoadmapStep(repo: IRoadmapStepRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stepId: number) => repo.completeStep(stepId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
    },
  });
}
