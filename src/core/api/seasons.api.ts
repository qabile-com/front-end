import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export const getCurrentSeason = () => httpClient.get('/api/v1/seasons/current');
