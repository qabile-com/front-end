'use client';

import { useState } from 'react';
import { Icon } from '@/shared/ui';
import { TAB_TITLES, NAV } from '@/features/dashboard/domain/dashboard.data';
import type { CurrentUser, DashboardTab } from '@/features/dashboard/domain/dashboard.types';
import { DashboardSidebar } from './sections/dashboard-sidebar';
import { MobileNav } from './sections/mobile-nav';
import { MobileHeader } from './sections/mobile-header';
import { HomeTab } from './sections/home-tab';
import { LeaderboardTab } from './sections/leaderboard-tab';
import { ProfileTab } from './sections/profile-tab';
import { SocialTab } from './sections/social-tab';
import { CoursesTab } from './sections/courses-tab';
import {
  MockCoursesRepository,
  MockHomeRepository,
  MockLeaderboardRepository,
  MockProfileRepository,
  MockUserDetailRepository,
  MockUserRepository,
} from '../infrastructure/mock-dashboard-repository';

import { useUser } from '../application/use-user';
import { useHomeData } from '../application/use-home-data';
import { useLeaderboard } from '../application/use-leaderboard';
import { useCourses } from '../application/use-courses';
import { useProfile } from '../application/use-profile';
import { Course } from '../domain/courses.data';
import { MockSocialRepository } from '../infrastructure/mock-social-repository';
import { useSocialData } from '../application/use-social-data';
import { ActiveUser, Post } from '../domain/social.data';
import { IUserDetailRepository } from '../domain/dashboard-repository';
import { MockSeasonRepository } from '../infrastructure/mock-season-repository';
import { useSeason } from '../application/use-season';

// Repositories (singletons)
const userRepo = new MockUserRepository();
const homeRepo = new MockHomeRepository();
const leaderboardRepo = new MockLeaderboardRepository();
const coursesRepo = new MockCoursesRepository();
const profileRepo = new MockProfileRepository();
const userDetailRepo = new MockUserDetailRepository();
const socialRepo = new MockSocialRepository();
const seasonRepo = new MockSeasonRepository();

export function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>('home');
  const [loadedTabs, setLoadedTabs] = useState<Set<DashboardTab>>(new Set(['home']));

  // Always fetch user
  const { user, loading: userLoading, error: userError } = useUser(userRepo);
  const {
    posts,
    tags,
    activeUsers,
    loading: socialLoading,
    error: socialError,
    publishPost,
    addComment,
  } = useSocialData(socialRepo);
  const { data: seasonData, loading: seasonLoading, error: seasonError } = useSeason(seasonRepo);

  // Lazy tab data hooks – only call when tab is loaded
  const home = useHomeData(homeRepo);
  const lb = useLeaderboard(leaderboardRepo);
  const courses = useCourses(coursesRepo);
  const profile = useProfile(profileRepo);

  const title = TAB_TITLES[tab] ?? '';

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

  if (userLoading || userError) {
    return (
      <div className="dashboard-scope flex min-h-screen items-center justify-center">
        <div className="text-ink-3 text-lg">در حال بارگذاری داشبورد…</div>
      </div>
    );
  }

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
              ۳۱ روز
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

        <MobileHeader title={title} />

        <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          {tab === 'home' && loadedTabs.has('home') && (
            <HomeTabWrapper
              user={user}
              loading={home.loading}
              error={home.error}
              data={home.data}
            />
          )}
          {tab === 'lb' && loadedTabs.has('lb') && (
            <LeaderboardTabWrapper
              loading={lb.loading || seasonLoading}
              error={lb.error || seasonError}
              data={lb.data}
              seasonData={seasonData}
              userDetailRepo={userDetailRepo}
            />
          )}
          {tab === 'social' && loadedTabs.has('social') && (
            <SocialTabWrapper
              loading={socialLoading}
              error={socialError}
              posts={posts}
              tags={tags}
              activeUsers={activeUsers}
              onPublish={publishPost}
              onAddComment={addComment}
            />
          )}
          {tab === 'courses' && loadedTabs.has('courses') && (
            <CoursesTabWrapper
              loading={courses.loading}
              error={courses.error}
              courses={courses.courses}
            />
          )}
          {tab === 'profile' && loadedTabs.has('profile') && (
            <ProfileTabWrapper
              loading={profile.loading}
              error={profile.error}
              data={profile.data}
              user={user}
            />
          )}
        </div>
      </main>

      {/* mobile bottom nav */}
      <MobileNav active={tab} onChange={handleTabChange} />
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
  userDetailRepo,
}: {
  loading: boolean;
  error: string | null;
  data: ReturnType<typeof useLeaderboard>['data'];
  seasonData: ReturnType<typeof useSeason>['data'];
  userDetailRepo: IUserDetailRepository;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!data || !seasonData) return null;

  const targetDate = new Date(seasonData.targetDate);
  return (
    <LeaderboardTab
      podium={data.podium}
      leaderboard={data.leaderboard}
      userDetailRepo={userDetailRepo}
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
}: {
  loading: boolean;
  error: string | null;
  courses: Course[] | null;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!courses) return null;
  return <CoursesTab courses={courses} />;
}
function ProfileTabWrapper({
  loading,
  error,
  data,
  user,
}: {
  loading: boolean;
  error: string | null;
  data: ReturnType<typeof useProfile>['data'];
  user: CurrentUser;
}) {
  if (loading) return <TabLoader />;
  if (error) return <TabError error={error} />;
  if (!data) return null;
  return (
    <ProfileTab
      user={user}
      profileStats={data.profileStats}
      achievements={data.achievements}
      settings={data.settings}
    />
  );
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
      <div className="text-ink-3 text-lg">در حال بارگذاری...</div>
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
