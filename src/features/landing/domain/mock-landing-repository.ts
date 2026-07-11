// src/features/landing/infrastructure/mock-landing-repository.ts

import type { ILandingRepository } from '../domain/landing-repository';
import type { LandingData } from '../domain/landing.data';
import {
  STATS,
  PILLAR_FEATURES,
  ROADMAP_STEPS,
  PODIUM,
  LEADERBOARD,
  TESTIMONIALS,
  FAQS,
} from '../domain/landing.data';

/**
 * Mock implementation of ILandingRepository.
 * Later replace with a real HTTP repository.
 */
export class MockLandingRepository implements ILandingRepository {
  private cache: LandingData | null = null;

  async getLandingData(): Promise<LandingData> {
    if (this.cache) return this.cache;

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    const data: LandingData = {
      stats: STATS,
      pillarFeatures: PILLAR_FEATURES,
      roadmapSteps: ROADMAP_STEPS,
      podium: PODIUM,
      leaderboard: LEADERBOARD,
      testimonials: TESTIMONIALS,
      faqs: FAQS,
    };
    this.cache = data;
    return data;
  }
}
