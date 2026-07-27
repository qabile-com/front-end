'use client';

import { useEffect, useRef, useState } from 'react';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { getAvatarInitial } from '@/core/lib/avatar';
import { toPersianDigits } from '@/core/lib/persian';
import { Button, Icon, Input, type IconName } from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import type { Post } from '../../domain/social.data';

interface SocialPostDetailProps {
  post: Post;
  onAddComment?: (postId: string, text: string) => void;
  onShare?: () => void;
  onLike?: () => void;
  onUnlike?: () => void;
  onAuthorClick?: (authorId: string) => void;
  isAddingComment?: boolean;
}

export function SocialPostDetail({
  post,
  onAddComment,
  onShare,
  onLike,
  onUnlike,
  onAuthorClick,
  isAddingComment = false,
}: SocialPostDetailProps) {
  const [commentText, setCommentText] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [post.comments.length]);

  const handleSubmitComment = () => {
    if (!commentText.trim() || !onAddComment) return;
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="border-hair overflow-hidden rounded-[24px] border bg-[var(--color-panel)] shadow-[0_30px_90px_-54px_var(--glow)]">
      <div className="p-4 sm:p-6">
        <button
          type="button"
          onClick={() => onAuthorClick?.(post.authorId)}
          className="group flex w-full items-center gap-3 text-right"
        >
          {post.isAdam ? (
            <AdamAvatar className="size-11" />
          ) : (
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white"
              style={{ background: post.avatar }}
            >
              {getAvatarInitial(post.author)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-ink truncate text-base font-black group-hover:text-gold">
                {post.author}
              </h1>
              {post.isAdam && (
                <span className="text-gold rounded-xs border border-[rgba(255,98,0,.18)] px-2 py-1 text-[10px] font-extrabold [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]">
                  موسس
                </span>
              )}
            </div>
            <p className="text-ink-3 mt-1 text-xs">{post.badge || 'عضو قبیله'}</p>
          </div>
          <span className="text-ink-4 text-xs">{formatRelativeTime(post.time)}</span>
        </button>

        <p className="text-ink-2 mt-5 text-right text-[15px] leading-8 whitespace-pre-wrap">
          {post.text}
        </p>

        {post.achievement && (
          <div className="mt-4 flex items-center gap-3 rounded-[16px] border border-[rgba(255,98,0,.3)] p-3.5 [background:rgba(255,98,0,.08)]">
            <span className="text-ember grid size-11 shrink-0 place-items-center rounded-xl [background:rgba(255,98,0,.18)]">
              <Icon name={post.achievement.icon as IconName} size={22} />
            </span>
            <span className="leading-tight">
              <b className="text-ember block text-[13.5px] font-extrabold">
                {post.achievement.title}
              </b>
              <small className="text-ink-3 text-[12px]">{post.achievement.sub}</small>
            </span>
          </div>
        )}

        {(post.image || post.hasImage) && (
          <div className="border-hair mt-5 overflow-hidden rounded-[18px] border bg-[var(--glass-2)]">
            {post.image ? (
              <img
                src={post.image}
                alt="Post attachment"
                className="max-h-[520px] w-full object-contain"
              />
            ) : (
              <div className="text-ink-4 grid h-52 place-items-center">
                <Icon name="book" size={34} />
              </div>
            )}
          </div>
        )}

        <div className="border-hair mt-5 flex flex-wrap items-center justify-between gap-3 border-y py-3">
          <div className="text-ink-3 flex flex-wrap gap-5 text-sm">
            <button
              type="button"
              onClick={post.likedByMe ? onUnlike : onLike}
              className={post.likedByMe ? 'flex items-center gap-1.5 text-danger' : 'hover:text-ink flex items-center gap-1.5'}
            >
              <Icon name="heart" size={17} className={post.likedByMe ? 'fill-current' : ''} />
              {toPersianDigits(post.likes)}
            </button>
            <span className="flex items-center gap-1.5">
              <Icon name="msg" size={17} />
              {toPersianDigits(post.comments.length)}
            </span>
            <button
              type="button"
              onClick={onShare}
              className="hover:text-ink flex items-center gap-1.5 transition-colors"
            >
              <Icon name="share" size={17} />
              اشتراک‌گذاری
            </button>
          </div>
        </div>
      </div>

      <section className="border-hair border-t p-4 sm:p-6">
        <h2 className="text-ink-2 mb-4 text-sm font-black">نظرات هم‌قبیله‌ای‌ها</h2>
        <div className="space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-ink-3 rounded-[16px] border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
              هنوز نظری برای این پست ثبت نشده است.
            </p>
          ) : (
            post.comments.map((comment, index) => (
              <div key={`${comment.name}-${comment.time}-${index}`} className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-full [background:var(--fire-grad)] text-xs font-black text-[#1a0a00]">
                  {getAvatarInitial(comment.name)}
                </div>
                <div className="min-w-0 flex-1 rounded-[16px] bg-black/20 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-ink text-sm font-black">{comment.name}</span>
                    <span className="text-ink-4 text-xs">{formatRelativeTime(comment.time)}</span>
                  </div>
                  <p className="text-ink-2 mt-1 text-sm leading-7">{comment.text}</p>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>
      </section>

      <div className="border-hair sticky bottom-0 flex items-center gap-3 border-t bg-[var(--color-panel)] p-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-full [background:var(--fire-grad)] text-xs font-black text-[#1a0a00]">
          {getAvatarInitial('شما')}
        </div>
        <Input
          placeholder="نظرت رو بنویس..."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          className="flex-1"
          onKeyDown={(event) => event.key === 'Enter' && handleSubmitComment()}
        />
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={handleSubmitComment}
          disabled={!commentText.trim() || isAddingComment}
        >
          {isAddingComment ? '...' : 'ارسال'}
        </Button>
      </div>
    </article>
  );
}
