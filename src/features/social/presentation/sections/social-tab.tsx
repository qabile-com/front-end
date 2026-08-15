'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import {
  BaseModal,
  Button,
  ErrorState,
  Icon,
  Input,
  InlineSpinner,
  SocialSkeleton,
  UserAvatar,
  type IconName,
} from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { useIsLargeScreen } from '@/core/lib/use-is-large-screen';
import type { Post, ActiveUser } from '../../domain/social.data';
import type { IProfileRepository, MyProfile } from '@/features/profile/domain/profile-repository';
import { useUpdateMyProfile } from '@/features/profile/application/use-edit-profile';
import {
  isValidUsername,
  normalizeUsernameInput,
  USERNAME_MAX_LENGTH,
  USERNAME_VALIDATION_MESSAGE,
} from '@/features/profile/domain/username-validation';
import { Panel } from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import { CreatePost } from './create-post';
import { adminRepo, socialRepo } from '@/features/social/infrastructure/repository-factory';
import { type UseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import { IAdminRepository } from '../../domain/admin-repository';
import { formatUsername } from '../lib/format-username';
import { useToggleUserFollow } from '../../application/use-toggle-user-follow';
import {
  formatPostingRemainingTime,
  getPostingRemainingSeconds,
  isPostingLocked,
  usePostingStatus,
} from '../../application/use-posting-status';
import { shareUrl } from '@/shared/lib/native-share';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';
import { PostCard } from '../components/post-card';

type Feed = 'for-you' | 'following' | 'mine';

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
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const [listOffset, setListOffset] = useState(0);
  const postingStatusQuery = usePostingStatus(socialRepo);
  const postingStatus = postingStatusQuery.data;
  const refetchPostingStatus = postingStatusQuery.refetch;
  const [now, setNow] = useState(() => Date.now());
  const postingRemainingSeconds = getPostingRemainingSeconds(postingStatus, now);
  const isPostCreationLocked = isPostingLocked(postingStatus, postingRemainingSeconds);

  useEffect(() => {
    if (!isPostCreationLocked) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isPostCreationLocked]);

  useEffect(() => {
    if (!postingStatus?.isLocked || postingRemainingSeconds > 0) return;
    void refetchPostingStatus();
  }, [postingStatus?.isLocked, postingRemainingSeconds, refetchPostingStatus]);

  const allPosts = useMemo(() => feedQuery.data?.pages.flat() ?? [], [feedQuery.data]);
  const hasNextPage = Boolean(feedQuery.hasNextPage);
  const isFetchingNextPage = feedQuery.isFetchingNextPage;
  const fetchNextPage = feedQuery.fetchNextPage;

  useLayoutEffect(() => {
    setListOffset(listContainerRef.current?.offsetTop ?? 0);
  }, [feed]);

  const rowVirtualizer = useWindowVirtualizer({
    count: allPosts.length,
    estimateSize: () => 380,
    overscan: 6,
    gap: 16,
    scrollMargin: listOffset,
  });

  const virtualPostItems = rowVirtualizer.getVirtualItems();
  const lastVirtualPostItem = virtualPostItems[virtualPostItems.length - 1];

  useEffect(() => {
    if (!lastVirtualPostItem || !hasNextPage || isFetchingNextPage) return;
    if (lastVirtualPostItem.index < allPosts.length - 1) return;

    void fetchNextPage();
  }, [lastVirtualPostItem, hasNextPage, isFetchingNextPage, fetchNextPage, allPosts.length]);

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
        <div className="border-hair grid grid-cols-3 gap-1 rounded-xl border p-1 [background:var(--glass-2)]">
          {(
            [
              ['for-you', 'برای شما'],
              ['following', 'دنبال‌شده‌ها'],
              ['mine', 'پست‌های من'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onFeedChange(id)}
              className={cn(
                'truncate rounded-lg px-1 py-2.5 text-[11.5px] font-bold transition-colors sm:text-[13.5px]',
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
            {feed === 'mine' ? 'هنوز پستی منتشر نکردی.' : 'نتیجه‌ای پیدا نشد'}
          </div>
        )}
        {allPosts.length > 0 && (
          <div
            ref={listContainerRef}
            className="relative w-full"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {virtualPostItems.map((virtualItem) => {
              const post = allPosts[virtualItem.index];
              if (!post) return null;
              const isNew = newPostIds?.has(post.id);

              return (
                <div
                  key={post.id}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute inset-x-0 top-0"
                  style={{
                    transform: `translateY(${virtualItem.start - rowVirtualizer.options.scrollMargin}px)`,
                  }}
                >
                  <motion.div
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
                </div>
              );
            })}
          </div>
        )}

        {feedQuery.isSuccess && allPosts.length > 0 && (
          <div aria-live="polite" className="flex min-h-16 items-center justify-center py-3">
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
        aria-label={
          isPostCreationLocked
            ? `تا انتشار پست بعدی ${formatPostingRemainingTime(postingRemainingSeconds)} باقی مانده`
            : 'ایجاد پست جدید'
        }
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-4 z-40 inline-flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-[rgba(255,130,50,.36)] px-4 text-[#1a0a00] shadow-[0_18px_48px_-18px_var(--glow)] transition-[transform,opacity,box-shadow] duration-250 [background:var(--fire-grad)] hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-18px_var(--glow)] active:scale-95 lg:bottom-8 lg:left-8 lg:min-w-40"
      >
        <Icon name={isPostCreationLocked ? 'clock' : 'edit-post'} size={22} />
        <span className={cn('text-sm font-black', isPostCreationLocked ? 'inline' : 'hidden lg:inline')}>
          {isPostCreationLocked
            ? formatPostingRemainingTime(postingRemainingSeconds)
            : 'ایجاد پست'}
        </span>
      </button>

      {isCompleteProfileOpen && (
        <CompleteForumProfileModal
          isOpen
          profile={currentProfile}
          isPending={updateProfile.isPending}
          onClose={() => setIsCompleteProfileOpen(false)}
          onSubmit={async ({ firstName, lastName, displayName, username }) => {
            try {
              await updateProfile.mutateAsync({
                firstName,
                lastName,
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
  return Boolean(profile?.firstName?.trim() && profile?.username?.trim());
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
  onSubmit: (input: {
    firstName: string;
    lastName: string;
    displayName: string;
    username: string;
  }) => Promise<void>;
}) {
  const isLargeScreen = useIsLargeScreen();
  const [firstName, setFirstName] = useState(profile?.firstName || profile?.name || '');
  const [lastName, setLastName] = useState(profile?.lastName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; username?: string }>(
    {},
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const nextFirstName = firstName.trim().replace(/\s+/g, ' ');
    const nextLastName = lastName.trim().replace(/\s+/g, ' ');
    const nextUsername = normalizeUsernameInput(username);

    if (nextFirstName.length < 2) {
      nextErrors.firstName = 'نام باید حداقل ۲ کاراکتر باشد.';
    }

    if (nextFirstName.length > 64) {
      nextErrors.firstName = 'نام نباید بیشتر از ۶۴ کاراکتر باشد.';
    }

    if (nextLastName.length > 64) {
      nextErrors.lastName = 'نام خانوادگی نباید بیشتر از ۶۴ کاراکتر باشد.';
    }

    if (!isValidUsername(nextUsername)) {
      nextErrors.username = USERNAME_VALIDATION_MESSAGE;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    await onSubmit({
      firstName: nextFirstName,
      lastName: nextLastName,
      displayName: [nextFirstName, nextLastName].filter(Boolean).join(' '),
      username: nextUsername,
    });
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
            برای اینکه دیگران تو را درست بشناسند، اطلاعات پروفایلت را کامل کن.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProfileCompletionField
              label="نام"
              icon="user"
              value={firstName}
              error={errors.firstName}
              placeholder="مثلاً آرش"
              autoFocus={isLargeScreen}
              onChange={(value) => {
                setFirstName(value);
                setErrors((current) => ({ ...current, firstName: undefined }));
              }}
            />
            <ProfileCompletionField
              label="نام خانوادگی"
              icon="user"
              value={lastName}
              error={errors.lastName}
              placeholder="مثلاً کریمی"
              onChange={(value) => {
                setLastName(value);
                setErrors((current) => ({ ...current, lastName: undefined }));
              }}
            />
          </div>
          <ProfileCompletionField
            label="نام کاربری"
            icon="search"
            value={username}
            error={errors.username}
            placeholder="sample_user"
            ltr
            maxLength={USERNAME_MAX_LENGTH}
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
  maxLength,
  onChange,
}: {
  label: string;
  icon: IconName;
  value: string;
  error?: string;
  placeholder: string;
  autoFocus?: boolean;
  ltr?: boolean;
  maxLength?: number;
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
          maxLength={maxLength}
          className={cn('ps-11', ltr && 'text-left')}
        />
      </div>
      {error && <p className="text-danger mt-2 text-xs font-bold">{error}</p>}
    </label>
  );
}

