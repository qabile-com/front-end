'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useFollowToggle } from '../../application/use-follow-toggle';
import { useBlockToggle } from '../../application/use-block-toggle';
import { useUserPosts } from '../../application/use-user-posts';
import { useUserProfile } from '../../application/use-user-profile';
import { followRepo, userProfileRepo } from '../../infrastructure/repository-factory';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { toPersianDigits } from '@/core/lib/persian';
import {
  Button,
  DashboardPageShell,
  ErrorState,
  Icon,
  InlineSpinner,
  MotionPage,
  OptionalImage,
  Skeleton,
  UserAvatar,
} from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { getApiErrorView } from '@/core/api/api-error-view';
import { createAuthRedirectHref } from '@/core/auth/redirect';
import { useAuthSession } from '@/providers/auth-provider';
import { useActionRewardQueue } from '@/features/dashboard/application/use-action-reward-queue';
import { ActionRewardModals } from '@/features/dashboard/presentation/components/action-reward-modals';
import { LoginRequiredModal } from '@/features/social/presentation/components/login-required-modal';
import { formatUsername } from '@/features/social/presentation/lib/format-username';
import { useDeleteOwnPost } from '@/features/social/application/use-delete-own-post';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import { showError, showSuccess } from '@/shared/lib/toast';
import { DeletePostConfirmModal } from '@/features/social/presentation/components/delete-post-confirm-modal';
import { shareUrl } from '@/shared/lib/native-share';

