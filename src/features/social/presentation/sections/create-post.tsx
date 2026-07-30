// src/features/dashboard/presentation/sections/create-post.tsx
'use client';

import { useState } from 'react';
import { Icon } from '@/shared/ui';
import type { AchievementCard } from '../../domain/social.data';

interface Props {
  onPublish: (text: string, imageFile?: File | null, achievement?: AchievementCard | null) => void;
  onPublished?: () => void;
  achievement?: AchievementCard | null;
}

export function CreatePost({ onPublish, onPublished, achievement }: Props) {
  const hasAchievement = Boolean(achievement?.title);
  const [text, setText] = useState(hasAchievement ? `من دستاورد ${achievement?.title} را در قبیله ققنوس دریافت کردم. 🎉` : '');

  const publish = () => {
    if (!text.trim() && !hasAchievement) return;
    onPublish(text.trim(), null, hasAchievement ? achievement : null);
    setText('');
    onPublished?.();
  };

  return (
    <article className="border-hair rounded-[20px] border bg-(--glass) p-5">
      {hasAchievement && achievement && (
        <div className="border-hair mb-3 rounded-2xl border bg-[#120904] p-4">
          <div className="flex items-start gap-3">
            <span className="border-hair text-gold mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-xl border bg-[rgba(255,98,0,.1)]">
              <Icon name={achievement.icon as any} size={22} />
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

      {/* Toolbar & Publish */}
      <div className="mt-4 flex flex-wrap items-center gap-2 place-self-end">
        <div className="text-ember flex items-center gap-2.5">
          {/* Image, file, GIF and location are temporarily disabled. Users can publish text only. */}
          {/*
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-ember/10 rounded-md p-1.5 transition-colors"
            title="آپلود تصویر"
          >
            <Icon name="image" size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          */}

          {/* <button type="button" title="افزودن GIF">GIF</button> */}
          {/* <button type="button" title="افزودن موقعیت"><Icon name="location" size={20} /></button> */}
          {/* <button type="button" title="آپلود فایل"><Icon name="paperclip" size={20} /></button> */}
        </div>

        <button
          type="button"
          onClick={publish}
          className="rounded-md px-5 py-2 font-bold text-[#1a0a00] transition-opacity [background:var(--fire-grad)] hover:opacity-90"
        >
          انتشار
        </button>
      </div>
    </article>
  );
}
