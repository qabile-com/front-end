import type { ILandingPublicRepository } from '../domain/landing-repository';
import type { PodiumPlace, PodiumTone, LeaderboardRow } from '../domain/landing.types';
import { getLandingData, type LandingLeaderboardRowDto } from '@/core/api/landing.api';
import { TESTIMONIALS } from '../domain/landing.data';

const FALLBACK_AVATAR = 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)';
const PODIUM_TONES: PodiumTone[] = ['gold', 'silver', 'bronze'];

export class HttpLandingPublicRepository implements ILandingPublicRepository {
  async getStats() {
    const res = await getLandingData();
    return res.data.data.stats;
  }

  async getTestimonials() {
    return TESTIMONIALS;
  }

  async getLeaderboard() {
    const res = await getLandingData();
    const rows = res.data.data.leaderboard;

    const topThree = rows.slice(0, 3).map((row, index) => ({
      rank: row.rank,
      name: normalizeLandingName(row),
      score: row.xp,
      tag: row.title,
      avatar: row.avatar ?? FALLBACK_AVATAR,
      tone: PODIUM_TONES[index] ?? 'bronze',
    }));
    // Podium is a 3-col RTL grid, so DOM order maps to right/middle/left - reorder to
    // [3rd, 1st, 2nd] so rank 1 lands in the middle, rank 2 on the left, rank 3 on the right.
    const podium: PodiumPlace[] = [topThree[2], topThree[0], topThree[1]].filter(
      (place): place is PodiumPlace => Boolean(place),
    );

    const leaderboard: LeaderboardRow[] = rows.slice(3).map((row) => ({
      rank: row.rank,
      name: normalizeLandingName(row),
      tag: row.title,
      level: row.level,
      points: row.xp.toLocaleString('en-US'),
      delta: 0,
      direction: 'up',
      avatar: row.avatar ?? FALLBACK_AVATAR,
    }));

    return { podium, leaderboard };
  }
}

function normalizeLandingName(row: LandingLeaderboardRowDto) {
  return (
    row.displayName?.trim() ||
    [row.firstName, row.lastName].filter(Boolean).join(' ').trim() ||
    row.username?.trim() ||
    'کاربر قبیله'
  );
}
