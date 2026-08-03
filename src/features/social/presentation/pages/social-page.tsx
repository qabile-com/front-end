'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@/features/dashboard/application/use-user';
import { useInfiniteFeed } from '@/features/social/application/use-infinite-feed';
import { useSocialData } from '@/features/social/application/use-social-data';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { useProfile } from '@/features/profile/application/use-profile';
import { profileRepo } from '@/features/profile/infrastructure/repository-factory';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { adminRepo, socialRepo } from '@/features/social/infrastructure/repository-factory';
import { SocialTab } from '@/features/social/presentation/sections/social-tab';
import { DashboardPageShell, MotionPage } from '@/shared/ui';
import { useActionRewardQueue } from '@/features/dashboard/application/use-action-reward-queue';
import { ActionRewardModals } from '@/features/dashboard/presentation/components/action-reward-modals';

type Feed = 'for-you' | 'following';

export function SocialPage() {
  const { user } = useUser(userRepo);
  const [feed, setFeed] = useState<Feed>('for-you');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const feedFilters = useMemo(
    () => ({
      ...parseSocialSearch(debouncedSearch),
      ...(feed === 'following' ? { followingOnly: true } : {}),
    }),
    [debouncedSearch, feed],
  );
  const feedQuery = useInfiniteFeed(socialRepo, feedFilters);
  const { currentReward, enqueueReward, dismissCurrentReward } = useActionRewardQueue();
  const social = useSocialData(socialRepo, enqueueReward);
  const profile = useProfile(profileRepo);

  return (
    <MotionPage>
      <DashboardPageShell size="wide">
      <SocialTab
        feedQuery={feedQuery}
        feed={feed}
        onFeedChange={setFeed}
        tags={social.tags}
        activeUsers={social.activeUsers}
        search={search}
        onSearchChange={setSearch}
        onPublish={social.publishPost}
        currentUserRole={user?.role}
        currentProfile={profile.data}
        isCurrentProfileLoading={profile.loading}
        profileRepo={profileRepo}
        adminRepo={adminRepo}
        newPostIds={social.newPostIds}
        onReward={enqueueReward}
      />
        <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
      </DashboardPageShell>
    </MotionPage>
  );
}

function parseSocialSearch(value: string) {
  const text = value.trim();
  if (!text) return {};
  if (text.startsWith('#')) return { hashtag: text };
  if (text.startsWith('@')) return { author: text.slice(1).trim() };
  return { q: text };
}
