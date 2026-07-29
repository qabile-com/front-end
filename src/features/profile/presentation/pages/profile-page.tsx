'use client';

import { useSearchParams } from 'next/navigation';
import { useProfile } from '@/features/profile/application/use-profile';
import { profileRepo } from '@/features/profile/infrastructure/repository-factory';
import { TabError } from '@/features/dashboard/presentation/components/dashboard-loading';
import { ProfileTab } from '@/features/profile/presentation/sections/profile-tab';
import { DashboardPageShell, MotionPage, ProfileSkeleton } from '@/shared/ui';

export function ProfilePage() {
  const searchParams = useSearchParams();
  const profile = useProfile(profileRepo);
  const shouldOpenEditProfile = searchParams.get('edit') === 'profile';

  if (profile.loading) return <ProfileSkeleton />;
  if (profile.error) return <TabError error={profile.error} onRetry={() => void profile.refetch()} />;
  if (!profile.data) return <ProfileSkeleton />;

  return (
    <MotionPage>
      <DashboardPageShell>
        <ProfileTab
          profile={profile.data}
          profileRepo={profileRepo}
          initialEditProfileOpen={shouldOpenEditProfile}
        />
      </DashboardPageShell>
    </MotionPage>
  );
}
