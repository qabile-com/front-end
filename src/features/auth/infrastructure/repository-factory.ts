import { HttpAuthRepository } from './http-auth-repository';
import { MockAuthRepository } from './mock-auth-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export const authRepo = isMock ? new MockAuthRepository() : new HttpAuthRepository();
