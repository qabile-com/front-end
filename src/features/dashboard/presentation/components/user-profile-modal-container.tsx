import { useUserProfile } from '../../application/use-user-profile';
import { useFollowToggle } from '../../application/use-follow-toggle';
import type { IUserProfileRepository } from '../../domain/user-profile-repository';
import type { IFollowRepository } from '../../domain/follow-repository';
import { UserProfileModal } from './user-profile-modal';
import { followRepo } from '../../infrastructure/repository-factory';

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
  const { data: profile, loading, error } = useUserProfile(repository, userId);
  const { isFollowed, toggle, isToggling } = useFollowToggle(followRepo, userId);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-ink-3">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-danger">{error ?? 'خطا در دریافت اطلاعات'}</div>
      </div>
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
    />
  );
}
