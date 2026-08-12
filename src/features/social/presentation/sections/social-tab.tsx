'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BaseModal,
  Button,
  ErrorState,
  Icon,
  Input,
  InlineSpinner,
  OptionalImage,
  SocialSkeleton,
  UserAvatar,
  type IconName,
} from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { toPersianDigits } from '@/core/lib/persian';
import { useIsLargeScreen } from '@/core/lib/use-is-large-screen';
import type { Post, ActiveUser } from '../../domain/social.data';
import type { IProfileRepository, MyProfile } from '@/features/profile/domain/profile-repository';
import { useUpdateMyProfile } from '@/features/profile/application/use-edit-profile';
import {
  isValidUsername,
  normalizeUsernameInput,
  USERNAME_VALIDATION_MESSAGE,
} from '@/features/profile/domain/username-validation';
import { Panel } from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import { CreatePost } from './create-post';
import { adminRepo, socialRepo } from '@/features/social/infrastructure/repository-factory';
import {
  type UseInfiniteQueryResult,
  type InfiniteData,
  useQueryClient,
} from '@tanstack/react-query';
import { IAdminRepository } from '../../domain/admin-repository';
import { useLikePost } from '../../application/use-like-post';
import { formatUsername } from '../lib/format-username';
import { useToggleUserFollow } from '../../application/use-toggle-user-follow';
import { useDeleteOwnPost } from '../../application/use-delete-own-post';
import { usePinOwnPost } from '../../application/use-pin-own-post';
import { DeletePostConfirmModal } from '../components/delete-post-confirm-modal';
import { shareUrl } from '@/shared/lib/native-share';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';

type Feed = 'for-you' | 'following';

interface SocialTabProps {
  feedQuery: UseInfiniteQueryResult<InfiniteData<Post[]>>;
  feed: Feed;
  onFeedChange: (feed: Feed) => void;
  tags: string[];
  activeUsers: ActiveUser[];
  search: string;
  onSearchChange: (value: string) => void;
  onPublish: (text: string, imageFile?: File | null) => void | Promise<void>;
  currentUserRole?: string;
  currentProfile?: MyProfile | null;
  isCurrentProfileLoading?: boolean;
  profileRepo: IProfileRepository;
  adminRepo?: IAdminRepository;
  newPostIds?: Set<string>;
  onReward?: (reward?: ActionRewardResult | null) => void;
}

