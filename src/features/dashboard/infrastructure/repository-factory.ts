import { MockUserRepository } from './mock/mock-dashboard-repository';
import { HttpUserRepository } from './http/http-user-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const userRepo = isMock ? new MockUserRepository() : new HttpUserRepository();
