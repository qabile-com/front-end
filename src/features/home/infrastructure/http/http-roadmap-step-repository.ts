// http-roadmap-step-repository.ts
import { completeRoadmapStep, getRoadmapStep } from '@/core/api/roadmap.api';
import type { IRoadmapStepRepository } from '../../domain/roadmap-repository';
import type { RoadmapStepDetail } from '../../domain/roadmap.types';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';
import { normalizeActionRewardResult } from '@/features/dashboard/domain/achievement-normalizer';

export class HttpRoadmapStepRepository implements IRoadmapStepRepository {
  async getStepDetail(stepId: number): Promise<RoadmapStepDetail> {
    const res = await getRoadmapStep(stepId);
    return res.data;
  }

  async completeStep(stepId: number): Promise<ActionRewardResult> {
    const res = await completeRoadmapStep(stepId);
    return normalizeActionRewardResult(res.data) ?? {};
  }
}
