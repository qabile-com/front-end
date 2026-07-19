// http-courses-repository.ts
import { getCourses } from '@/core/api/courses.api';
import type { ICoursesRepository } from '../../domain/dashboard-repository';

export class HttpCoursesRepository implements ICoursesRepository {
  async getCourses() {
    const res = await getCourses();
    return res.data.data;
  }
}
