// src/features/dashboard/presentation/sections/create-post.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Icon } from '@/shared/ui';
import { EmojiPicker } from '../components/emoji-picker';
import { cn } from '@/core/lib/cn';

interface Props {
  onPublish: (
    text: string,
    location?: string,
    emoji?: string,
    imageFile?: File | null,
    gifUrl?: string,
  ) => void;
}

export function CreatePost({ onPublish }: Props) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [gifUrl, setGifUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const gifPopupRef = useRef<HTMLDivElement>(null);
  const emojiPopupRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPopupRef.current && !emojiPopupRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
      if (gifPopupRef.current && !gifPopupRef.current.contains(e.target as Node)) {
        setGifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      alert('مرورگر شما از موقعیت‌مکانی پشتیبانی نمی‌کند.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fa`,
          );
          const data = await res.json();
          const address = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(address);
        } catch {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        alert('خطا در دریافت موقعیت: ' + error.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
    setEmojiOpen(false);
  };

  const handleGifSubmit = () => {
    if (gifUrl.trim()) {
      setGifOpen(false);
    }
  };

  const publish = () => {
    if (!text.trim() && !imageFile && !gifUrl) return;
    onPublish(text.trim(), location || undefined, undefined, imageFile, gifUrl || undefined);
    setText('');
    setLocation('');
    setImageFile(null);
    setImagePreview(null);
    setGifUrl('');
    setGifOpen(false);
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

      {/* Image preview */}
      {imagePreview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <img src={imagePreview} alt="preview" className="max-h-60 w-full object-cover" />
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

      {/* GIF preview */}
      {gifUrl && !imagePreview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <img src={gifUrl} alt="GIF preview" className="max-h-60 w-full object-cover" />
          <button
            onClick={() => setGifUrl('')}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
          >
            <Icon name="plus" size={16} className="rotate-45" />
          </button>
        </div>
      )}

      {/* Toolbar & Publish */}
      <div className="mt-4 flex flex-wrap items-center gap-2 place-self-end">
        <div className="text-ember flex items-center gap-2.5">
          {/* File upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-ember/10 rounded-md p-1.5 transition-colors"
            title="آپلود فایل"
          >
            <Icon name="paperclip" size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />

          {/* Emoji picker */}
          <div className="relative" ref={emojiPopupRef}>
            <button
              type="button"
              onClick={() => setEmojiOpen(!emojiOpen)}
              className="hover:bg-ember/10 rounded-md p-1.5 transition-colors"
              title="افزودن ایموجی"
            >
              <Icon name="emoji" size={20} />
            </button>
            {emojiOpen && <EmojiPicker onSelect={handleEmojiSelect} />}
          </div>

          {/* GIF */}
          <div className="relative" ref={gifPopupRef}>
            <button
              type="button"
              onClick={() => setGifOpen(!gifOpen)}
              className="hover:bg-ember/10 rounded-md p-1.5 transition-colors"
              title="افزودن GIF"
            >
              <span className="text-[13px] font-extrabold">GIF</span>
            </button>
            {gifOpen && (
              <div className="border-hair absolute bottom-full left-0 z-20 mb-2 flex gap-2 rounded-xl border bg-[var(--color-panel)] p-2 shadow-xl">
                <input
                  type="text"
                  placeholder="URL گیف"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  className="border-hair text-ink rounded-lg border bg-[var(--glass-2)] px-2 py-1 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={handleGifSubmit}
                  className="bg-ember hover:bg-ember-deep rounded-lg px-3 py-1 text-xs font-bold text-[#1a0a00] transition-colors"
                >
                  تأیید
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <button
            type="button"
            onClick={handleLocationClick}
            disabled={locationLoading}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              locationLoading ? 'cursor-wait opacity-50' : 'hover:bg-ember/10',
            )}
            title="افزودن موقعیت"
          >
            {locationLoading ? (
              <span className="animate-pulse text-xs font-bold">...</span>
            ) : (
              <Icon name="location" size={20} />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={publish}
          className="rounded-md px-5 py-2 font-bold text-[#1a0a00] transition-opacity [background:var(--fire-grad)] hover:opacity-90"
        >
          انتشار
        </button>
      </div>

      {/* Location display */}
      {location && !locationLoading && (
        <div className="text-ink-3 mt-2 flex items-center gap-1.5 text-sm">
          <Icon name="location" size={16} className="text-ember" />
          {location}
        </div>
      )}
    </article>
  );
}
