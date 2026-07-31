import type {
  ActiveRoadmap,
  CompleteRoadmapStepInput,
  CompleteRoadmapStepResult,
  RoadmapListResult,
} from './roadmap.types';

export interface IRoadmapRepository {
  getActiveRoadmap(options?: { signal?: AbortSignal }): Promise<ActiveRoadmap>;
  getRoadmaps(params?: { limit?: number; offset?: number; q?: string }, options?: { signal?: AbortSignal }): Promise<RoadmapListResult>;
  completeStep(input: CompleteRoadmapStepInput): Promise<CompleteRoadmapStepResult>;
}
