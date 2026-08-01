'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatPersianNumber, toPersianDigits } from '@/core/lib/persian';
import { clearAuthSession } from '@/core/auth/token';
import { createAuthRedirectHref } from '@/core/auth/redirect';
import { useAuthGuard } from '@/features/auth/application/use-auth-guard';
import { showError } from '@/shared/lib/toast';
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
import {
  DISMISS_USER_KEY,
  FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY,
  InstallAppModal,
} from '@/features/landing/presentation/components/install-app-modal';

interface DashboardLayoutProps {
  children: ReactNode;
}

const ROUTE_TO_TAB: Array<{ prefix: string; tab: DashboardTab }> = [
  { prefix: '/ai', tab: 'home' },
  { prefix: '/roadmap', tab: 'home' },
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
  const queryClient = useQueryClient();
  useAuthGuard();

  const [signupXp, setSignupXp] = useState<number | null>(null);
  const [signupAchievements, setSignupAchievements] = useState<Achievement[] | null>(null);
  const [shouldShowInstallAfterSignupXp, setShouldShowInstallAfterSignupXp] = useState(false);
  const [installPromptOpen, setInstallPromptOpen] = useState(false);
  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUser(userRepo);
  const completeOnboarding = useMutation({
    mutationFn: () => userRepo.updateOnboardingCompletion(true),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['dashboard', 'user', 'current'], updatedUser);
    },
  });

  const activeTab = useMemo(() => {
    return ROUTE_TO_TAB.find((route) => pathname.startsWith(route.prefix))?.tab ?? 'courses';
  }, [pathname]);

  const activeHref =
    activeTab === 'lb' ? '/leaderboard' : activeTab === 'home' ? '/home' : `/${activeTab}`;

  const title = TAB_TITLES[activeTab] ?? '';
  const showAiChatAction = pathname.startsWith('/home');

  useEffect(() => {
    if (!userError) return;

    const statusCode = (userError as { statusCode?: number })?.statusCode;
    if (statusCode === 401) {
      clearAuthSession();
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.replace(createAuthRedirectHref(currentPath));
    } else {
      showError('خطا در اتصال به سرور. لطفا دوباره تلاش کنید.');
    }
  }, [router, userError]);

  useEffect(() => {
    if (!user) return;

    const rewardStr = sessionStorage.getItem('signupReward');
    if (rewardStr) {
      const reward = JSON.parse(rewardStr) as { xpGranted?: number; xp?: number };
      const xp = reward.xpGranted ?? reward.xp ?? null;
      sessionStorage.removeItem('signupReward');
      const shouldShowInstallPrompt = sessionStorage.getItem('showInstallAfterFirstLoginReward') === '1';
      sessionStorage.removeItem('showInstallAfterFirstLoginReward');
      if (shouldShowInstallPrompt && canShowFirstLoginInstallPrompt(user.id)) {
        queueMicrotask(() => setShouldShowInstallAfterSignupXp(true));
      }
      queueMicrotask(() => setSignupXp(xp));
    }

    const achievementsStr = sessionStorage.getItem('signupAchievements');
    if (achievementsStr) {
      const achievements = JSON.parse(achievementsStr) as Achievement[];
      sessionStorage.removeItem('signupAchievements');
      queueMicrotask(() => setSignupAchievements(achievements));
    }
  }, [user]);

  useEffect(() => {
    if (!shouldShowInstallAfterSignupXp || signupXp !== null || signupAchievements?.length) return;

    queueMicrotask(() => {
      setShouldShowInstallAfterSignupXp(false);
      setInstallPromptOpen(true);
    });
  }, [shouldShowInstallAfterSignupXp, signupAchievements?.length, signupXp]);

  const isHomePage = pathname === '/home';

  if (userLoading && !isHomePage) return <DashboardLoader />;
  if (userError && !isHomePage) return <DashboardError error={userError} onRetry={() => void refetchUser()} />;
  if (!user && !isHomePage) return <DashboardLoader />;

  const isHomePage = pathname === '/home';
  const showChrome = !isHomePage || (!userLoading && user);

  if (userLoading && !isHomePage) return <DashboardLoader />;
  if (userError && !isHomePage) return <DashboardError error={userError} onRetry={() => void refetchUser()} />;
  if (!user && !isHomePage) return <DashboardLoader />;

  return (
    <div className="dashboard-scope min-h-screen max-w-full overflow-x-clip [background:var(--color-bg)]">
      {showChrome && <DashboardSidebar activeHref={activeHref} user={user} nav={NAV} />}

      <main className={cn('flex min-h-screen max-w-full min-w-0 flex-col overflow-x-clip', showChrome ? 'lg:ms-65' : '')}>
        {showChrome && (
          <header className="border-hair sticky top-0 z-40 hidden h-16 items-center justify-between border-b px-8 pt-[env(safe-area-inset-top)] [backdrop-filter:blur(20px)] [background:rgba(5,3,2,.85)] lg:flex">
            <h1 className="text-lg font-black">{title}</h1>
            <div className="flex items-center gap-3">
              {/* {showAiChatAction && (
                <Link
                  href="/ai"
                  className="text-ink border-hair hover:border-hair-2 hover:text-gold inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-[13px] font-extrabold transition-[transform,border-color,color,box-shadow] duration-300 [background:var(--glass-2)] hover:-translate-y-0.5 hover:shadow-[0_12px_34px_-18px_var(--glow)]"
                >
                  <Icon name="adam-chat" size={20} />
                  چت با آدم
                </Link>
              )} */}
              <span className="text-ember border-hair inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.75 text-[13px] font-extrabold [background:var(--glass-2)]">
                <Icon name="flame" size={16} />
                {toPersianDigits(user.streak ?? 0)} روز
              </span>
              <span className="text-ember border-hair inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-extrabold [background:var(--glass-2)]">
                {formatPersianNumber(user.xp)}
                <Icon name="flame" size={18} />
              </span>
            </div>
          </header>
        )}

        {showChrome && <MobileHeader title={title} user={user} showAiChatAction={showAiChatAction} />}

        <div className="min-w-0 flex-1 overflow-x-clip">
          <div className="overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
            <motion.div
              key={pathname}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>

      <MobileNav activeHref={activeHref} />
      <MobileOnboarding
        isComplete={user.isCompleteOnboarding}
        onComplete={async () => {
          await completeOnboarding.mutateAsync();
        }}
      />

      {signupXp !== null && (
        <XpEarnedModal
          xp={signupXp}
          description="آتش خوش‌آمدگویی به حسابت اضافه شد."
          onClose={() => {
            setSignupXp(null);
          }}
        />
      )}

      <InstallAppModal
        isOpen={installPromptOpen}
        markFirstLoginPromptAsSeen
        currentUserId={user.id}
        onClose={() => setInstallPromptOpen(false)}
      />

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

function canShowFirstLoginInstallPrompt(currentUserId?: string | null) {
  if (typeof window === 'undefined') return false;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && window.navigator.standalone === true);
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const alreadySeen = window.localStorage.getItem(FIRST_LOGIN_INSTALL_PROMPT_SEEN_KEY) === '1';

  if (!isMobile || isStandalone || alreadySeen) {
    if (currentUserId) {
      const dismissedUserId = window.localStorage.getItem(DISMISS_USER_KEY) ?? '';
      if (dismissedUserId && dismissedUserId !== currentUserId) {
        return true;
      }
    }
    return false;
  }

  return true;
}
