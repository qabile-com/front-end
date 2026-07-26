// src/features/dashboard/domain/roadmap.types.ts

export interface RoadmapStepDetail {
  id: string;
  title: string;
  type: 'lesson' | 'exercise';
  introText: string;
  xpReward: number;
  /** Only for lessons */
  contentText?: string;
  /** Only for exercises */
  steps?: { id: string; text: string }[];
}
