import { DashboardPageShell, Skeleton } from '@/shared/ui';

export default function RoadmapStepLoading() {
  return (
    <DashboardPageShell
      size="narrow"
      className="min-h-[520px] sm:h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-7.5rem)]"
    >
      <div
        className="mx-auto flex w-full max-w-[820px] flex-col overflow-hidden rounded-none border border-transparent bg-black shadow-[0_28px_90px_-54px_var(--glow)] sm:h-full sm:rounded-[24px] sm:border-[rgba(255,98,0,.24)] lg:max-w-[860px]"
        aria-label="در حال بارگذاری مرحله"
        role="status"
      >
        <div className="border-hair flex items-center justify-between border-b p-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-20 rounded-full" />
        </div>
        <div className="space-y-5 p-5 pb-38 sm:flex-1 sm:overflow-hidden sm:pb-5">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-56 w-full rounded-[18px]" />
        </div>
        <div className="border-hair hidden items-center justify-between border-t p-5 sm:flex">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-80 border-t border-[rgba(255,98,0,.08)] bg-black/95 px-3.5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-[920px] min-w-0 items-center gap-3">
            <Skeleton className="h-5 flex-1 rounded-full" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
