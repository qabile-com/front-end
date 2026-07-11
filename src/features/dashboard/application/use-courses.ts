// src/features/dashboard/application/use-courses.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import type { ICoursesRepository } from '../domain/dashboard-repository';
import type { Course } from '../domain/courses.data';

export function useCourses(repo: ICoursesRepository) {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    let cancelled = false;
    (async () => {
      try {
        const list = await repo.getCourses();
        if (!cancelled) {
          setCourses(list);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'خطا');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  return { courses, loading, error };
}
