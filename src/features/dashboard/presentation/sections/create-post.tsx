'use client';

import { useRef, useState } from 'react';
import type { Post } from '@/features/dashboard/domain/social.data';
import { Icon } from '@/shared/ui';

interface Props {
  onPublish(post: Post): void;
}

export function CreatePost({ onPublish }: Props) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function publish() {
    if (!text.trim()) return;
    // onPublish(text.trim(), location);
    setText('');
    setLocation('');
  }

  return (
    <article className="border-hair rounded-[20px] border bg-[var(--glass)] p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="جرقه‌ی بعدی را ثبت کن..."
        rows={5}
        className="w-full resize-none rounded-xl bg-[var(--glass-2)] p-4 outline-none"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2 place-self-end">
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

        <input hidden type="file" ref={fileRef} />

        <button
          type="button"
          onClick={publish}
          className="rounded-md px-5 py-2 font-bold text-[#1a0a00] [background:var(--fire-grad)]"
        >
          انتشار
        </button>
      </div>

      {location && <div className="mt-3 text-sm text-orange-300">📍 {location}</div>}
    </article>
  );
}
