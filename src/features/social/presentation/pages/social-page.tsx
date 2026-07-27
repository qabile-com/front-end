'use client';

import { useUser } from '@/features/dashboard/application/use-user';
import { useInfiniteFeed } from '@/features/social/application/use-infinite-feed';
import { useSocialData } from '@/features/social/application/use-social-data';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { adminRepo, socialRepo } from '@/features/social/infrastructure/repository-factory';
import { SocialTab } from '@/features/social/presentation/sections/social-tab';
import { MotionPage } from '@/shared/ui';

export function SocialPage() {
  const { user } = useUser(userRepo);
  const feedQuery = useInfiniteFeed(socialRepo);
  const social = useSocialData(socialRepo);

  return (
    <MotionPage>
      <SocialTab
        feedQuery={feedQuery}
        tags={social.tags}
        activeUsers={social.activeUsers}
        onPublish={social.publishPost}
        currentUserRole={user?.role}
        adminRepo={adminRepo}
      />
    </MotionPage>
  );
}
