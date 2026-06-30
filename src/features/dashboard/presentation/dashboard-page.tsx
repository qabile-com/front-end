'use client';

import { useState } from 'react';
import { Icon } from '@/shared/ui';
import { TAB_TITLES } from '@/features/dashboard/domain/dashboard.data';
import type { DashboardTab } from '@/features/dashboard/domain/dashboard.types';
import { DashboardSidebar } from './sections/dashboard-sidebar';
import { HomeTab } from './sections/home-tab';
import { LeaderboardTab } from './sections/leaderboard-tab';
import { ProfileTab } from './sections/profile-tab';
import { SocialTab } from './sections/social-tab';
import { CoursesTab } from './sections/courses-tab';

export function DashboardPage() {
  const [tab, setTab] = useState<DashboardTab>('home');

  return (
    <div className="dashboard-scope min-h-screen [background:radial-gradient(50%_40%_at_80%_-5%,rgba(255,98,0,.08),transparent_55%),radial-gradient(40%_35%_at_10%_8%,rgba(243,186,99,.04),transparent_55%),var(--color-bg)]">
      <DashboardSidebar active={tab} onChange={setTab} />

      <main className="ms-65 flex min-h-screen flex-col max-[900px]:ms-55">
        <header className="border-hair sticky top-0 z-40 flex h-16 items-center justify-between border-b px-8 [backdrop-filter:blur(20px)] [background:rgba(5,3,2,.85)]">
          <h1 className="text-lg font-black">{TAB_TITLES[tab]}</h1>
          <div className="flex items-center gap-3">
            <span className="text-ember border-hair inline-flex items-center gap-1.5 rounded-full border px-3.5 py-[7px] text-[13px] font-extrabold [background:var(--glass-2)]">
              <Icon name="flame" size={16} />
              ۳۱ روز
            </span>
            <button
              type="button"
              aria-label="اعلان‌ها"
              className="text-ink-3 border-hair hover:text-gold hover:border-hair-2 grid size-[38px] place-items-center rounded-xl border transition-colors [background:var(--glass-2)]"
            >
              <Icon name="bell" size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {tab === 'home' && <HomeTab />}
          {tab === 'lb' && <LeaderboardTab />}
          {tab === 'social' && <SocialTab />}
          {tab === 'courses' && <CoursesTab />}
          {tab === 'profile' && <ProfileTab />}
        </div>
      </main>
    </div>
  );
}
