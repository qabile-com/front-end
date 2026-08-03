'use client';

import { useState } from 'react';
import { BaseModal, Button, Icon, OptionalImage } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { Achievement } from '@/features/dashboard/domain/dashboard.types';
import {
  DEFAULT_ACHIEVEMENT_IMAGE,
  getAchievementAssetUrl,
} from '@/features/dashboard/domain/achievement-normalizer';
import { CreatePost } from '@/features/social/presentation/sections/create-post';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import type { AchievementCard } from '@/features/social/domain/social.data';

interface AchievementEarnedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementEarnedModal({ achievement, onClose }: AchievementEarnedModalProps) {
  const [isSharePostOpen, setIsSharePostOpen] = useState(false);

  if (!achievement) return null;

  const count = achievement.count ?? 1;

  const handlePublishPost = async (
    text: string,
    imageFile?: File | null,
    achievementCard?: AchievementCard | null,
  ) => {
    try {
      await socialRepo.createPost(text, imageFile, achievementCard);
      showSuccess('پست با موفقیت منتشر شد!');
      setIsSharePostOpen(false);
      onClose();
    } catch {
      showError('خطا در انتشار پست');
    }
  };

  return (
    <>
      {!isSharePostOpen && (
        <BaseModal
          isOpen
          onClose={onClose}
          title={achievement.label}
          zIndexClassName="z-[1110]"
          panelClassName="border-hair w-full max-w-[426px] overflow-hidden rounded-[10px] border bg-[#050302] px-5 py-6 text-center shadow-[0_28px_90px_-40px_var(--glow)] sm:px-8"
        >
          <div className="relative mx-auto size-[190px] overflow-hidden rounded-[8px] border border-[rgba(255,98,0,.72)] bg-black">
            <OptionalImage
              src={getAchievementImage(achievement)}
              alt={achievement.label}
              className="object-cover"
              fallbackSrc={DEFAULT_ACHIEVEMENT_IMAGE}
              loading="lazy"
            />
            {count > 1 && (
              <span className="bg-ember absolute start-2 top-2 rounded-[5px] px-2 py-1 text-[11px] font-black text-white">
                {toPersianDigits(count)}x
              </span>
            )}
          </div>

          <p className="text-ink-3 mt-5 text-[12px]">دستاورد جدید دریافت شد</p>
          <h3 className="text-gold mt-2 text-[24px] font-black">{achievement.label}</h3>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px]">
            <span className="text-ink-3 font-bold">شرایط دریافت:</span>
            {(achievement.conditions ?? []).map((condition) => (
              <span key={condition.id} className="text-gold inline-flex items-center gap-2 font-bold">
                <span>{condition.label}</span>
                <Icon name="check" size={22} />
              </span>
            ))}
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            block
            onClick={() => setIsSharePostOpen(true)}
            className="mt-5 h-11 rounded-[7px] text-[13px]"
          >
            <Icon name="share" size={17} />
            اشتراک گذاری
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-gold mt-4 text-[12px] font-bold transition-colors"
          >
            ادامه
          </button>
        </BaseModal>
      )}

      {isSharePostOpen && (
        <BaseModal
          isOpen
          onClose={() => setIsSharePostOpen(false)}
          title="اشتراک گذاری دستاورد"
          zIndexClassName="z-[1110]"
          panelClassName="w-full max-w-md"
        >
          <CreatePost
            achievement={{
              id: achievement.id,
              title: achievement.label,
              sub: achievement.description ?? '',
              icon: achievement.icon,
            }}
            onPublish={handlePublishPost}
          />
        </BaseModal>
      )}
    </>
  );
}

function getAchievementImage(achievement: Achievement) {
  return getAchievementAssetUrl(achievement);
}
