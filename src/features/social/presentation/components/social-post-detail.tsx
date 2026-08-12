'use client';

import { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { toPersianDigits } from '@/core/lib/persian';
import { Button, Icon, Input, OptionalImage, UserAvatar, type IconName } from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import type { Post, PostComment } from '../../domain/social.data';
import { formatUsername } from '../lib/format-username';

interface SocialPostDetailProps {
  post: Post;
  onAddComment?: (postId: string, text: string) => Promise<boolean>;
  onShare?: () => void;
  onLike?: () => void;
  onUnlike?: () => void;
  onAuthorClick?: (authorId: string) => void;
  onCommentAuthorClick?: (authorId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  canManageComments?: boolean;
  isAddingComment?: boolean;
  currentUserName?: string | null;
  currentUserAvatar?: string | null;
  currentUserId?: string | null;
}

export function SocialPostDetail({
  post,
  onAddComment,
  onShare,
  onLike,
  onUnlike,
  onAuthorClick,
  onCommentAuthorClick,
  onDeleteComment,
  canManageComments = false,
  isAddingComment = false,
  currentUserName,
  currentUserAvatar,
  currentUserId,
}: SocialPostDetailProps) {
  const [commentText, setCommentText] = useState('');
  const composerRef = useRef<HTMLDivElement>(null);
  const scrollParentRef = useRef<HTMLDivElement | null>(null);
  const shouldScrollAfterSubmitRef = useRef(false);
  const commentsTotal = post.commentsCount ?? post.comments.length;

  const virtualizer = useVirtualizer({
    count: post.comments.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 96,
    overscan: 8,
    gap: 12,
  });

  const handleScrollToComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!shouldScrollAfterSubmitRef.current || isAddingComment || post.comments.length === 0) {
      return;
    }

    const scrollId = window.setTimeout(() => {
      virtualizer.scrollToIndex(post.comments.length - 1, { align: 'end', behavior: 'smooth' });
      shouldScrollAfterSubmitRef.current = false;
    }, 80);

    return () => window.clearTimeout(scrollId);
  }, [post.comments.length, isAddingComment, virtualizer]);

  const handleSubmitComment = async () => {
    const text = commentText.trim();
    if (!text || !onAddComment) return;
    shouldScrollAfterSubmitRef.current = true;
    setCommentText('');
    const succeeded = await onAddComment(post.id, text);
    if (!succeeded) {
      setCommentText((current) => (current ? current : text));
    }
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
            <UserAvatar name={post.author} avatar={post.avatar} className="size-11 text-sm" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-ink group-hover:text-gold truncate text-base font-black">
                {post.author}
              </h1>
              {post.isAdam && (
                <span className="text-gold rounded-xs border border-[rgba(255,98,0,.18)] px-2 py-1 text-[10px] font-extrabold [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]">
                  موسس
                </span>
              )}
            </div>
            {formatUsername(post.authorUsername) && (
              <p className="text-ink-4 mt-1 truncate text-xs font-bold">
                {formatUsername(post.authorUsername)}
              </p>
            )}
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

        {(post.attachment?.url || post.image || post.hasImage) && (
          <div className="border-hair mt-5 overflow-hidden rounded-[18px] border bg-[var(--glass-2)]">
            {post.attachment?.url || post.image ? (
              <OptionalImage
                src={post.attachment?.url ?? post.image ?? ''}
                alt="تصویر پیوست پست"
                fill={false}
                className="max-h-[min(640px,75vh)] w-full object-cover"
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
              className={
                post.likedByMe
                  ? 'text-danger flex items-center gap-1.5'
                  : 'hover:text-ink flex items-center gap-1.5'
              }
            >
              <Icon name="heart" size={17} className={post.likedByMe ? 'fill-current' : ''} />
              {toPersianDigits(post.likes)}
            </button>
            <button
              type="button"
              onClick={handleScrollToComposer}
              className="hover:text-ink flex items-center gap-1.5 transition-colors"
            >
              <Icon name="msg" size={17} />
              {toPersianDigits(post.commentsCount ?? post.comments.length)}
            </button>
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

      <div
        ref={composerRef}
        className="border-hair flex items-center gap-3 border-t bg-[var(--color-panel)] p-4 sm:px-6"
      >
        <UserAvatar
          name={currentUserName ?? '?'}
          avatar={currentUserAvatar ?? undefined}
          className="size-9 text-xs"
        />
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

      <section className="border-hair border-t p-4 sm:p-6">
        <h2 className="text-ink-2 mb-4 flex items-center gap-2 text-sm font-black">
          <span>نظرات هم‌قبیله‌ای‌ها</span>
          <span className="text-gold px-2 py-0.5 text-xs">
            ( {toPersianDigits(commentsTotal)} )
          </span>
        </h2>
        {post.comments.length === 0 ? (
          <p className="text-ink-3 rounded-[16px] border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
            هنوز نظری ثبت نشده؛ اولین نظر را تو بنویس.
          </p>
        ) : (
          <div
            ref={scrollParentRef}
            className="max-h-[430px] overflow-y-auto overscroll-contain rounded-[18px] pe-1"
          >
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const comment = post.comments[virtualItem.index];
                if (!comment) return null;

                return (
                  <div
                    key={`${comment.id ?? comment.name}-${comment.time}-${virtualItem.index}`}
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    className="absolute inset-x-0 top-0"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <PostCommentItem
                      comment={comment}
                      canDelete={Boolean(
                        canManageComments || (currentUserId && comment.authorId === currentUserId),
                      )}
                      onAuthorClick={onCommentAuthorClick}
                      onDelete={onDeleteComment}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}

function PostCommentItem({
  comment,
  canDelete,
  onAuthorClick,
  onDelete,
}: {
  comment: PostComment;
  canDelete: boolean;
  onAuthorClick?: (authorId: string) => void;
  onDelete?: (commentId: string) => void;
}) {
  return (
    <div className="flex items-start gap-3 pb-3">
      <button
        type="button"
        disabled={!comment.authorId}
        onClick={() => comment.authorId && onAuthorClick?.(comment.authorId)}
        className="size-9 shrink-0 rounded-full disabled:cursor-default"
        aria-label={`مشاهده پروفایل ${comment.name}`}
      >
        <UserAvatar name={comment.name} avatar={comment.avatar} className="size-9 text-xs" />
      </button>
      <div className="min-w-0 flex-1 rounded-[16px] bg-black/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0">
            <button
              type="button"
              disabled={!comment.authorId}
              onClick={() => comment.authorId && onAuthorClick?.(comment.authorId)}
              className="text-ink hover:text-gold disabled:hover:text-ink block max-w-full truncate text-sm font-black disabled:cursor-default"
            >
              {comment.name}
            </button>
            {formatUsername(comment.username) && (
              <span className="text-ink-4 block truncate text-[11px] font-bold">
                {formatUsername(comment.username)}
              </span>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-ink-4 text-xs">{formatRelativeTime(comment.time)}</span>
            {canDelete && comment.id && (
              <button
                type="button"
                onClick={() => onDelete?.(comment.id!)}
                aria-label="حذف نظر"
                className="text-danger/70 hover:text-danger hover:bg-danger/10 -m-1 rounded-full p-1.5 transition-colors"
              >
                <Icon name="trash" size={14} />
              </button>
            )}
          </span>
        </div>
        <p className="text-ink-2 mt-1 text-sm leading-7">{comment.text}</p>
      </div>
    </div>
  );
}
