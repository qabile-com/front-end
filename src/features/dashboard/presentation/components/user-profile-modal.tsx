// src/features/dashboard/presentation/components/user-profile-modal.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { GlassCard, Button, Icon } from '@/shared/ui';
import type { UserProfileData } from '../../domain/user-profile-repository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData;
}

export function UserProfileModal({ isOpen, onClose, user }: Props) {
  const [isFollowing, setIsFollowing] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <GlassCard className="border-hair relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto [background:var(--color-panel)]">
        {/* Header */}
        <div className="border-hair flex items-center justify-between border-b p-6">
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-[var(--glass-2)]"
          >
            <Icon name="arrow-left" size={24} className="text-ink-2" />
          </button>
          <span className="text-lg font-bold">{user.name}</span>
          <div className="w-8" />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-end p-6">
          <div className="flex w-full items-center justify-end gap-4">
            <div className="text-right">
              <h2 className="text-ink text-2xl font-bold">{user.name}</h2>
              <p className="text-ink-3 mt-1 text-sm">
                {user.title} ، سطح {toPersianDigits(user.level)}
              </p>
            </div>
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ background: user.avatar }}
            >
              {user.name.slice(0, 1)}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="border-hair grid grid-cols-4 gap-4 border-t px-6 py-4 text-center">
          <div>
            <div className="text-gold text-lg font-bold">{toPersianDigits(user.stats.xp)}</div>
            <div className="text-ink-3 mt-1 text-xs">امتیاز</div>
          </div>
          <div>
            <div className="text-ember text-lg font-bold">{toPersianDigits(user.stats.streak)}</div>
            <div className="text-ink-3 mt-1 text-xs">روز زنجیره</div>
          </div>
          <div>
            <div className="text-ink text-lg font-bold">
              {toPersianDigits(user.stats.peersFollowed)}
            </div>
            <div className="text-ink-3 mt-1 text-xs">هم پرواز شده</div>
          </div>
          <div>
            <div className="text-ink text-lg font-bold">
              {toPersianDigits(user.stats.peersFollowing)}
            </div>
            <div className="text-ink-3 mt-1 text-xs">هم پرواز</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 px-6 pb-4">
          <Button
            variant={isFollowing ? 'ghost' : 'primary'}
            size="md"
            onClick={() => setIsFollowing(!isFollowing)}
            className={isFollowing ? 'border-gold text-gold border' : ''}
          >
            {isFollowing ? 'هم پرواز هستید' : 'هم پرواز شدن'}
          </Button>
          <Button variant="ghost" size="md" className="border-danger text-danger border">
            بلاک
          </Button>
        </div>

        {/* User Posts */}
        <div className="px-6 pb-6">
          <div className="border-hair mb-4 flex items-center justify-between border-b pb-2">
            <h3 className="text-md text-ink-2 font-bold">پست‌ها</h3>
          </div>
          <div className="max-h-60 space-y-4 overflow-y-auto pr-2">
            {user.posts.map((post) => (
              <div key={post.id} className="border-hair rounded-lg border bg-[var(--glass-2)] p-4">
                <p className="text-ink-2 text-right text-sm leading-relaxed">{post.text}</p>
                <div className="text-ink-4 mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Icon name="heart" size={16} /> {toPersianDigits(post.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="msg" size={16} /> {toPersianDigits(post.comments.length)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
