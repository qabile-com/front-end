// 'use client';

// import { useState, useEffect } from 'react';
// import type { IDashboardRepository, DashboardData } from '../domain/dashboard-repository';

// export function useDashboardData(repository: IDashboardRepository) {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       try {
//         const result = await repository.getDashboardData();
//         if (!cancelled) {
//           setData(result);
//           setLoading(false);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(e instanceof Error ? e.message : 'خطا در دریافت اطلاعات داشبورد');
//           setLoading(false);
//         }
//       }
//     };
//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, [repository]);

//   return { data, loading, error };
// }
