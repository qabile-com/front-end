import { useUserProfile } from '../../application/use-user-profile';
import { useRouter } from 'next/navigation';
import { useFollowToggle } from '../../application/use-follow-toggle';
import { useUserPosts } from '../../application/use-user-posts';
import type { IUserProfileRepository } from '../../domain/user-profile-repository';
import type { IFollowRepository } from '../../domain/follow-repository';
import { BaseModal, ErrorState, ModalSkeleton } from '@/shared/ui';
import { UserProfileModal } from './user-profile-modal';
import { followRepo } from '@/features/leaderboard/infrastructure/repository-factory';

interface Props {
  userId: string | null;
  onClose: () => void;
  repository: IUserProfileRepository;
}

export function UserProfileModalContainer({ userId, onClose, repository }: Props) {
  if (!userId) return null;

  return (
    <ProfileLoader
      key={userId}
      userId={userId}
      onClose={onClose}
      repository={repository}
      followRepo={followRepo}
    />
  );
}

function ProfileLoader({
  userId,
  onClose,
  repository,
  followRepo,
}: {
  userId: string;
  onClose: () => void;
  repository: IUserProfileRepository;
  followRepo: IFollowRepository;
}) {
  const router = useRouter();
  const { data: profile, loading, error } = useUserProfile(repository, userId);
  const postsQuery = useUserPosts(repository, userId);
  const { isFollowed, toggle, isToggling } = useFollowToggle(followRepo, userId);

  if (loading) {
    return (
      <BaseModal isOpen onClose={onClose} title="در حال دریافت پروفایل" className="bg-black/60" panelClassName="w-full max-w-md">
        <ModalSkeleton />
      </BaseModal>
    );
  }

  if (error || !profile) {
    return (
      <BaseModal isOpen onClose={onClose} title="خطای پروفایل" className="bg-black/60" panelClassName="w-full max-w-md">
        <ErrorState
          compact
          title="پروفایل کاربر آماده نشد"
          message={error ?? 'اطلاعات این کاربر دریافت نشد.'}
          action={{ label: 'بستن', onClick: onClose, icon: 'arrow-left' }}
        />
      </BaseModal>
    );
  }

  return (
    <UserProfileModal
      isOpen
      onClose={onClose}
      user={profile}
      isFollowed={isFollowed}
      onToggleFollow={toggle}
      isToggling={isToggling}
      postsQuery={postsQuery}
      onPostClick={(postId) => {
        onClose();
        router.push(`/social/${postId}`);
      }}
    />
  );
}
