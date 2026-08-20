import { MockSocialRepository } from './mock/mock-social-repository';
import { HttpAdminRepository } from './http/http-admin-repository';

// TEMP: mock data active for the rebirth badge/ring preview - switch back to HttpSocialRepository when done.
export const socialRepo = new MockSocialRepository();
export const adminRepo = new HttpAdminRepository();