export function SocialTab({
  feedQuery,
  feed,
  onFeedChange,
  tags,
  activeUsers,
  search,
  onSearchChange,
  onPublish,
  currentUserRole,
  currentProfile,
  isCurrentProfileLoading,
  profileRepo,
  newPostIds,
  onReward,
}: SocialTabProps) {
  const router = useRouter();
  const followToggle = useToggleUserFollow(socialRepo, onReward);
  const updateProfile = useUpdateMyProfile(profileRepo, onReward);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCompleteProfileOpen, setIsCompleteProfileOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const allPosts = useMemo(() => feedQuery.data?.pages.flat() ?? [], [feedQuery.data]);
  const hasNextPage = Boolean(feedQuery.hasNextPage);
  const isFetchingNextPage = feedQuery.isFetchingNextPage;
  const fetchNextPage = feedQuery.fetchNextPage;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || isFetchingNextPage) return;
        void fetchNextPage();
      },
      {
        root: null,
        rootMargin: '420px 0px',
        threshold: 0.01,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleShare = async (post: Post) => {
    try {
      await shareUrl({
        title: post.author ? `پست ${post.author}` : 'پست قبیله',
        path: `/social/${post.id}`,
      });
      showSuccess('لینک پست کپی شد');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      showError('اشتراک‌گذاری انجام نشد');
    }
  };

  const handleOpenCreatePost = () => {
    if (isCurrentProfileLoading) {
      showError('پروفایل هنوز در حال دریافت است. چند لحظه دیگر دوباره تلاش کن.');
      return;
    }

    if (!hasRequiredForumProfile(currentProfile)) {
      setIsCompleteProfileOpen(true);
      return;
    }

    setIsCreatePostOpen(true);
  };

  return (
    <div className="grid gap-7 min-[1100px]:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="absolute inset-y-0 start-3.5 my-auto text-[#FF6200]"
          />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی پست، کاربر یا #هشتگ"
            className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 h-12 w-full rounded-xl border ps-11 pe-4 text-base outline-none [background:var(--glass-2)]"
          />
        </div>

        {/* Feed tabs */}
        <div className="border-hair grid grid-cols-2 gap-1 rounded-xl border p-1 [background:var(--glass-2)]">
          {(
            [
              ['for-you', 'برای شما'],
              ['following', 'دنبال‌شده‌ها'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onFeedChange(id)}
              className={cn(
                'rounded-lg py-2.5 text-[13.5px] font-bold transition-colors',
                feed === id ? 'text-[#1a0a00] [background:var(--fire-grad)]' : 'text-ink-2',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading & error states */}
        {feedQuery.isLoading && <SocialSkeleton />}
        {feedQuery.isError && (
          <div className="flex min-h-64 items-center justify-center">
            <ErrorState
              compact
              title="پست‌ها دریافت نشد"
              message="ارتباط با محفل برقرار نشد. دوباره تلاش کن."
              action={{
                label: 'تلاش دوباره',
                onClick: () => void feedQuery.refetch(),
                icon: 'bolt',
              }}
            />
          </div>
        )}

        {/* Feed */}
        {feedQuery.isSuccess && allPosts.length === 0 && (
          <div className="text-ink-3 border-hair rounded-[20px] border py-16 text-center [background:var(--glass)]">
            نتیجه‌ای پیدا نشد
          </div>
        )}
        {allPosts.map((post) => {
          const isNew = newPostIds?.has(post.id);
          return (
            <motion.div
              key={post.id}
              initial={isNew ? { opacity: 0, y: -20, scale: 0.98 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 22,
                mass: 0.8,
              }}
            >
              <PostCard
                post={post}
                onClick={() => router.push(`/social/${post.id}`)}
                onShare={() => void handleShare(post)}
                onAuthorClick={(authorId) => router.push(`/social/users/${authorId}`)}
                onToggleAuthorFollow={(authorId, isFollowedByMe) =>
                  followToggle.mutate({ userId: authorId, isFollowedByMe })
                }
                isTogglingAuthorFollow={followToggle.isPending}
                togglingAuthorId={followToggle.variables?.userId}
                currentUserRole={currentUserRole}
                currentUserId={currentProfile?.id}
                adminRepo={adminRepo}
                onReward={onReward}
              />
            </motion.div>
          );
        })}

        {feedQuery.isSuccess && allPosts.length > 0 && (
          <div
            ref={loadMoreRef}
            aria-live="polite"
            className="flex min-h-16 items-center justify-center py-3"
          >
            {isFetchingNextPage ? (
              <div className="border-hair text-ink-2 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-bold [background:var(--glass-2)]">
                <InlineSpinner className="text-ember size-4" />
                <span>در حال دریافت پست‌ها</span>
              </div>
            ) : hasNextPage ? (
              <span className="sr-only">دریافت خودکار پست‌های بیشتر</span>
            ) : (
              <span className="text-ink-4 text-xs font-bold">همه پست‌ها نمایش داده شد</span>
            )}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="hidden flex-col gap-4 min-[1100px]:flex">
        <Panel title={undefined}>
          <h4 className="mb-3 text-[14px] font-extrabold">داغ‌ترین هشتگ‌ها</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSearchChange(tag)}
                className="text-ember rounded-full border border-[rgba(255,98,0,.18)] px-3 py-1.5 text-[12.5px] font-bold [background:rgba(255,98,0,.08)]"
              >
                {tag}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={undefined}>
          <h4 className="mb-3 text-[14px] font-extrabold text-[#FDEEE299]">اعضای فعال</h4>
          <div className="flex flex-col gap-3">
            {activeUsers.map((u) => {
              const isFollowingUser = Boolean(u.isFollowedByMe ?? u.followedByMe);
              const isUserToggling =
                followToggle.isPending && followToggle.variables?.userId === u.id;

              return (
                <div key={u.id} className="flex items-center gap-2.5">
                  <Link
                    href={`/social/users/${u.id}`}
                    className="group focus-visible:ring-ember flex min-w-0 flex-1 items-center gap-2.5 rounded-xl text-start transition-colors hover:bg-white/[.03] focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {u.isAdam ? (
                      <AdamAvatar className="size-9" />
                    ) : (
                      <UserAvatar name={u.name} avatar={u.avatar} className="size-9 text-xs" />
                    )}
                    <span className="min-w-0 flex-1 leading-tight">
                      <b className="group-hover:text-gold block truncate text-[13px] font-bold transition-colors">
                        {u.name}
                      </b>
                      {formatUsername(u.username) && (
                        <small className="text-ink-4 block truncate text-[11px] font-bold">
                          {formatUsername(u.username)}
                        </small>
                      )}
                      <small className="text-ink-3 text-[11px]">{u.role}</small>
                    </span>
                  </Link>
                  {u.canFollow && (
                    <button
                      type="button"
                      disabled={isUserToggling}
                      onClick={() =>
                        followToggle.mutate({
                          userId: u.id,
                          isFollowedByMe: isFollowingUser,
                        })
                      }
                      className={cn(
                        'inline-flex min-h-8 min-w-22 items-center justify-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition-[border-color,background,color,opacity] disabled:opacity-80',
                        isFollowingUser
                          ? 'border-gold/40 text-gold bg-white/5'
                          : 'border-transparent text-[#1a0a00] [background:var(--fire-grad)]',
                      )}
                    >
                      {isUserToggling && <InlineSpinner className="size-3" />}
                      {isFollowingUser ? 'فالو شده' : 'فالو کردن'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Post Detail Modal */}
      <button
        type="button"
        onClick={handleOpenCreatePost}
        aria-label="ایجاد پست جدید"
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 z-40 inline-flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-[rgba(255,130,50,.36)] px-4 text-[#1a0a00] shadow-[0_18px_48px_-18px_var(--glow)] transition-[transform,opacity,box-shadow] duration-250 [background:var(--fire-grad)] hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-18px_var(--glow)] active:scale-95 lg:bottom-8 lg:left-8 lg:min-w-40"
      >
        <Icon name="edit-post" size={22} />
        <span className="hidden text-sm font-black lg:inline">ایجاد پست</span>
      </button>

      {isCompleteProfileOpen && (
        <CompleteForumProfileModal
          isOpen
          profile={currentProfile}
          isPending={updateProfile.isPending}
          onClose={() => setIsCompleteProfileOpen(false)}
          onSubmit={async ({ displayName, username }) => {
            try {
              await updateProfile.mutateAsync({
                displayName,
                username,
              });
              showSuccess('پروفایل محفل کامل شد.');
              setIsCompleteProfileOpen(false);
              setIsCreatePostOpen(true);
            } catch (error) {
              showError(
                error instanceof Error ? error.message : 'پروفایل ذخیره نشد. دوباره تلاش کن.',
              );
            }
          }}
        />
      )}

      <BaseModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        title="ایجاد پست جدید"
        zIndexClassName="z-[1000]"
        panelClassName="w-full max-w-xl"
      >
        <div className="border-hair overflow-hidden rounded-[24px] border bg-[var(--color-panel)] shadow-[0_34px_110px_-48px_var(--glow)]">
          <div className="border-hair flex items-center justify-between border-b px-5 py-4">
            <h3 className="text-base font-black">ایجاد پست جدید</h3>
            <button
              type="button"
              onClick={() => setIsCreatePostOpen(false)}
              aria-label="بستن"
              className="text-ink-3 hover:text-ink grid size-9 place-items-center rounded-full transition-colors hover:bg-white/5"
            >
              <Icon name="plus" size={20} className="rotate-45" />
            </button>
          </div>
          <CreatePost
            onPublish={(text, imageFile?) => onPublish(text, imageFile)}
            onPublished={() => setIsCreatePostOpen(false)}
          />
        </div>
      </BaseModal>
    </div>
  );
}

function hasRequiredForumProfile(profile?: MyProfile | null) {
  return Boolean(profile?.displayName?.trim() && profile?.username?.trim());
}

function CompleteForumProfileModal({
  isOpen,
  profile,
  isPending,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  profile?: MyProfile | null;
  isPending: boolean;
  onClose: () => void;
  onSubmit: (input: { displayName: string; username: string }) => Promise<void>;
}) {
  const isLargeScreen = useIsLargeScreen();
  const [displayName, setDisplayName] = useState(profile?.displayName || profile?.name || '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [errors, setErrors] = useState<{ displayName?: string; username?: string }>({});

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const nextDisplayName = displayName.trim().replace(/\s+/g, ' ');
    const nextUsername = normalizeUsernameInput(username);

    if (nextDisplayName.length < 2) {
      nextErrors.displayName = 'نام نمایشی باید حداقل ۲ کاراکتر باشد.';
    }

    if (nextDisplayName.length > 64) {
      nextErrors.displayName = 'نام نمایشی نباید بیشتر از ۶۴ کاراکتر باشد.';
    }

    if (!isValidUsername(nextUsername)) {
      nextErrors.username = USERNAME_VALIDATION_MESSAGE;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await onSubmit({ displayName: nextDisplayName, username: nextUsername });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="تکمیل اطلاعات پروفایل"
      zIndexClassName="z-[1000]"
      panelClassName="w-full max-w-md"
    >
      <form
        onSubmit={submit}
        className="border-hair overflow-hidden rounded-[24px] border bg-[var(--color-panel)] shadow-[0_34px_110px_-48px_var(--glow)]"
      >
        <div className="border-hair flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="text-base font-black">تکمیل اطلاعات پروفایل</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="text-ink-3 hover:text-ink grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/5"
          >
            <Icon name="plus" size={20} className="rotate-45" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-ink-3 rounded-[16px] border border-[var(--color-hair)] bg-black/20 p-3 text-xs leading-6">
            برای اینکه دیگران تو را درست بشناسند، نام نمایشی و نام کاربری‌ات را کامل کن.
          </p>
          <ProfileCompletionField
            label="نام نمایشی"
            icon="user"
            value={displayName}
            error={errors.displayName}
            placeholder="مثلاً آرش کریمی"
            autoFocus={isLargeScreen}
            onChange={(value) => {
              setDisplayName(value);
              setErrors((current) => ({ ...current, displayName: undefined }));
            }}
          />
          <ProfileCompletionField
            label="نام کاربری"
            icon="search"
            value={username}
            error={errors.username}
            placeholder="sample_user"
            ltr
            onChange={(value) => {
              setUsername(value);
              setErrors((current) => ({ ...current, username: undefined }));
            }}
          />

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="sm:flex-1"
            >
              بعداً
            </Button>
            <Button type="submit" variant="primary" disabled={isPending} className="sm:flex-1">
              {isPending && <InlineSpinner className="size-4" />}
              ذخیره و ایجاد پست
            </Button>
          </div>
        </div>
      </form>
    </BaseModal>
  );
}

function ProfileCompletionField({
  label,
  icon,
  value,
  error,
  placeholder,
  autoFocus,
  ltr,
  onChange,
}: {
  label: string;
  icon: IconName;
  value: string;
  error?: string;
  placeholder: string;
  autoFocus?: boolean;
  ltr?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-ink-2 mb-2 block text-sm font-black">{label}</span>
      <div className="relative">
        <Icon
          name={icon}
          size={18}
          className="text-ember pointer-events-none absolute inset-y-0 start-3.5 my-auto"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          invalid={Boolean(error)}
          autoFocus={autoFocus}
          dir={ltr ? 'ltr' : 'rtl'}
          className={cn('ps-11', ltr && 'text-left')}
        />
      </div>
      {error && <p className="text-danger mt-2 text-xs font-bold">{error}</p>}
    </label>
  );
}

// ---- PostCard (unchanged, but ensure onAuthorClick is passed) ----
function PostCard({
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
  const { like, unlike } = useLikePost(socialRepo, onReward);
  const deleteOwnPost = useDeleteOwnPost(socialRepo);
  const pinOwnPost = usePinOwnPost(socialRepo);
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
    if (!adminRepo) return;
    adminRepo.pinPost(post.id, !post.isPinned).then(() => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    });
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

  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';
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
            {/* {post.location && <div className="mt-3 text-sm text-orange-300">📍 {post.location}</div>}
        </div> */}
            <div className="ms-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {isAdmin && (
                <>
                  <button onClick={handlePinToggle} className="text-gold hover:text-ember">
                    <Icon name={post.isPinned ? 'star' : 'star-line'} size={18} />
                  </button>
                  <button onClick={handleDeleteClick} className="text-danger hover:text-red-400">
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
            <div className="text-ink-4 relative mt-3 grid h-44 place-items-center overflow-hidden rounded-[14px] [background:var(--glass-2)]">
              {post.attachment?.url || post.image ? (
                <OptionalImage
                  src={post.attachment?.url ?? post.image ?? ''}
                  alt="Post attachment"
                  className="object-cover"
                />
              ) : (
                <Icon name="book" size={34} />
              )}
            </div>
          )}
          {/* ... post text, achievement, image ... unchanged */}

          {/* Like, comment, share */}
          <div className="text-ink-3 mt-4 flex flex-col gap-3 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <div className="flex flex-wrap gap-x-8 gap-y-3 sm:gap-10">
              <button
                type="button"
                onClick={handleLike}
                className={cn(
                  'flex items-center gap-1.5 transition-colors',
                  post.likedByMe && 'text-[#ff5a5a]',
                )}
              >
                <Icon name="heart" size={18} className={post.likedByMe ? 'fill-current' : ''} />
                {toPersianDigits(post.likes)}
              </button>
              <button
                type="button"
                onClick={handleCommentClick}
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
