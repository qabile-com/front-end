import { HttpSocialRepository } from './http/http-social-repository';
import { HttpAdminRepository } from './http/http-admin-repository';

export const socialRepo = new HttpSocialRepository();
export const adminRepo = new HttpAdminRepository();
