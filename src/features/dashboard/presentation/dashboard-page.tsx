'use client';

import { useEffect, useState } from 'react';
import { Icon, OptionalImage } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { TAB_TITLES, NAV } from '@/features/dashboard/domain/dashboard.data';
import type {
  Achievement,
  CurrentUser,
  DashboardTab,
} from '@/features/dashboard/domain/dashboard.types';
import { DashboardSidebar } from './sections/dashboard-sidebar';
import { MobileNav } from './sections/mobile-nav';
import { MobileHeader } from './sections/mobile-header';
import { HomeTab } from './sections/home-tab';
import { LeaderboardTab } from './sections/leaderboard-tab';
import { ProfileTab } from './sections/profile-tab';
import { SocialTab } from './sections/social-tab';
import { CoursesTab } from './sections/courses-tab';
import { useUser } from '../application/use-user';
import { useHomeData } from '../application/use-home-data';
import { useLeaderboard } from '../application/use-leaderboard';
import { useCourses } from '../application/use-courses';
import { useProfile } from '../application/use-profile';
import { Course } from '../domain/courses.data';

import { useSocialData } from '../application/use-social-data';
import { ActiveUser, Post } from '../domain/social.data';

import { useSeason } from '../application/use-season';
import {
  userRepo,
  homeRepo,
  leaderboardRepo,
  coursesRepo,
  profileRepo,
  socialRepo,
  userProfileRepo,
  seasonRepo,
} from '../infrastructure/repository-factory';
import { IUserProfileRepository } from '../domain/user-profile-repository';
import type { IProfileRepository } from '../domain/profile-repository';
import { useRouter } from 'next/navigation';
import { useAuthGuard } from '@/features/auth/application/use-auth-guard';
import { removeAccessToken } from '@/core/auth/token';
import { AchievementEarnedModal } from './components/achievement-earned-modal';
import { XpEarnedModal } from './components/xp-earned-modal';

