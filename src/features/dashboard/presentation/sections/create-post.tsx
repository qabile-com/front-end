'use client';

import { useRef, useState } from 'react';
// import { Icon } from '@/shared/ui';
import type { Post } from '@/features/dashboard/domain/social.data';

interface Props {
  onPublish(post: Post): void;
}

export function CreatePost({ onPublish }: Props) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [emoji, setEmoji] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  function publish() {
    if (!text.trim()) return;

    onPublish({
      id: crypto.randomUUID(),
      author: 'شما',
      authorId: 'me',
      avatar: 'linear-gradient(135deg,#ff8a3d,#cc4308)',
      badge: 'عضو',
      time: 'همین الان',
      text: text + (location ? `\n📍 ${location}` : '') + emoji,
      likes: 0,
      comments: [],
    });

    setText('');
    setLocation('');
    setEmoji('');
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
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-[var(--glass-2)]"
          onClick={() => {
            const value = prompt('Location');

            if (value) setLocation(value);
          }}
        >
          {/* <Icon name="location" size={18} /> */}
        </button>
        {/* 
        <button
          type="button"
          className="rounded-lg p-2 hover:bg-[var(--glass-2)]"
          onClick={() => {
            const value = prompt('Emoji');

            if (value) setEmoji(value);
          }}
        >
          😊
        </button> */}

        {/* <button
          type="button"
          className="rounded-lg p-2 hover:bg-[var(--glass-2)]"
          onClick={() => fileRef.current?.click()}
        > */}
        {/* <Icon name="image" size={18} /> */}
        {/* </button> */}

        {/* <button type="button" className="rounded-lg p-2 hover:bg-[var(--glass-2)]">
          GIF
        </button> */}

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
