import type { RoadmapItem } from '@/features/dashboard/domain/dashboard.types';
import type { ActiveRoadmap, RoadmapStepProgress } from '../domain/roadmap.types';
import type { StaticRoadmapStep } from '../domain/static-roadmap-steps';
import { STATIC_ROADMAP_STEPS } from '../domain/static-roadmap-steps';

export function mergeStaticRoadmapWithProgress(
  activeRoadmap?: ActiveRoadmap | null,
): RoadmapItem[] {
  return STATIC_ROADMAP_STEPS.map((staticStep) => {
    const progress = findStepProgress(activeRoadmap, staticStep.id);

    return {
      num: staticStep.id,
      type: staticStep.type,
      title: staticStep.title,
      xp: staticStep.xp,
      status: progress?.status ?? staticStep.status,
    };
  });
}

export function mergeStaticStepWithProgress(
  staticStep: StaticRoadmapStep,
  activeRoadmap?: ActiveRoadmap | null,
): StaticRoadmapStep {
  const progress = findStepProgress(activeRoadmap, staticStep.id);
  if (!progress) return staticStep;

  return {
    ...staticStep,
    status: progress.status,
  };
}

export function findStepProgress(activeRoadmap: ActiveRoadmap | null | undefined, stepNum: number) {
  return activeRoadmap?.steps.find((step) => step.num === stepNum) ?? null;
}

export function getRoadmapStepBackendId(step: StaticRoadmapStep, activeRoadmap?: ActiveRoadmap | null) {
  return findStepProgress(activeRoadmap, step.id)?.id ?? step.id;
}

export function getRoadmapProgressPercent(roadmap: ActiveRoadmap | null | undefined) {
  if (!roadmap?.totalSteps) return 0;
  return Math.round((roadmap.completedSteps / roadmap.totalSteps) * 100);
}

export function getCompletedStepCount(steps: RoadmapStepProgress[] | undefined) {
  return steps?.filter((step) => step.status === 'done').length ?? 0;
}
