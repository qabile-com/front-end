// http-roadmap-step-repository.ts
import { getRoadmapStep } from '@/core/api/roadmap.api';
import type { IRoadmapStepRepository } from '../../domain/roadmap-repository';
import type { RoadmapStepDetail } from '../../domain/roadmap.types';

export class HttpRoadmapStepRepository implements IRoadmapStepRepository {
  async getStepDetail(stepId: number): Promise<RoadmapStepDetail> {
    const res = await getRoadmapStep(stepId);
    return res.data;
  }
}
