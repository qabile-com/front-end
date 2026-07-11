import type { ISeasonRepository, SeasonData } from '../domain/season-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockSeasonRepository implements ISeasonRepository {
  async getCurrentSeason(): Promise<SeasonData> {
    await delay(200);

    const target = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);

    return {
      seasonName: 'فصل هفت',
      targetDate: target.toISOString(),
      pointsNeeded: 56465,
    };
  }
}
