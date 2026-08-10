// src/features/dashboard/presentation/sections/create-post.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Icon, OptionalImage } from '@/shared/ui';
import type { AchievementCard } from '../../domain/social.data';
import { moderateAvatarImage } from '@/features/profile/application/avatar-content-moderation';
import { showError } from '@/shared/lib/toast';
import { toPersianDigits } from '@/core/lib/persian';
import { socialRepo } from '../../infrastructure/repository-factory';
import { postingStatusQueryKey, usePostingStatus } from '../../application/use-posting-status';
import type { PostingStatus } from '../../domain/social-repository';

interface Props {
  onPublish: (
    text: string,
    imageFile?: File | null,
    achievement?: AchievementCard | null,
  ) => void | Promise<void>;
  onPublished?: () => void;
  achievement?: AchievementCard | null;
}

export function CreatePost({ onPublish, onPublished, achievement }: Props) {
  const hasAchievement = Boolean(achievement?.title);
  const [text, setText] = useState(
    hasAchievement ? `من دستاورد ${achievement?.title} را در قبیله ققنوس دریافت کردم. 🎉` : '',
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const postingStatusQuery = usePostingStatus(socialRepo);
  const postingStatus = postingStatusQuery.data;
  const refetchPostingStatus = postingStatusQuery.refetch;
  const remainingSeconds = getRemainingSeconds(postingStatus, now);
  const postLocked = isLocked(postingStatus, remainingSeconds);
  const canSubmit =
    !isPublishing &&
    !isCheckingImage &&
    !postLocked &&
    Boolean(text.trim() || hasAchievement || imageFile);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  useEffect(() => {
    if (!postLocked) return undefined;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [postLocked]);

  useEffect(() => {
    if (!postingStatus?.isLocked || remainingSeconds > 0) return;
    void refetchPostingStatus();
  }, [postingStatus?.isLocked, refetchPostingStatus, remainingSeconds]);

  const publish = async () => {
    if (isPublishing || isCheckingImage || (!text.trim() && !hasAchievement && !imageFile)) return;

    setIsPublishing(true);
    try {
      const freshStatusResult = await refetchPostingStatus();
      if (freshStatusResult.isError || !freshStatusResult.data) {
        showError('وضعیت امکان انتشار پست دریافت نشد. چند لحظه بعد دوباره تلاش کن.');
        return;
      }

      const freshRemainingSeconds = getRemainingSeconds(freshStatusResult.data, Date.now());
      if (isLocked(freshStatusResult.data, freshRemainingSeconds)) {
        showError(getPostingStatusMessage(freshStatusResult.data, freshRemainingSeconds));
        return;
      }

      await onPublish(text.trim(), imageFile, hasAchievement ? achievement : null);
      setText('');
      clearImage();
      void queryClient.invalidateQueries({ queryKey: postingStatusQueryKey });
      onPublished?.();
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    setIsCheckingImage(true);
    try {
      const moderation = await moderateAvatarImage(file);
      if (!moderation.allowed) {
        showError(moderation.message ?? 'این تصویر برای انتشار مناسب نیست.');
        return;
      }
      clearImage();
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } catch {
      showError('بررسی تصویر انجام نشد.');
    } finally {
      setIsCheckingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <article className="border-hair rounded-[20px] border bg-(--glass) p-5">
      {hasAchievement && achievement && (
        <div className="border-hair mb-3 rounded-2xl border bg-[#120904] p-4">
          <div className="flex items-start gap-3">
            <span className="border-hair text-gold mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl border bg-[rgba(255,98,0,.1)]">
              <Icon name={achievement.icon} size={22} />
            </span>
            <div className="min-w-0 flex-1 text-right">
              <p className="text-gold text-[13px] font-extrabold">
                دستاورد: نشان {achievement.title} دریافت شد
              </p>
              <p className="text-ink-2 mt-1 text-[13px] leading-7">{achievement.sub}</p>
            </div>
          </div>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={hasAchievement ? 'متن پست خودت رو بنویس...' : 'جرقه‌ی بعدی را ثبت کن...'}
        rows={hasAchievement ? 4 : 5}
        className="text-ink placeholder:text-ink-3 w-full resize-none rounded-xl bg-(--glass-2) p-4 outline-none"
      />

      {postLocked && (
        <div className="border-hair border-ember/40 mt-3 rounded-xl border bg-[rgba(255,98,0,.08)] px-4 py-3 text-right">
          <p className="text-ember text-[13px] font-extrabold">
            تا انتشار پست بعدی {formatRemainingTime(remainingSeconds)} باقی مانده.
          </p>
          {postingStatus?.lockedUntil && (
            <p className="text-ink-3 mt-1 text-[12px] leading-6">
              از {formatLocalDateTime(postingStatus.lockedUntil)} دوباره می‌توانی منتشر کنی.
            </p>
          )}
        </div>
      )}

      {previewUrl && (
        <div className="border-hair relative mt-3 aspect-video overflow-hidden rounded-xl border bg-black/30">
          <OptionalImage src={previewUrl} alt="" className="object-contain" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 left-2 grid size-9 place-items-center rounded-full bg-black/70 text-white"
            aria-label="حذف تصویر"
          >
            <Icon name="plus" size={18} className="rotate-45" />
          </button>
        </div>
      )}

      {/* Toolbar & Publish */}
      <div className="mt-4 flex flex-wrap items-center gap-2 place-self-end">
        <div className="text-ember flex items-center gap-2.5">
          <button
            type="button"
            disabled={isPublishing || isCheckingImage}
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-ember/10 rounded-md p-1.5 transition-colors disabled:opacity-50"
            title="آپلود تصویر"
          >
            <Icon name="image" size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => void handleFileChange(event.target.files?.[0])}
          />

          {/* <button type="button" title="افزودن GIF">GIF</button> */}
          {/* <button type="button" title="افزودن موقعیت"><Icon name="location" size={20} /></button> */}
          {/* <button type="button" title="آپلود فایل"><Icon name="paperclip" size={20} /></button> */}
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => void publish()}
          className="rounded-md px-5 py-2 font-bold text-[#1a0a00] transition-opacity [background:var(--fire-grad)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPublishing
            ? 'در حال انتشار...'
            : isCheckingImage
              ? 'در حال بررسی تصویر...'
              : postLocked
                ? `انتشار تا ${formatCompactRemainingTime(remainingSeconds)} ساعت دیگر`
                : 'انتشار'}
        </button>
      </div>
    </article>
  );
}

function isLocked(status: PostingStatus | undefined, remainingSeconds: number) {
  return Boolean(status?.isLocked || status?.canCreatePost === false || remainingSeconds > 0);
}

function getRemainingSeconds(status: PostingStatus | undefined, now: number) {
  if (!status) return 0;
  if (status.lockedUntil) {
    const lockedUntilTime = new Date(status.lockedUntil).getTime();
    if (!Number.isNaN(lockedUntilTime)) {
      return Math.max(0, Math.ceil((lockedUntilTime - now) / 1000));
    }
  }

  return Math.max(0, Math.floor(status.remainingSeconds ?? 0));
}

function getPostingStatusMessage(status: PostingStatus, remainingSeconds: number) {
  const unlockText = status.lockedUntil
    ? ` از ${formatLocalDateTime(status.lockedUntil)} دوباره می‌توانی پست منتشر کنی.`
    : '';

  return `فعلا امکان انتشار پست جدید وجود ندارد. ${formatRemainingTime(remainingSeconds)} دیگر صبر کن.${unlockText}`;
}

function formatRemainingTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const restSeconds = seconds % 60;

  if (hours > 0) {
    return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(minutes)} دقیقه`;
  }

  return `${toPersianDigits(minutes)} دقیقه و ${toPersianDigits(restSeconds)} ثانیه`;
}

function formatCompactRemainingTime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.ceil((seconds % 3600) / 60);

  if (hours > 0) {
    return `${toPersianDigits(hours)}:${toPersianDigits(String(minutes).padStart(2, '0'))}`;
  }

  return `${toPersianDigits(minutes)} دقیقه`;
}

function formatLocalDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
