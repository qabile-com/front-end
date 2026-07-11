// src/features/dashboard/presentation/sections/create-post.tsx
'use client';

import { useRef, useState } from 'react';
import { Icon } from '@/shared/ui';

interface Props {
  onPublish: (text: string, location?: string, emoji?: string) => void;
}

export function CreatePost({ onPublish }: Props) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function publish() {
    if (!text.trim()) return;
    onPublish(text.trim(), location);
    setText('');
    setLocation('');
  }

  return (
    <div className="bg-panel border-ember/50 font-vazirmatn flex flex-col rounded-[20px] border p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="جرقه‌ی بعدی را ثبت کن..."
        rows={4}
        className="bg-bg-2 text-ink placeholder:text-ink-3 focus:border-hair-2 w-full resize-none rounded-xl border border-transparent p-4 text-right text-[14px] leading-relaxed transition-colors outline-none"
      />

      <div className="border-hair/50 mt-4 flex items-center justify-between border-t pt-3">
        {/* Publish button */}
        <button
          onClick={publish}
          className="bg-ember hover:bg-ember-deep rounded-lg px-5 py-2 text-[13px] font-bold text-white shadow-[0_4px_12px_-4px_rgba(255,98,0,0.3)] transition-colors"
        >
          انتشار
        </button>

        {/* Action icons + user badge */}
        <div className="text-ember flex items-center gap-2.5">
          {/* TODO: Add icon names to your Icon component: paperclip, emoji, location, gif */}
          <button
            type="button"
            className="hover:bg-bg-2 rounded-md p-1.5 transition-colors"
            title="آپلود فایل"
          >
            <Icon name="paperclip" size={20} />
          </button>
          <button
            type="button"
            className="hover:bg-bg-2 rounded-md p-1.5 transition-colors"
            title="افزودن ایموجی"
          >
            <Icon name="emoji" size={20} />
          </button>
          <button
            type="button"
            className="hover:bg-bg-2 rounded-md p-1.5 transition-colors"
            title="افزودن GIF"
          >
            <span className="text-[13px] font-extrabold">GIF</span>
          </button>
          <button
            type="button"
            className="hover:bg-bg-2 rounded-md p-1.5 transition-colors"
            title="افزودن موقعیت"
            onClick={() => {
              const value = prompt('لطفاً موقعیت خود را وارد کنید:');
              if (value) setLocation(value);
            }}
          >
            <Icon name="location" size={20} />
          </button>
        </div>
      </div>

      {location && (
        <div className="text-ink-3 mt-3 flex items-center gap-1.5 text-sm">
          <Icon name="location" size={16} className="text-ember" />
          {location}
        </div>
      )}
    </div>
  );
}
