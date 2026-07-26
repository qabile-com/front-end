import type { ReactNode } from 'react';
import { DashboardLayout } from '@/features/dashboard/presentation/layout/dashboard-layout';

export default function DashboardRouteLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