export function DashboardPage() {
  const router = useRouter();
  useAuthGuard();
  const [tab, setTab] = useState<DashboardTab>('courses');
  const [signupXp, setSignupXp] = useState<number | null>(null);
  const [signupAchievements, setSignupAchievements] = useState<Achievement[] | null>(null);
  const [loadedTabs, setLoadedTabs] = useState<Set<DashboardTab>>(new Set(['courses']));

  const { user, loading: userLoading, error: userError, refetch: refetchUser } = useUser(userRepo);
  useEffect(() => {
    if (user) {
      const rewardStr = sessionStorage.getItem('signupReward');
      if (rewardStr) {
        const reward = JSON.parse(rewardStr);
        setSignupXp(reward.xpGranted || reward.xp);
        sessionStorage.removeItem('signupReward');
      }

      const achievementsStr = sessionStorage.getItem('signupAchievements');
      if (achievementsStr) {
        const achievements = JSON.parse(achievementsStr);
        setSignupAchievements(achievements);
        sessionStorage.removeItem('signupAchievements');
      }
    }
  }, [user]);
  // const {
  //   posts,
  //   tags,
  //   activeUsers,
  //   loading: socialLoading,
  //   error: socialError,
  //   publishPost,
  //   addComment,
  // } = useSocialData(socialRepo);
  // const { data: seasonData, loading: seasonLoading, error: seasonError } = useSeason(seasonRepo);

  // const home = useHomeData(homeRepo);
  // const lb = useLeaderboard(leaderboardRepo);
  const courses = useCourses(coursesRepo);
  const profile = useProfile(profileRepo);

  const title = TAB_TITLES[tab] ?? '';

  useEffect(() => {
    if (userError) {
      removeAccessToken();
      router.replace('/auth');
    }
  }, [userError, router]);

  // Mark tab as loaded on change
  const handleTabChange = (newTab: DashboardTab) => {
    setTab(newTab);
    setLoadedTabs((prev) => {
      if (prev.has(newTab)) return prev;
      const next = new Set(prev);
      next.add(newTab);
      return next;
    });
  };

  if (userLoading) return <DashboardLoader />;
  if (userError) return <DashboardError error={userError} onRetry={() => void refetchUser()} />;

  if (!user) return null;

  return (
    <div className="dashboard-scope min-h-screen [background:radial-gradient(50%_40%_at_80%_-5%,rgba(255,98,0,.08),transparent_55%),radial-gradient(40%_35%_at_10%_8%,rgba(243,186,99,.04),transparent_55%),var(--color-bg)]">
      {/* desktop sidebar */}
      <DashboardSidebar active={tab} onChange={handleTabChange} user={user} nav={NAV} />

      <main className="flex min-h-screen flex-col lg:ms-65">
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

        <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
          {/* {tab === 'home' && loadedTabs.has('home') && (
            <HomeTabWrapper
              user={user}
              loading={home.loading}
              error={home.error}
              data={home.data}
            />
          )} */}
          {/* {tab === 'lb' && loadedTabs.has('lb') && (
            <LeaderboardTabWrapper
              loading={lb.loading || seasonLoading}
              error={lb.error || seasonError}
              data={lb.data}
              seasonData={seasonData}
              userProfileRepo={userProfileRepo}
            />
          )} */}
          {/* {tab === 'social' && loadedTabs.has('social') && (
            <SocialTabWrapper
              loading={socialLoading}
              error={socialError}
              posts={posts}
              tags={tags}
              activeUsers={activeUsers}
              onPublish={publishPost}
              onAddComment={addComment}
            />
          )} */}
          {tab === 'courses' && loadedTabs.has('courses') && (
            <CoursesTabWrapper
              loading={courses.loading}
              error={courses.error}
              courses={courses.courses}
              userName={user.name}
            />
          )}
          {tab === 'profile' && loadedTabs.has('profile') && (
            <ProfileTabWrapper
              loading={profile.loading}
              error={profile.error}
              data={profile.data}
              profileRepo={profileRepo}
            />
          )}
        </div>
      </main>

      {/* mobile bottom nav */}
      <MobileNav active={tab} onChange={handleTabChange} />
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

// ---------- Tab Wrappers (to handle loading/error per tab) ----------

function HomeTabWrapper({
  loading,
  error,
  data,
  user,
}: {
  loading: boolean;
  error: string | null;
  data: ReturnType<typeof useHomeData>['data'];
  user: CurrentUser;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!data) return null; // can't happen if no loading/error, but safe
  return (
    <HomeTab
      user={user}
      stats={data.stats}
      roadmap={data.roadmap}
      aiSeed={data.aiSeed}
      aiQuickReplies={data.aiQuickReplies}
    />
  );
}
function LeaderboardTabWrapper({
  loading,
  error,
  data,
  seasonData,
  userProfileRepo,
}: {
  loading: boolean;
  error: string | null;
  data: ReturnType<typeof useLeaderboard>['data'];
  seasonData: ReturnType<typeof useSeason>['data'];
  userProfileRepo: IUserProfileRepository;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!data || !seasonData) return null;

  const targetDate = new Date(seasonData.targetDate);
  return (
    <LeaderboardTab
      podium={data.podium}
      leaderboard={data.leaderboard}
      userProfileRepo={userProfileRepo}
      seasonTargetDate={targetDate}
      seasonPointsNeeded={seasonData.pointsNeeded}
      seasonName={seasonData.seasonName}
    />
  );
}

function CoursesTabWrapper({
  loading,
  error,
  courses,
  userName,
}: {
  loading: boolean;
  error: string | null;
  courses: Course[] | null;
  userName?: string;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!courses) return null;
  return <CoursesTab courses={courses} userName={userName} />;
}
function ProfileTabWrapper({
  loading,
  error,
  data,
  profileRepo,
}: {
  loading: boolean;
  error: string | null;
  data: ReturnType<typeof useProfile>['data'];
  profileRepo: IProfileRepository;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!data) return null;
  return <ProfileTab profile={data} profileRepo={profileRepo} />;
}

function SocialTabWrapper({
  loading,
  error,
  posts,
  tags,
  activeUsers,
  onPublish,
  onAddComment,
}: {
  loading: boolean;
  error: string | null;
  posts: Post[];
  tags: string[];
  activeUsers: ActiveUser[];
  onPublish: (
    text: string,
    location?: string,
    emoji?: string,
    imageFile?: File | null,
    gifUrl?: string,
  ) => void;
  onAddComment: (postId: string, text: string) => void;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  return (
    <SocialTab
      posts={posts}
      tags={tags}
      activeUsers={activeUsers}
      onPublish={onPublish}
      onAddComment={onAddComment}
    />
  );
}

function TabLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <PhoenixLoader compact text="در حال بارگذاری..." />
    </div>
  );
}

function TabError({ error }: { error: string }) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-danger text-lg">{error}</div>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="dashboard-scope flex min-h-screen items-center justify-center overflow-hidden [background:radial-gradient(45%_35%_at_50%_38%,rgba(255,98,0,.14),transparent_65%),radial-gradient(35%_25%_at_50%_58%,rgba(243,186,99,.08),transparent_70%),var(--color-bg)]">
      <PhoenixLoader text="در حال آماده‌سازی داشبورد…" />
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="dashboard-scope flex min-h-screen items-center justify-center px-4 [background:var(--color-bg)]">
      <div className="border-hair relative w-full max-w-sm overflow-hidden rounded-3xl border p-6 text-center [background:linear-gradient(180deg,rgba(255,98,0,.08),rgba(10,5,3,.94))]">
        <PhoenixLoader compact text="داشبورد آماده نشد" />
        <p className="text-ink-3 mt-4 text-sm leading-7">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="from-ember to-gold shadow-glow mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-l px-6 text-sm font-black text-black transition-transform hover:-translate-y-0.5"
        >
          تلاش دوباره
        </button>
      </div>
    </div>
  );
}

function PhoenixLoader({ text, compact = false }: { text: string; compact?: boolean }) {
  const sizeClass = compact ? 'size-18' : 'size-24';

  return (
    <div className="relative flex flex-col items-center gap-4 text-center">
      <div className={`relative ${sizeClass}`}>
        <span className="border-ember/30 absolute inset-0 animate-ping rounded-full border" />
        <span className="from-ember/25 via-gold/15 absolute inset-1 animate-pulse rounded-full bg-gradient-to-br to-transparent blur-md" />
        <span className="border-hair absolute inset-0 rounded-full border [background:radial-gradient(circle_at_50%_35%,rgba(255,185,94,.22),rgba(255,98,0,.08)_45%,rgba(0,0,0,.7)_75%)]" />
        <OptionalImage
          src="/assets/phoenix_badge.webp"
          alt=""
          className="absolute inset-2 size-[calc(100%-1rem)] object-contain drop-shadow-[0_0_18px_rgba(255,98,0,.45)]"
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-ink text-base font-black">{text}</p>
        <p className="text-ink-4 mt-1 text-xs">ققنوس قبیله در حال روشن کردن مسیر است</p>
      </div>
    </div>
  );
}
