'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useQueryClient } from '@tanstack/react-query';
import { BaseModal, Button, Icon, InlineSpinner, OptionalImage } from '@/shared/ui';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { Achievement } from '@/features/dashboard/domain/dashboard.types';
import {
  DEFAULT_ACHIEVEMENT_IMAGE,
  getAchievementAssetUrl,
} from '@/features/dashboard/domain/achievement-normalizer';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';

// CreatePost pulls in the NSFW-moderation stack (@tensorflow/tfjs + nsfwjs),
// which is large and only needed once someone actually opens the share form -
// loading it eagerly here would ship it in the shared dashboard layout bundle
// for every authenticated page, since this modal is mounted unconditionally
// via ActionRewardModals.
const CreatePost = dynamic(
  () => import('@/features/social/presentation/sections/create-post').then((m) => m.CreatePost),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-32 items-center justify-center">
        <InlineSpinner className="text-ember size-6" />
      </div>
    ),
  },
);
import type { AchievementCard } from '@/features/social/domain/social.data';
import { getPostPublishErrorMessage } from '@/features/social/application/social-error-message';
import { invalidateSocialPostCreation } from '@/features/social/application/social-cache';

interface AchievementEarnedModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementEarnedModal({ achievement, onClose }: AchievementEarnedModalProps) {
  const queryClient = useQueryClient();
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
      invalidateSocialPostCreation(queryClient);
      showSuccess('پست با موفقیت منتشر شد!');
    } catch (error) {
      showError(getPostPublishErrorMessage(error));
      throw new Error('Achievement post publish failed');
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
            onPublished={onClose}
          />
        </BaseModal>
      )}
    </>
  );
}

function getAchievementImage(achievement: Achievement) {
  return getAchievementAssetUrl(achievement);
}
