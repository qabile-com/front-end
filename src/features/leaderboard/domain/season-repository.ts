export interface SeasonData {
  seasonName: string;
  targetDate: string;
  pointsNeeded: number;
}

export interface ISeasonRepository {
  getCurrentSeason(): Promise<SeasonData>;
}
