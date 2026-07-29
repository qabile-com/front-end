import { StaticLandingPublicRepository } from './static-landing-public-repository';
import { HttpLandingUserRepository } from './http-landing-user-repository';

export const landingPublicRepo = new StaticLandingPublicRepository();
export const landingUserRepo = new HttpLandingUserRepository();
