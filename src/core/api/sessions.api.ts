import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export const getCurrentSession = () => httpClient.get('/api/v1/seasons/current');
