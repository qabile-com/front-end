'use client';

import { useProfile } from '@/features/profile/application/use-profile';
import { profileRepo } from '@/features/profile/infrastructure/repository-factory';
import { TabError } from '@/features/dashboard/presentation/components/dashboard-loading';
import { ProfileTab } from '@/features/profile/presentation/sections/profile-tab';
import { MotionPage, ProfileSkeleton } from '@/shared/ui';

export function ProfilePage() {
  const profile = useProfile(profileRepo);

  if (profile.loading) return <ProfileSkeleton />;
  if (profile.error) return <TabError error={profile.error} onRetry={() => void profile.refetch()} />;
  if (!profile.data) return <ProfileSkeleton />;

  return (
    <MotionPage>
      <ProfileTab profile={profile.data} profileRepo={profileRepo} />
    </MotionPage>
  );
}
