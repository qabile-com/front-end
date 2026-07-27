'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { clearAuthSession } from '@/core/auth/token';
import { useAuthGuard } from '@/features/auth/application/use-auth-guard';
import { NAV, TAB_TITLES } from '../../domain/dashboard.data';
import type { Achievement, DashboardTab } from '../../domain/dashboard.types';
import { useUser } from '../../application/use-user';
import { userRepo } from '../../infrastructure/repository-factory';
import { AchievementEarnedModal } from '@/features/profile/presentation/components/achievement-earned-modal';
import { DashboardError, DashboardLoader } from '../components/dashboard-loading';
import { XpEarnedModal } from '@/features/profile/presentation/components/xp-earned-modal';
import { DashboardSidebar } from '../sections/dashboard-sidebar';
import { MobileHeader } from '../sections/mobile-header';
import { MobileNav } from '../sections/mobile-nav';
import { MobileOnboarding } from '@/features/onboarding/presentation/mobile-onboarding';

interface DashboardLayoutProps {
  children: ReactNode;
}

const ROUTE_TO_TAB: Array<{ prefix: string; tab: DashboardTab }> = [
  { prefix: '/ai', tab: 'home' },
  { prefix: '/home', tab: 'home' },
  { prefix: '/leaderboard', tab: 'lb' },
  { prefix: '/social', tab: 'social' },
  { prefix: '/courses', tab: 'courses' },
  { prefix: '/profile', tab: 'profile' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  useAuthGuard();

  const [signupXp, setSignupXp] = useState<number | null>(null);
  const [signupAchievements, setSignupAchievements] = useState<Achievement[] | null>(null);
  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUser(userRepo);

  const activeTab = useMemo(() => {
    return ROUTE_TO_TAB.find((route) => pathname.startsWith(route.prefix))?.tab ?? 'courses';
  }, [pathname]);

  const activeHref =
    activeTab === 'lb' ? '/leaderboard' : activeTab === 'home' ? '/home' : `/${activeTab}`;

  const title = TAB_TITLES[activeTab] ?? '';

  useEffect(() => {
    if (userError) {
      clearAuthSession();
      router.replace('/auth');
    }
  }, [userError, router]);

  useEffect(() => {
    if (!user) return;

    const rewardStr = sessionStorage.getItem('signupReward');
    if (rewardStr) {
      const reward = JSON.parse(rewardStr) as { xpGranted?: number; xp?: number };
      const xp = reward.xpGranted ?? reward.xp ?? null;
      sessionStorage.removeItem('signupReward');
      queueMicrotask(() => setSignupXp(xp));
    }

    const achievementsStr = sessionStorage.getItem('signupAchievements');
    if (achievementsStr) {
      const achievements = JSON.parse(achievementsStr) as Achievement[];
      sessionStorage.removeItem('signupAchievements');
      queueMicrotask(() => setSignupAchievements(achievements));
    }
  }, [user]);

  if (userLoading) return <DashboardLoader />;
  if (userError) return <DashboardError error={userError} onRetry={() => void refetchUser()} />;
  if (!user) return <DashboardLoader />;

  return (
    <div className="dashboard-scope min-h-screen max-w-full overflow-x-clip [background:radial-gradient(50%_40%_at_80%_-5%,rgba(255,98,0,.08),transparent_55%),radial-gradient(40%_35%_at_10%_8%,rgba(243,186,99,.04),transparent_55%),var(--color-bg)]">
      <DashboardSidebar activeHref={activeHref} user={user} nav={NAV} />

      <main className="flex min-h-screen min-w-0 max-w-full flex-col overflow-x-clip lg:ms-65">
        <header className="border-hair sticky top-0 z-40 hidden h-16 items-center justify-between border-b px-8 [backdrop-filter:blur(20px)] [background:rgba(5,3,2,.85)] lg:flex">
          <h1 className="text-lg font-black">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-ember border-hair inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.75 text-[13px] font-extrabold [background:var(--glass-2)]">
              <Icon name="flame" size={16} />
              {toPersianDigits(user.streak ?? 0)} روز
            </span>
            <button
              type="button"
              aria-label="اعلان‌ها"
              className="text-ink-3 border-hair hover:text-gold hover:border-hair-2 grid size-9.5 place-items-center rounded-xl border transition-colors [background:var(--glass-2)]"
            >
              <Icon name="bell" size={18} />
            </button>
          </div>
        </header>

        <MobileHeader title={title} level={user.level} streak={user.streak} />

        <div className="min-w-0 flex-1 overflow-x-clip overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <MobileNav activeHref={activeHref} />
      <MobileOnboarding />

      {signupXp !== null && (
        <XpEarnedModal
          xp={signupXp}
          description="آتش خوش‌آمدگویی به حسابت اضافه شد."
          onClose={() => setSignupXp(null)}
        />
      )}

      {signupAchievements && signupAchievements.length > 0 && (
        <AchievementEarnedModal
          achievement={signupAchievements[0]}
          onClose={() =>
            setSignupAchievements((prev) => (prev && prev.length > 1 ? prev.slice(1) : null))
          }
        />
      )}
    </div>
  );
}
