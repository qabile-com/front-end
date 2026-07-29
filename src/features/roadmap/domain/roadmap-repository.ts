import type {
  ActiveRoadmap,
  CompleteRoadmapStepInput,
  CompleteRoadmapStepResult,
  RoadmapListResult,
} from './roadmap.types';

export interface IRoadmapRepository {
  getActiveRoadmap(): Promise<ActiveRoadmap>;
  getRoadmaps(params?: { limit?: number; offset?: number; q?: string }): Promise<RoadmapListResult>;
  completeStep(input: CompleteRoadmapStepInput): Promise<CompleteRoadmapStepResult>;
}
