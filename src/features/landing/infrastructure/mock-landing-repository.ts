import type { ILandingPublicRepository } from '../domain/landing-repository';
import { TESTIMONIALS, PODIUM, LEADERBOARD } from '../domain/landing.data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockLandingPublicRepository implements ILandingPublicRepository {
  async getStats() {
    await delay(200);
    return { totalMembers: 52000, rating: 4.9 };
  }
  async getTestimonials() {
    await delay(300);
    return TESTIMONIALS;
  }
  async getLeaderboard() {
    await delay(300);
    return { podium: PODIUM, leaderboard: LEADERBOARD };
  }
}
