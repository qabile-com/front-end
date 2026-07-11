// src/features/dashboard/domain/roadmap-repository.ts

import type { RoadmapStepDetail } from './roadmap.types';

export interface IRoadmapStepRepository {
  getStepDetail(stepId: number): Promise<RoadmapStepDetail>;
}
