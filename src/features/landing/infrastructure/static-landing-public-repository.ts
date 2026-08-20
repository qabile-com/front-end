import type { ILandingPublicRepository } from '../domain/landing-repository';
import { LEADERBOARD, PODIUM, TESTIMONIALS } from '../domain/landing.data';

export class StaticLandingPublicRepository implements ILandingPublicRepository {
  async getStats() {
    return {
      activeMembersCount: 52000,
      completedLessonsAndCoursesCount: 890000,
      completedLessonsCount: 880000,
      completedCoursesCount: 10000,
    };
  }

  async getTestimonials() {
    return TESTIMONIALS;
  }

  async getLeaderboard() {
    return { podium: PODIUM, leaderboard: LEADERBOARD };
  }
}
