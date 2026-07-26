import { MockSocialRepository } from './mock/mock-social-repository';
import { HttpSocialRepository } from './http/http-social-repository';
import { MockAdminRepository } from './mock/mock-admin-repository';
import { HttpAdminRepository } from './http/http-admin-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const socialRepo = isMock ? new MockSocialRepository() : new HttpSocialRepository();
export const adminRepo = isMock ? new MockAdminRepository() : new HttpAdminRepository();
