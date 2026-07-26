import { MockProfileRepository } from '@/features/dashboard/infrastructure/mock/mock-dashboard-repository';
import { HttpProfileRepository } from './http/http-profile-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const profileRepo = isMock ? new MockProfileRepository() : new HttpProfileRepository();
