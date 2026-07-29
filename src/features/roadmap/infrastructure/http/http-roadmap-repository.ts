import {
  completeRoadmapStep,
  completeRoadmapStepByRoadmap,
  getActiveRoadmap,
  getRoadmap,
  getRoadmaps,
} from '@/core/api/roadmap.api';
import { ApiError } from '@/core/api/http-client';
import type { RoadmapStatus } from '@/features/dashboard/domain/dashboard.types';
import type { IRoadmapRepository } from '../../domain/roadmap-repository';
import type {
  ActiveRoadmap,
  CompleteRoadmapStepInput,
  CompleteRoadmapStepResult,
  RoadmapListResult,
  RoadmapStepProgress,
} from '../../domain/roadmap.types';
import { STATIC_ROADMAP_STEPS } from '../../domain/static-roadmap-steps';

const DEFAULT_LIMIT = 10;

export class HttpRoadmapRepository implements IRoadmapRepository {
  async getActiveRoadmap(): Promise<ActiveRoadmap> {
    try {
      const res = await getActiveRoadmap();
      return normalizeActiveRoadmap(res.data);
    } catch (error) {
      if (!shouldUseLegacyRoadmapFallback(error)) throw error;
      const res = await getRoadmap({ limit: STATIC_ROADMAP_STEPS.length, offset: 0 });
      return normalizeLegacyActiveRoadmap(res.data);
    }
  }

  async getRoadmaps(params?: { limit?: number; offset?: number; q?: string }): Promise<RoadmapListResult> {
    try {
      const res = await getRoadmaps(params);
      return normalizeRoadmapList(res.data, params);
    } catch (error) {
      if (!shouldUseLegacyRoadmapFallback(error)) throw error;
      const res = await getRoadmap(params);
      const active = normalizeLegacyActiveRoadmap(res.data);
      return {
        roadmaps: [active],
        meta: normalizeMeta(res.data?.meta, params, 1),
      };
    }
  }

  async completeStep(input: CompleteRoadmapStepInput): Promise<CompleteRoadmapStepResult> {
    try {
      if (input.roadmapId) {
        const res = await completeRoadmapStepByRoadmap(input.roadmapId, input.stepId);
        return normalizeCompleteResult(res.data);
      }
    } catch (error) {
      if (!shouldUseLegacyRoadmapFallback(error)) throw error;
    }

    const res = await completeRoadmapStep(input.num);
    return normalizeCompleteResult(res.data);
  }
}

function shouldUseLegacyRoadmapFallback(error: unknown) {
  return error instanceof ApiError && [404, 405].includes(error.statusCode ?? 0);
}

function normalizeRoadmapList(
  payload: unknown,
  params?: { limit?: number; offset?: number; q?: string },
): RoadmapListResult {
  const raw = payload as { data?: unknown; meta?: unknown };
  const rows = Array.isArray(raw.data) ? raw.data : [];

  return {
    roadmaps: rows.map((item, index) => normalizeRoadmapSummary(item, index)),
    meta: normalizeMeta(raw.meta, params, rows.length),
  };
}

function normalizeActiveRoadmap(payload: unknown): ActiveRoadmap {
  const raw = unwrapData(payload);
  return normalizeRoadmapSummary(raw, 0, true);
}

function normalizeLegacyActiveRoadmap(payload: unknown): ActiveRoadmap {
  const raw = payload as { data?: unknown; meta?: unknown };
  const steps = Array.isArray(raw.data)
    ? raw.data.map((item, index) => normalizeStep(item, index))
    : [];

  return {
    id: 'personal-growth-v1',
    slug: 'personal-growth-v1',
    title: 'نقشه راه رشد فردی',
    description: 'مسیر فعال رشد شخصی تو در قبیله ققنوس.',
    isActive: true,
    totalSteps: steps.length || STATIC_ROADMAP_STEPS.length,
    completedSteps: steps.filter((step) => step.status === 'done').length,
    totalXp: steps.reduce((sum, step) => sum + step.xp, 0),
    status: steps.every((step) => step.status === 'done') ? 'done' : 'in_progress',
    steps,
  };
}

