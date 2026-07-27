// src/features/dashboard/presentation/sections/create-post.tsx
'use client';

import { useState } from 'react';

interface Props {
  onPublish: (text: string, imageFile?: File | null) => void;
  onPublished?: () => void;
}

export function CreatePost({ onPublish, onPublished }: Props) {
  const [text, setText] = useState('');
  // Image upload is temporarily disabled. Keep the publish contract unchanged
  // so enabling it again later only needs restoring the UI below.
  // const [imageFile, setImageFile] = useState<File | null>(null);
  // const [imagePreview, setImagePreview] = useState<string | null>(null);

  // const fileInputRef = useRef<HTMLInputElement>(null);
  //
  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   setImageFile(file);
  //   setImagePreview(URL.createObjectURL(file));
  // };

  const publish = () => {
    if (!text.trim()) return;
    onPublish(text.trim(), null);
    setText('');
    // setImageFile(null);
    // setImagePreview(null);
    onPublished?.();
  };

  return (
    <article className="border-hair rounded-[20px] border bg-(--glass) p-5">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="جرقه‌ی بعدی را ثبت کن..."
        rows={5}
        className="text-ink placeholder:text-ink-3 w-full resize-none rounded-xl bg-(--glass-2) p-4 outline-none"
      />

      {/* Image preview - temporarily disabled */}
      {/*
      {imagePreview && (
        <div className="border-hair relative mt-3 grid max-h-[60dvh] place-items-center overflow-hidden rounded-xl border bg-black/35 p-2">
          <img
            src={imagePreview}
            alt="preview"
            className="h-auto max-h-[56dvh] w-auto max-w-full rounded-lg object-contain"
          />
          <button
            onClick={() => {
              setImageFile(null);
              setImagePreview(null);
            }}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
          >
            <Icon name="plus" size={16} className="rotate-45" />
          </button>
        </div>
      )}
      */}

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
