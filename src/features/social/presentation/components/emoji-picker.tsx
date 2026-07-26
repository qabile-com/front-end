// src/features/dashboard/presentation/components/emoji-picker.tsx
'use client';

import { cn } from '@/core/lib/cn';

const EMOJIS = [
  '🔥',
  '❤️',
  '😂',
  '😍',
  '👍',
  '🎉',
  '😢',
  '😡',
  '💪',
  '🙏',
  '✨',
  '🚀',
  '💡',
  '📚',
  '🎯',
  '🏆',
  '⚡',
  '💎',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  return (
    <div className="border-hair absolute bottom-full left-0 z-20 mb-2 rounded-xl border bg-[var(--color-panel)] p-2 shadow-xl">
      <div className="grid w-[220px] grid-cols-6 gap-1">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="hover:bg-ember/20 flex items-center justify-center rounded-md p-1.5 text-xl transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
