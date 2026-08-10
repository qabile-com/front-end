// src/features/dashboard/presentation/sections/create-post.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon, OptionalImage } from '@/shared/ui';
import type { AchievementCard } from '../../domain/social.data';
import { moderateAvatarImage } from '@/features/profile/application/avatar-content-moderation';
import { showError } from '@/shared/lib/toast';

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
  const [text, setText] = useState(hasAchievement ? `من دستاورد ${achievement?.title} را در قبیله ققنوس دریافت کردم. 🎉` : '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const publish = async () => {
    if (isPublishing || isCheckingImage || (!text.trim() && !hasAchievement && !imageFile)) return;

    setIsPublishing(true);
    try {
      await onPublish(text.trim(), imageFile, hasAchievement ? achievement : null);
      setText('');
      clearImage();
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
          disabled={isPublishing || isCheckingImage}
          onClick={() => void publish()}
          className="rounded-md px-5 py-2 font-bold text-[#1a0a00] transition-opacity [background:var(--fire-grad)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPublishing ? 'در حال انتشار...' : isCheckingImage ? 'در حال بررسی تصویر...' : 'انتشار'}
        </button>
      </div>
    </article>
  );
}
