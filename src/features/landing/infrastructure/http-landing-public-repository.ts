import type { ILandingPublicRepository } from '../domain/landing-repository';
import { getLandingData } from '@/core/api/landing.api';
import { TESTIMONIALS, PODIUM, LEADERBOARD } from '../domain/landing.data';

export class HttpLandingPublicRepository implements ILandingPublicRepository {
  async getStats() {
    const res = await getLandingData();
    return res.data.data.stats;
  }

  async getTestimonials() {
    return TESTIMONIALS;
  }

  async getLeaderboard() {
    return { podium: PODIUM, leaderboard: LEADERBOARD };
  }
}
