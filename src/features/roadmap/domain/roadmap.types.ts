import type { ActionRewardResult, RoadmapStatus } from '@/features/dashboard/domain/dashboard.types';

export interface RoadmapStepProgress {
  id: string;
  num: number;
  type: string;
  title: string;
  xp: number;
  status: RoadmapStatus;
  completedAt?: string | null;
}

export interface RoadmapSummary {
  id: string;
  slug?: string;
  title: string;
  description?: string | null;
  isActive: boolean;
  totalSteps: number;
  completedSteps: number;
  totalXp: number;
  status?: 'not_started' | 'in_progress' | 'done';
  steps?: RoadmapStepProgress[];
}

export interface RoadmapListResult {
  roadmaps: RoadmapSummary[];
  meta: {
    limit: number;
    offset: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ActiveRoadmap extends RoadmapSummary {
  steps: RoadmapStepProgress[];
}

export interface CompleteRoadmapStepInput {
  roadmapId?: string | null;
  stepId: string | number;
  num: number;
}

export interface CompleteRoadmapStepResult extends ActionRewardResult {
  roadmap?: ActiveRoadmap;
  step?: RoadmapStepProgress;
}
