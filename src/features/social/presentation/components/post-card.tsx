'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Icon,
  InlineSpinner,
  OptionalImage,
  PostAttachmentImage,
  UserAvatar,
  type IconName,
} from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import { cn } from '@/core/lib/cn';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';
import type { Post } from '../../domain/social.data';
import type { IAdminRepository } from '../../domain/admin-repository';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import { useLikePost } from '../../application/use-like-post';
import { useDeleteOwnPost } from '../../application/use-delete-own-post';
import { usePinOwnPost } from '../../application/use-pin-own-post';
import { useAdminPinPost } from '../../application/useAdminPinPost';
import { formatUsername } from '../lib/format-username';
import { DeletePostConfirmModal } from './delete-post-confirm-modal';

export function PostCard({
  post,
  onClick,
  onShare,
  onAuthorClick,
  onToggleAuthorFollow,
  isTogglingAuthorFollow,
  togglingAuthorId,
  currentUserRole,
  currentUserId,
  adminRepo,
  onReward,
}: {
  post: Post;
  onClick: () => void;
  onShare: () => void;
  onAuthorClick: (authorId: string) => void;
  onToggleAuthorFollow: (authorId: string, isFollowedByMe: boolean) => void;
  isTogglingAuthorFollow: boolean;
  togglingAuthorId?: string;
  currentUserRole?: string;
  currentUserId?: string;
  adminRepo?: IAdminRepository;
  onReward?: (reward?: ActionRewardResult | null) => void;
}) {
  const { like, unlike, isToggling: isTogglingLike } = useLikePost(socialRepo, onReward);
  const deleteOwnPost = useDeleteOwnPost(socialRepo);
  const pinOwnPost = usePinOwnPost(socialRepo);
  const adminPinPost = useAdminPinPost(adminRepo as IAdminRepository);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare();
  };

  const queryClient = useQueryClient();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (post.likedByMe) {
      unlike(post.id);
    } else {
      like(post.id);
    }
  };

  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';

  const handleDeletePost = async () => {
    const request =
      isAdmin && adminRepo ? adminRepo.deletePost(post.id) : deleteOwnPost.mutateAsync(post.id);

    try {
      await request;
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      setDeleteModalOpen(false);
      showSuccess('پست حذف شد.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'حذف پست انجام نشد.');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!adminRepo || adminPinPost.isPending) return;
    adminPinPost.mutate(
      { postId: post.id, isPinned: !post.isPinned },
      {
        onSuccess: () =>
          showSuccess(post.isPinned ? 'پست از حالت سنجاق خارج شد.' : 'پست سنجاق شد.'),
        onError: (error) =>
          showError(error instanceof Error ? error.message : 'تغییر وضعیت سنجاق انجام نشد.'),
      },
    );
  };

  const handleOwnPinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    pinOwnPost.mutate(
      { postId: post.id, isPinned: !post.isPinned },
      {
        onSuccess: () =>
          showSuccess(post.isPinned ? 'پست از حالت سنجاق خارج شد.' : 'پست سنجاق شد.'),
        onError: (error) =>
          showError(error instanceof Error ? error.message : 'تغییر وضعیت سنجاق انجام نشد.'),
      },
    );
  };

  const isOwnPost = Boolean(currentUserId && post.authorId === currentUserId);
  const canFollowAuthor = Boolean(post.canFollowAuthor);
  const isFollowingAuthor = Boolean(post.isAuthorFollowedByMe);
  const isCurrentAuthorToggling = isTogglingAuthorFollow && togglingAuthorId === post.authorId;

  return (
    <>
      <article
        className={cn(
          'relative cursor-pointer overflow-hidden transition-all',
          post.isAdam
            ? `border-t border-[rgba(255,98,0,.25)] bg-[#140C07] shadow-[0_0_0_1px_rgba(255,130,40,.05),0_20px_40px_rgba(0,0,0,.35)]`
            : `border-t border-[#2A1C16] bg-[#090705]`,
        )}
        onClick={onClick}
      >
        {post.isPinned && (
          <div className="text-gold absolute top-2 right-2 text-xs font-bold">
            <Icon name="star" size={16} />
          </div>
        )}
        {post.isAdam && <FounderBanner />}
        <div className="p-5">
          {/* Author area */}
          <div className="flex items-center gap-3">
            {/*  author avatar and name  */}
            {/* Admin actions */}
            <button
              type="button"
              className="focus-visible:ring-ember shrink-0 rounded-full focus-visible:ring-2 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick(post.authorId);
              }}
              aria-label={`مشاهده پروفایل ${post.author}`}
            >
              {post.isAdam ? (
                <AdamAvatar className="size-11" />
              ) : (
                <UserAvatar name={post.author} avatar={post.avatar} className="size-11 text-sm" />
              )}
            </button>
            <div
              className="min-w-0 flex-1 leading-tight"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick(post.authorId);
              }}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <b className="truncate text-sm font-extrabold">{post.author}</b>
                {post.verified && (
                  <span className="relative inline-block size-6 shrink-0">
                    <OptionalImage
                      src="/assets/verified-user.webp"
                      alt="verified"
                      className="object-contain"
                    />
                  </span>
                )}
                {post.isAdam && (
                  <span className="text-gold rounded-xs border border-[rgba(255,98,0,.18)] px-2 py-1 text-[10px] font-extrabold shadow-[0_4px_16px_-8px_rgba(255,98,0,.25)] [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]">
                    موسس
                  </span>
                )}
              </div>
              {(() => {
                const username = formatUsername(post.authorUsername);
                return username ? (
                  <small className="text-ink-4 mb-1 block truncate text-[11px] font-bold">
                    {username}
                  </small>
                ) : null;
              })()}
              <small className={`${post.isAdam ? 'text-gold' : 'text-ink-3'} text-[12px]`}>
                {post.isAdam ? 'ققنوس' : post.badge}
              </small>
              {canFollowAuthor && !isFollowingAuthor && (
                <button
                  type="button"
                  disabled={isCurrentAuthorToggling}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleAuthorFollow(post.authorId, isFollowingAuthor);
                  }}
                  className={cn(
                    'mt-2 inline-flex min-h-8 min-w-22 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition-[border-color,background,color,opacity] disabled:opacity-80',
                    isFollowingAuthor
                      ? 'border-gold/40 text-gold bg-white/5'
                      : 'border-transparent text-[#1a0a00] [background:var(--fire-grad)]',
                  )}
                >
                  {isCurrentAuthorToggling && <InlineSpinner className="size-3" />}
                  {isFollowingAuthor ? 'فالو شده' : 'فالو کردن'}
                </button>
              )}
            </div>
            <div className="ms-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={handlePinToggle}
                    disabled={adminPinPost.isPending}
                    className="text-gold hover:text-ember disabled:opacity-60"
                    aria-label={post.isPinned ? 'برداشتن سنجاق پست' : 'سنجاق کردن پست'}
                  >
                    <Icon name={post.isPinned ? 'star' : 'star-line'} size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="text-danger hover:text-red-400"
                    aria-label="حذف پست"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </>
              )}
              {!isAdmin && isOwnPost && (
                <>
                  <button
                    type="button"
                    onClick={handleOwnPinToggle}
                    disabled={pinOwnPost.isPending}
                    className="text-gold hover:text-ember disabled:opacity-60"
                    aria-label={post.isPinned ? 'برداشتن سنجاق پست' : 'سنجاق کردن پست'}
                  >
                    <Icon name={post.isPinned ? 'star' : 'star-line'} size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={deleteOwnPost.isPending}
                    className="text-danger hover:text-red-400 disabled:opacity-60"
                    aria-label="حذف پست"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="mt-3.5 text-[14.5px] leading-[1.8] whitespace-pre-line">{post.text}</p>
          {post.achievement && (
            <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-[rgba(255,98,0,.3)] p-3.5 [background:rgba(255,98,0,.08)]">
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
            <>
              {post.attachment?.url || post.image ? (
                <PostAttachmentImage
                  src={post.attachment?.url ?? post.image ?? ''}
                  className="mt-3"
                />
              ) : (
                <div className="text-ink-4 mt-3 grid h-44 place-items-center overflow-hidden rounded-[14px] [background:var(--glass-2)]">
                  <Icon name="book" size={34} />
                </div>
              )}
            </>
          )}

          {/* Like, comment, share */}
          <div className="text-ink-3 mt-4 flex flex-col gap-3 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="flex flex-wrap gap-x-8 gap-y-3 sm:gap-10">
              <button
                type="button"
                onClick={handleLike}
                disabled={isTogglingLike}
                aria-label={post.likedByMe ? 'برداشتن لایک' : 'لایک کردن پست'}
                aria-pressed={post.likedByMe}
                className={cn(
                  'flex items-center gap-1.5 transition-colors disabled:opacity-60',
                  post.likedByMe && 'text-[#ff5a5a]',
                )}
              >
                <Icon name="heart" size={18} className={post.likedByMe ? 'fill-current' : ''} />
                {toPersianDigits(post.likes)}
              </button>
              <button
                type="button"
                onClick={handleCommentClick}
                aria-label={`مشاهده نظرات (${toPersianDigits(post.commentsCount ?? post.comments.length)})`}
                className="hover:text-ink flex items-center gap-1.5 transition-colors"
              >
                <Icon name="msg" size={18} />
                {toPersianDigits(post.commentsCount ?? post.comments.length)}
              </button>
              <button
                type="button"
                onClick={handleShareClick}
                className="hover:text-ink flex items-center gap-1.5 transition-colors"
              >
                <Icon name="share" size={18} />
                اشتراک‌گذاری
              </button>
            </div>
            <time className="text-ink-4 block text-xs sm:text-[13px]">
              {formatRelativeTime(post.time)}
            </time>
          </div>
        </div>
      </article>
      <DeletePostConfirmModal
        isOpen={deleteModalOpen}
        isDeleting={deleteOwnPost.isPending}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => void handleDeletePost()}
      />
    </>
  );
}

function FounderBanner() {
  return (
    <>
      <div
        className="my-4 h-0.75 bg-gradient-to-r from-[rgba(255,98,0,.25)] from-20% via-[#E8A545] via-30% to-[rgba(255,98,0,.25)] to-80%"
        style={{
          maskImage: 'radial-gradient(ellipse 50% 100% at 50% 50%, black 30%, transparent 100%)',
        }}
      />
      <div className="relative mb-7 flex items-center justify-center">
        <div className="absolute inset-x-5 h-px bg-gradient-to-r from-[#524133d6] via-transparent to-[#524133d6]" />
        <span className="relative z-10 flex items-center gap-1 bg-[#140C07] px-4 text-[12px] font-bold text-[#E8A545]">
          <Icon name="flame" size={12} color="#FF6200" />
          پیام از بنیانگذار
        </span>
      </div>
    </>
  );
}
