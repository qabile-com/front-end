import { HttpLandingPublicRepository } from './http-landing-public-repository';
import { HttpLandingUserRepository } from './http-landing-user-repository';

export const landingPublicRepo = new HttpLandingPublicRepository();
export const landingUserRepo = new HttpLandingUserRepository();
