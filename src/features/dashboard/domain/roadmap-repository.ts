// src/features/dashboard/domain/roadmap-repository.ts

import type { RoadmapStepDetail } from './roadmap.types';
import type { ActionRewardResult } from './dashboard.types';

export interface IRoadmapStepRepository {
  getStepDetail(stepId: number): Promise<RoadmapStepDetail>;
  completeStep(stepId: number): Promise<ActionRewardResult>;
}
