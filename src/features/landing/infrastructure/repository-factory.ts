import { MockLandingPublicRepository } from './mock-landing-repository';
import { MockLandingUserRepository } from './mock-landing-user-repository';
// import { HttpLandingPublicRepository } from './http-landing-public-repository';
// import { HttpLandingUserRepository } from './http-landing-user-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const landingPublicRepo = true
  ? new MockLandingPublicRepository()
  : (() => {
      throw new Error('Real landing endpoints not implemented yet');
    })();

export const landingUserRepo = true
  ? new MockLandingUserRepository()
  : (() => {
      throw new Error('Real landing user endpoints not implemented yet');
    })();
