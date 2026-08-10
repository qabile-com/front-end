import { DashboardPageShell, Skeleton } from '@/shared/ui';

export function FriendsPageSkeleton() {
  return (
    <DashboardPageShell size="wide">
      <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Skeleton className="h-56 rounded-[28px]" />
          <Skeleton className="h-64 rounded-[24px]" />
          <Skeleton className="h-80 rounded-[24px]" />
        </div>
        <div className="hidden space-y-4 xl:block">
          <Skeleton className="h-52 rounded-[22px]" />
          <Skeleton className="h-40 rounded-[22px]" />
        </div>
      </div>
    </DashboardPageShell>
  );
}
