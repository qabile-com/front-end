import type {
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '../../domain/dashboard.types';
import type { CoursePart } from '../../domain/courses.data';

const COMPLETION_THRESHOLD = 80;

interface StoredWatchState {
  progress: number;
  watchedSeconds: number;
  status: CoursePart['status'];
  completedAt: string | null;
  xpGrantedAt: string | null;
  rewardReturned: boolean;
}

const watchState = new Map<string, StoredWatchState>();

export function applyMockWatchState(part: CoursePart): CoursePart {
  const state = watchState.get(part.id);
  if (!state) return part;

  return {
    ...part,
    status: state.status,
    progress: state.progress,
    watchedSeconds: state.watchedSeconds,
    completedAt: state.completedAt,
    xpGrantedAt: state.xpGrantedAt,
  };
}

export function recordMockWatchProgress(
  sectionId: string,
  input: SectionWatchProgressInput,
): SectionWatchProgressResult {
  const previous = watchState.get(sectionId);
  const duration = Math.max(1, Math.floor(input.duration || 1));
  const watchedSeconds = Math.min(duration, Math.floor(calculateWatchedSeconds(input)));
  const progress = Math.min(100, Math.floor((watchedSeconds / duration) * 100));
  const wasDone = previous?.status === 'done';
  const isDone = wasDone || progress >= COMPLETION_THRESHOLD;
  const now = new Date().toISOString();
  const completedAt = previous?.completedAt ?? (isDone ? now : null);
  const xpGrantedAt = previous?.xpGrantedAt ?? (isDone ? now : null);
  const rewardShouldReturn = isDone && !previous?.rewardReturned;

  const nextState: StoredWatchState = {
    progress: isDone ? 100 : Math.max(previous?.progress ?? 0, progress),
    watchedSeconds: Math.max(previous?.watchedSeconds ?? 0, watchedSeconds),
    status: isDone ? 'done' : progress > 0 ? 'partial' : 'none',
    completedAt,
    xpGrantedAt,
    rewardReturned: previous?.rewardReturned || rewardShouldReturn,
  };

  watchState.set(sectionId, nextState);

  return {
    section: {
      id: sectionId,
      status: nextState.status,
      progress: nextState.progress,
      watchedSeconds: nextState.watchedSeconds,
      completedAt: nextState.completedAt,
      xpGrantedAt: nextState.xpGrantedAt,
    },
    reward: rewardShouldReturn
      ? {
          xpGranted: 50,
          streak: {
            increased: true,
            previous: 23,
            current: 24,
            freezesRemaining: 2,
          },
          achievements:
            sectionId === 'c1-s1'
              ? [
                  {
                    icon: 'flame',
                    label: 'آتش‌افروز',
                    unlocked: true,
                    slug: 'atash-afrooz',
                    count: 1,
                    isShareable: true,
                    conditions: [
                      {
                        id: 'first-exercise',
                        label: 'انجام اولین تمرین',
                        passed: true,
                      },
                    ],
                  },
                ]
              : [],
        }
      : null,
  };
}

function calculateWatchedSeconds(input: SectionWatchProgressInput) {
  if (input.watchedRanges.length === 0) {
    return input.maxWatchedTime;
  }

  const ranges = input.watchedRanges
    .map((range) => ({
      start: Math.max(0, Math.min(range.start, input.duration)),
      end: Math.max(0, Math.min(range.end, input.duration)),
    }))
    .filter((range) => range.end > range.start)
    .sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (!last || range.start > last.end + 1) {
      merged.push({ ...range });
    } else {
      last.end = Math.max(last.end, range.end);
    }
  }

  return merged.reduce((sum, range) => sum + range.end - range.start, 0);
}
