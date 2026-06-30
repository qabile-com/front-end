'use client';

import { useState } from 'react';
import { Icon } from '@/shared/ui';
import { TAB_TITLES } from '@/features/dashboard/domain/dashboard.data';
import type { DashboardTab } from '@/features/dashboard/domain/dashboard.types';
import { DashboardSidebar } from './sections/dashboard-sidebar';
import { MobileNav } from './sections/mobile-nav';
import { MobileHeader } from './sections/mobile-header';
import { HomeTab } from './sections/home-tab';
import { LeaderboardTab } from './sections/leaderboard-tab';
import { ProfileTab } from './sections/profile-tab';
import { SocialTab } from './sections/social-tab';
import { CoursesTab } from './sections/courses-tab';

export function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>('home');
  const title = TAB_TITLES[tab] ?? '';

  return (
    <div className="dashboard-scope min-h-screen [background:radial-gradient(50%_40%_at_80%_-5%,rgba(255,98,0,.08),transparent_55%),radial-gradient(40%_35%_at_10%_8%,rgba(243,186,99,.04),transparent_55%),var(--color-bg)]">
      {/* desktop sidebar */}
      <DashboardSidebar active={tab} onChange={setTab} />

      <main className="flex min-h-screen flex-col lg:ms-65">
        {/* desktop topbar */}
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

        {/* mobile header (replaces the sidebar's brand/level/streak on small screens) */}
        <MobileHeader title={title} />

        {/* content: extra bottom padding on mobile to clear the fixed bottom nav */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:p-8 lg:pb-8">
          {tab === 'home' && <HomeTab />}
          {tab === 'lb' && <LeaderboardTab />}
          {tab === 'social' && <SocialTab />}
          {tab === 'courses' && <CoursesTab />}
          {tab === 'profile' && <ProfileTab />}
        </div>
      </main>

      {/* mobile bottom nav */}
      <MobileNav active={tab} onChange={setTab} />
    </div>
  );
}
