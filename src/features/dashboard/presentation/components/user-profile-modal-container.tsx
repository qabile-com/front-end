// src/features/dashboard/presentation/components/user-profile-modal-container.tsx

import { useUserProfile } from '../../application/use-user-profile';
import type { IUserProfileRepository } from '../../domain/user-profile-repository';
import { UserProfileModal } from './user-profile-modal';

interface Props {
  userId: string | null;
  onClose: () => void;
  repository: IUserProfileRepository;
}

export function UserProfileModalContainer({ userId, onClose, repository }: Props) {
  if (!userId) return null;

  // key ensures a fresh hook state every time userId changes
  return <ProfileLoader key={userId} userId={userId} onClose={onClose} repository={repository} />;
}

function ProfileLoader({
  userId,
  onClose,
  repository,
}: {
  userId: string;
  onClose: () => void;
  repository: IUserProfileRepository;
}) {
  const { data, loading, error } = useUserProfile(repository, userId);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-ink-3">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="text-danger">{error ?? 'خطا در دریافت اطلاعات'}</div>
      </div>
    );
  }

  return <UserProfileModal isOpen onClose={onClose} user={data} />;
}