export function ForumUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, isLoggedIn } = useAuthSession();
  const userId = params.userId;
  const currentPath = `/social/users/${userId}`;
  const from = searchParams.get('from');
  const fromPostId = searchParams.get('postId');
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const profile = useUserProfile(userProfileRepo, userId);
  const postsQuery = useUserPosts(userProfileRepo, userId);
  const { currentReward, enqueueReward, dismissCurrentReward } = useActionRewardQueue();
  const follow = useFollowToggle(followRepo, userId, enqueueReward);
  const block = useBlockToggle(userProfileRepo, userId);
  const deleteOwnPost = useDeleteOwnPost(socialRepo);
  const requireLogin = () => {
    if (isLoggedIn) return true;
    setLoginPromptOpen(true);
    return false;
  };

  if (profile.loading) {
    return (
      <DashboardPageShell size="narrow">
        <ProfilePageSkeleton />
      </DashboardPageShell>
    );
  }

  if (profile.rawError || !profile.data) {
    const errorView = getApiErrorView(profile.rawError, {
      title: 'پروفایل آماده نشد',
      message: 'اطلاعات این کاربر دریافت نشد.',
    });

    return (
      <DashboardPageShell size="narrow">
        <ErrorState
          title={errorView.statusCode === 404 ? 'کاربر پیدا نشد' : errorView.title}
          message={errorView.message}
          icon={errorView.icon}
          tone={errorView.tone}
          action={
            errorView.statusCode === 401
              ? { label: 'ورود', href: createAuthRedirectHref(currentPath), icon: 'lock' }
              : { label: 'تلاش دوباره', onClick: () => void profile.refetch(), icon: 'bolt' }
          }
          secondaryAction={{ label: 'بازگشت به محفل', href: '/social', icon: 'arrow-right' }}
        />
      </DashboardPageShell>
    );
  }

  const user = profile.data;
  const isOwnProfile = Boolean(currentUser?.id && user.id === currentUser.id);
  const followed = follow.isLoading ? Boolean(user.followedByMe) : follow.isFollowed;
  const blocked = Boolean(user.blockedByMe);
  const canFollow = (Boolean(user.canFollow) || !isLoggedIn) && !blocked && !isOwnProfile;
  const canBlock = !user.isAdam && !isOwnProfile;
  const userPosts = sortPinnedFirst(postsQuery.data?.pages.flat() ?? []);
  const backTarget =
    from === 'post' && fromPostId ? `/social/${encodeURIComponent(fromPostId)}` : '/social';
  const backLabel = from === 'post' && fromPostId ? 'بازگشت به پست' : 'بازگشت به محفل';

  const handleDeletePost = async () => {
    if (!requireLogin()) return;
    if (!postToDelete) return;

    try {
      await deleteOwnPost.mutateAsync(postToDelete);
      setPostToDelete(null);
      showSuccess('پست حذف شد.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'حذف پست انجام نشد.');
    }
  };

  return (
    <MotionPage>
      <DashboardPageShell size="narrow" className="pb-24">
        <div className="sticky top-[env(safe-area-inset-top)] z-30 mb-4 flex">
          <button
            type="button"
            onClick={() => {
              if (!requireLogin()) return;
              router.push(backTarget);
            }}
            className="text-ink-3 hover:text-gold inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-hair)] bg-[var(--color-panel)] px-3 text-sm font-black shadow-[0_10px_30px_-18px_var(--glow)] backdrop-blur-xl transition-colors"
          >
            <Icon name="arrow-right" size={17} />
            {backLabel}
          </button>
        </div>

        <section className="border-hair overflow-hidden rounded-[28px] border bg-[var(--color-panel)] shadow-[0_30px_90px_-54px_var(--glow)]">
          <div className="border-hair flex flex-col gap-5 border-b p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <UserAvatar name={user.name} avatar={user.avatar} className="size-24 text-3xl" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-ink text-2xl font-black">{user.name}</h1>
                  {user.verified && (
                    <span className="text-gold rounded-full border border-[rgba(243,186,99,.24)] px-2 py-1 text-[11px] font-black">
                      تایید شده
                    </span>
                  )}
                  {blocked && (
                    <span className="text-danger border-danger/30 rounded-full border px-2 py-1 text-[11px] font-black">
                      بلاک شده
                    </span>
                  )}
                </div>
                {formatUsername(user.username) && (
                  <p className="text-ink-3 mt-1 text-sm font-bold">
                    {formatUsername(user.username)}
                  </p>
                )}
                <p className="text-gold mt-1 text-sm font-bold">{user.title || user.role}</p>
                {user.bio?.trim() && (
                  <p className="text-ink-3 mt-3 max-w-xl text-sm leading-7">{user.bio.trim()}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    void shareUrl({
                      title: user.name,
                      text: `پروفایل ${user.name} در قبیله`,
                      path: `/social/users/${user.id}`,
                    })
                  }
                  className="gap-1.5"
                >
                  <Icon name="share" size={15} />
                  اشتراک پروفایل
                </Button>
                {canFollow && (
                  <Button
                    type="button"
                    variant={followed ? 'ghost' : 'primary'}
                    size="sm"
                    disabled={follow.isToggling}
                    onClick={() => {
                      if (!requireLogin()) return;
                      follow.toggle();
                    }}
                    className={cn(
                      'min-w-31 gap-1.5 transition-[border-color,background,color,opacity]',
                      followed && 'border-gold/50 text-gold border bg-white/5',
                    )}
                  >
                    {follow.isToggling && <InlineSpinner className="size-3.5" />}
                    {followed ? 'فالو شده' : 'فالو کردن'}
                  </Button>
                )}
                {canBlock && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={block.isPending}
                    onClick={() => {
                      if (!requireLogin()) return;
                      block.mutate(blocked);
                    }}
                    className={cn(
                      'border-danger text-danger gap-1.5 border',
                      blocked && 'border-gold text-gold',
                    )}
                  >
                    {block.isPending && <InlineSpinner className="size-3.5" />}
                    {blocked ? 'رفع بلاک' : 'بلاک'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ProfileStat label="پست" value={user.stats.streak} />
              <ProfileStat label="آتش" value={user.stats.xp} />
              <ProfileStat label="فالورها" value={user.stats.peersFollowed} />
              <ProfileStat label="فالویینگ‌ها" value={user.stats.peersFollowing} />
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <h2 className="mb-4 text-sm font-black text-[#FDEEE299]">پست‌ها</h2>
            <div className="space-y-3">
              {postsQuery.isLoading && (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              )}
              {!postsQuery.isLoading && userPosts.length === 0 && (
                <p className="text-ink-3 rounded-2xl border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
                  هنوز پستی ثبت نشده است.
                </p>
              )}
              {userPosts.map((post) => (
                <article
                  key={post.id}
                  className={cn(
                    'relative rounded-2xl border bg-black/20 p-4 transition-colors',
                    post.isPinned
                      ? 'border-gold/45 hover:border-gold/60'
                      : 'border-hair hover:border-[var(--color-hair-2)]',
                  )}
                >
                  {post.isPinned && (
                    <span className="text-gold border-gold/25 bg-gold/10 absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black">
                      <Icon name="star" size={11} />
                      سنجاق شده
                    </span>
                  )}
                  {isOwnProfile && (
                    <button
                      type="button"
                      disabled={deleteOwnPost.isPending}
                      onClick={() => setPostToDelete(post.id)}
                      className="text-danger absolute top-3 left-3 z-10 rounded-lg p-1 hover:text-red-400 disabled:opacity-60"
                      aria-label="حذف پست"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/social/${post.id}?from=user-profile&userId=${encodeURIComponent(user.id)}`,
                      )
                    }
                    className={cn(
                      'block w-full text-start',
                      isOwnProfile && 'ps-8',
                      post.isPinned && 'pt-8',
                    )}
                  >
                    <p className="text-ink-2 line-clamp-3 text-sm leading-7">{post.text}</p>
                    {(post.image || post.hasImage) && (
                      <div className="border-hair mt-3 overflow-hidden rounded-xl border bg-[var(--glass-2)]">
                        {post.image ? (
                          <OptionalImage
                            src={post.image}
                            alt="تصویر پیوست پست"
                            fill={false}
                            className="max-h-[360px] w-full object-contain"
                          />
                        ) : (
                          <div className="text-ink-4 grid h-40 place-items-center">
                            <Icon name="book" size={28} />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-ink-4 mt-3 flex items-center justify-between gap-3 text-xs">
                      <span className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="heart" size={15} />
                          {toPersianDigits(post.likes)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="msg" size={15} />
                          {toPersianDigits(post.commentsCount ?? post.comments.length)}
                        </span>
                      </span>
                      <time>{formatRelativeTime(post.time)}</time>
                    </div>
                  </button>
                </article>
              ))}
              {postsQuery.hasNextPage && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  disabled={postsQuery.isFetchingNextPage}
                  onClick={() => void postsQuery.fetchNextPage()}
                >
                  {postsQuery.isFetchingNextPage ? '...' : 'نمایش بیشتر'}
                </Button>
              )}
            </div>
          </div>
        </section>
        <LoginRequiredModal
          isOpen={loginPromptOpen}
          currentPath={currentPath}
          onClose={() => setLoginPromptOpen(false)}
        />
        <DeletePostConfirmModal
          isOpen={Boolean(postToDelete)}
          isDeleting={deleteOwnPost.isPending}
          onClose={() => setPostToDelete(null)}
          onConfirm={() => void handleDeletePost()}
        />
        <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
      </DashboardPageShell>
    </MotionPage>
  );
}

function sortPinnedFirst<T extends { isPinned?: boolean }>(posts: T[]) {
  return [...posts].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--color-hair)] bg-black/20 p-3 text-center">
      <b className="text-gold block text-lg font-black">{toPersianDigits(value)}</b>
      <span className="text-ink-3 mt-1 block text-xs font-bold">{label}</span>
    </div>
  );
}

function ProfilePageSkeleton() {
  return (
    <div className="rounded-[28px] border border-[var(--color-hair)] bg-[var(--color-panel)] p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-24 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-hair)] bg-black/20 p-4">
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="mt-3 h-4 w-2/3" />
    </div>
  );
}
