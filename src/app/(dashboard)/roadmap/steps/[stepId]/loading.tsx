import { DashboardPageShell, Skeleton } from '@/shared/ui';

export default function RoadmapStepLoading() {
  return (
    <DashboardPageShell size="narrow">
      <div className="overflow-hidden rounded-[24px] border border-[rgba(255,98,0,.18)] bg-black">
        <div className="border-hair flex items-center justify-between border-b p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <div className="space-y-5 p-5">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-56 w-full rounded-[18px]" />
        </div>
        <div className="border-hair flex items-center justify-between border-t p-5">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </div>
    </DashboardPageShell>
  );
}
