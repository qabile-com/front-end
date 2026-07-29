import { HttpHomeRepository } from './http/http-home-repository';
import { HttpRoadmapStepRepository } from './http/http-roadmap-step-repository';

export const homeRepo = new HttpHomeRepository();
export const roadmapStepRepo = new HttpRoadmapStepRepository();
