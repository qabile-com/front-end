// http-season-repository.ts
import { getCurrentSeason } from '@/core/api/seasons.api';
import type { ISeasonRepository } from '../../domain/season-repository';

export class HttpSeasonRepository implements ISeasonRepository {
  async getCurrentSeason() {
    const res = await getCurrentSeason();
    return res.data;
  }
}
