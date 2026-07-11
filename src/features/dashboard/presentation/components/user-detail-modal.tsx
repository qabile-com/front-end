// src/features/dashboard/presentation/components/user-detail-modal.tsx
'use client';

import { Icon } from '@/shared/ui';
import { useUserDetail } from '../../application/use-user-detail';
import type { IUserDetailRepository } from '../../domain/dashboard-repository';
import { toPersianDigits } from '@/core/lib/persian';

interface UserDetailModalProps {
  userId: string;
  repo: IUserDetailRepository;
  onClose: () => void;
}

export function UserDetailModal({ userId, repo, onClose }: UserDetailModalProps) {
  const { detail, loading, error } = useUserDetail(repo, userId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="border-hair glass w-full max-w-md rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">پروفایل کاربر</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink">
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>

        {loading && <p className="text-ink-3 text-center">در حال بارگذاری...</p>}
        {error && <p className="text-danger text-center">{error}</p>}
        {detail && (
          <div className="flex flex-col items-center">
            <span
              className="border-hair-2 size-24 rounded-full border-2"
              style={{ background: detail.avatar }}
            />
            <h3 className="mt-3 text-xl font-extrabold">{detail.name}</h3>
            <p className="text-gold">{detail.title}</p>
            <div className="mt-6 grid w-full grid-cols-2 gap-4">
              <div className="border-hair rounded-xl p-3 text-center [background:var(--glass-2)]">
                <b className="block text-lg font-black">{toPersianDigits(detail.level)}</b>
                <span className="text-ink-3 text-xs">سطح</span>
              </div>
              <div className="border-hair rounded-xl p-3 text-center [background:var(--glass-2)]">
                <b className="block text-lg font-black">{toPersianDigits(detail.xp)}</b>
                <span className="text-ink-3 text-xs">XP</span>
              </div>
              <div className="border-hair rounded-xl p-3 text-center [background:var(--glass-2)]">
                <b className="block text-lg font-black">{toPersianDigits(detail.streak)}</b>
                <span className="text-ink-3 text-xs">روز زنجیره</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
