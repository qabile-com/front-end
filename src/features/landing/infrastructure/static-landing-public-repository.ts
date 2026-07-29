import type { ILandingPublicRepository } from '../domain/landing-repository';
import { LEADERBOARD, PODIUM, TESTIMONIALS } from '../domain/landing.data';

export class StaticLandingPublicRepository implements ILandingPublicRepository {
  async getStats() {
    return { totalMembers: 52000, rating: 4.9 };
  }

  async getTestimonials() {
    return TESTIMONIALS;
  }

  async getLeaderboard() {
    return { podium: PODIUM, leaderboard: LEADERBOARD };
  }
}
