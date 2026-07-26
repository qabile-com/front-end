// src/features/dashboard/presentation/components/social-post-detail-modal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { toPersianDigits } from '@/core/lib/persian';
import { Button, Icon, Input } from '@/shared/ui';
import type { Post } from '../../domain/social.data';
import { useScrollLock } from '@/shared/hooks/use-scroll-lock';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onAddComment?: (postId: string, text: string) => void;
  onShare?: () => void;
}

export function SocialPostDetailModal({ isOpen, onClose, post, onAddComment, onShare }: Props) {
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  // Auto-scroll to bottom when comments change
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [post.comments.length]);

  if (!isOpen) return null;

  const handleSubmitComment = () => {
    if (commentText.trim() && onAddComment) {
      onAddComment(post.id, commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="border-hair flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-[var(--color-panel)] shadow-2xl">
        {/* Header */}
        <div className="border-hair flex shrink-0 items-center justify-between border-b p-4">
          <button onClick={onClose} className="text-ink-2 hover:text-ink">
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
          <h2 className="text-ink-2 text-sm font-bold">پست</h2>
          <div className="w-6" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-0">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-white"
                style={{ background: post.avatar }}
              >
                {post.author.slice(0, 1)}
              </div>
              <div className="flex-1 text-right">
                <div className="text-ink text-sm font-bold">{post.author}</div>
                <div className="text-ink-4 text-xs">{post.badge || 'عضو'}</div>
              </div>
            </div>

            <div className="text-ink-2 text-right text-sm leading-7 whitespace-pre-wrap">
              {post.text}
            </div>

            {(post.image || post.hasImage) && (
              <div className="border-hair mt-4 overflow-hidden rounded-xl border bg-[var(--glass-2)]">
                {post.image ? (
                  <img
                    src={post.image}
                    alt="Post attachment"
                    className="max-h-[400px] w-full object-cover"
                  />
                ) : (
                  <div className="text-ink-4 flex h-44 items-center justify-center">
                    <Icon name="book" size={32} className="opacity-50" />
                  </div>
                )}
              </div>
            )}

            <div className="border-hair mt-4 flex items-center justify-between border-y py-3">
              <div className="text-ink-3 flex gap-4 text-sm">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`hover:text-ember flex items-center gap-1 transition-colors ${liked ? 'text-ember' : ''}`}
                >
                  <Icon name="heart" size={16} className={liked ? 'fill-current' : ''} />
                  {toPersianDigits(post.likes + (liked ? 1 : 0))}
                </button>
                <span className="flex items-center gap-1">
                  <Icon name="msg" size={16} />
                  {toPersianDigits(post.comments.length)}
                </span>
                <button
                  onClick={onShare}
                  className="hover:text-ink flex items-center gap-1 transition-colors"
                >
                  <Icon name="share" size={16} />
                  اشتراک‌گذاری
                </button>
              </div>
              <div className="text-ink-4 text-xs">{post.time}</div>
            </div>
          </div>

          <div className="p-4">
            <p className="text-ink-3 mb-3 text-xs font-bold">نظرات هم‌قبله‌ای‌ها</p>
            <div className="flex flex-col gap-4">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                    {comment.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between">
                      <span className="text-ink text-sm font-bold">{comment.name}</span>
                      <span className="text-ink-4 text-xs">{comment.time}</span>
                    </div>
                    <p className="text-ink-2 mt-1 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          </div>
        </div>

        <div className="border-hair flex shrink-0 items-center gap-3 border-t p-4">
          <div className="bg-ember flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
            آ
          </div>
          <Input
            placeholder="نظرت رو بنویس..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
          />
          <Button
            variant="primary"
            size="sm"
            className="shrink-0"
            onClick={handleSubmitComment}
            disabled={!commentText.trim()}
          >
            ارسال
          </Button>
        </div>
      </div>
    </div>
  );
}