function normalizeRoadmapSummary(payload: unknown, index: number, forceActive = false): ActiveRoadmap {
  const item = payload as Record<string, unknown>;
  const rawSteps = Array.isArray(item.steps) ? item.steps : [];
  const steps = rawSteps.map((step, stepIndex) => normalizeStep(step, stepIndex));
  const totalSteps = numberOr(item.totalSteps, steps.length || STATIC_ROADMAP_STEPS.length);
  const completedSteps = numberOr(
    item.completedSteps,
    steps.filter((step) => step.status === 'done').length,
  );

  return {
    id: stringOr(item.id, stringOr(item.roadmapId, `roadmap-${index + 1}`)),
    slug: optionalString(item.slug),
    title: stringOr(item.title, index === 0 ? 'نقشه راه رشد فردی' : `نقشه راه ${index + 1}`),
    description: optionalString(item.description),
    isActive: forceActive || Boolean(item.isActive ?? item.active),
    totalSteps,
    completedSteps,
    totalXp: numberOr(
      item.totalXp ?? item.xp,
      steps.reduce((sum, step) => sum + step.xp, 0),
    ),
    status: normalizeRoadmapState(item.status, completedSteps, totalSteps),
    steps,
  };
}

function normalizeStep(payload: unknown, index: number): RoadmapStepProgress {
  const item = payload as Record<string, unknown>;
  const num = numberOr(item.num ?? item.order, index + 1);
  const staticStep = STATIC_ROADMAP_STEPS.find((step) => step.id === num);

  return {
    id: stringOr(item.id ?? item.stepId, staticStep?.id ? String(staticStep.id) : String(num)),
    num,
    type: stringOr(item.type, staticStep?.type ?? ''),
    title: stringOr(item.title, staticStep?.title ?? ''),
    xp: numberOr(item.xp, staticStep?.xp ?? 0),
    status: normalizeStepStatus(item.status),
    completedAt: optionalString(item.completedAt),
  };
}

function normalizeCompleteResult(payload: unknown): CompleteRoadmapStepResult {
  const raw = unwrapData(payload) as Record<string, unknown>;
  const reward = (raw.reward ?? raw) as CompleteRoadmapStepResult;

  return {
    ...reward,
    roadmap: raw.roadmap ? normalizeActiveRoadmap(raw.roadmap) : undefined,
    step: raw.step ? normalizeStep(raw.step, 0) : undefined,
  };
}

function normalizeStepStatus(status: unknown): RoadmapStatus {
  if (status === 'done' || status === 'completed' || status === 'complete') return 'done';
  if (status === 'current' || status === 'in_progress' || status === 'active') return 'current';
  return 'next';
}

function normalizeRoadmapState(status: unknown, completed: number, total: number) {
  if (status === 'done' || status === 'completed') return 'done';
  if (status === 'not_started') return 'not_started';
  if (completed >= total && total > 0) return 'done';
  return completed > 0 ? 'in_progress' : 'not_started';
}

function normalizeMeta(
  payload: unknown,
  params?: { limit?: number; offset?: number; q?: string },
  fallbackTotal = 0,
) {
  const meta = payload as Record<string, unknown> | undefined;
  const limit = numberOr(meta?.limit, params?.limit ?? DEFAULT_LIMIT);
  const offset = numberOr(meta?.offset, params?.offset ?? 0);
  const totalItems = numberOr(meta?.totalItems ?? meta?.total, fallbackTotal);

  return {
    limit,
    offset,
    totalItems,
    totalPages: numberOr(meta?.totalPages, limit > 0 ? Math.max(1, Math.ceil(totalItems / limit)) : 1),
  };
}

function unwrapData(payload: unknown) {
  const raw = payload as { data?: unknown };
  return raw?.data ?? payload;
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function numberOr(value: unknown, fallback: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
