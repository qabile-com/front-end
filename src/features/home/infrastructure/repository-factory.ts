import { MockHomeRepository } from '@/features/dashboard/infrastructure/mock/mock-dashboard-repository';
import { HttpHomeRepository } from './http/http-home-repository';
import { MockRoadmapStepRepository } from './mock/mock-roadmap-repository';
import { HttpRoadmapStepRepository } from './http/http-roadmap-step-repository';

const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';

export const homeRepo = isMock ? new MockHomeRepository() : new HttpHomeRepository();
export const roadmapStepRepo = isMock
  ? new MockRoadmapStepRepository()
  : new HttpRoadmapStepRepository();
