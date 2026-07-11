import type { LandingData } from './landing.data';

export interface ILandingRepository {
  getLandingData(): Promise<LandingData>;
}
