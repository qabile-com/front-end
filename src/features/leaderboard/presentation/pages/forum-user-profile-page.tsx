'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFollowToggle } from '../../application/use-follow-toggle';
import { useBlockToggle } from '../../application/use-block-toggle';
import { useUserPosts } from '../../application/use-user-posts';
import { useUserProfile } from '../../application/use-user-profile';
import { followRepo, userProfileRepo } from '../../infrastructure/repository-factory';
import { getAvatarInitial } from '@/core/lib/avatar';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { toPersianDigits } from '@/core/lib/persian';
import {
  Button,
  DashboardPageShell,
  ErrorState,
  Icon,
  InlineSpinner,
  MotionPage,
  Skeleton,
} from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { getApiErrorView } from '@/core/api/api-error-view';
import { createAuthRedirectHref } from '@/core/auth/redirect';
import { useAuthSession } from '@/providers/auth-provider';

export function ForumUserProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuthSession();
  const userId = params.userId;
  const currentPath = `/social/users/${userId}`;
  const profile = useUserProfile(userProfileRepo, userId);
  const postsQuery = useUserPosts(userProfileRepo, userId);
  const follow = useFollowToggle(followRepo, userId);
  const block = useBlockToggle(userProfileRepo, userId);

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
          secondaryAction={{ label: 'بازگشت به انجمن', href: '/social', icon: 'arrow-right' }}
        />
      </DashboardPageShell>
    );
  }

  const user = profile.data;
  const isOwnProfile = Boolean(currentUser?.id && user.id === currentUser.id);
  const followed = follow.isLoading ? Boolean(user.followedByMe) : follow.isFollowed;
  const blocked = Boolean(user.blockedByMe);
  const canFollow = Boolean(user.canFollow) && !blocked && !isOwnProfile;
  const canBlock = !user.isAdam && !isOwnProfile;

  return (
    <MotionPage>
      <DashboardPageShell size="narrow" className="pb-24">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-ink-3 hover:text-gold mb-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-hair)] bg-black/20 px-3 text-sm font-black transition-colors"
        >
          <Icon name="arrow-right" size={17} />
          بازگشت
        </button>

        <section className="border-hair overflow-hidden rounded-[28px] border bg-[var(--color-panel)] shadow-[0_30px_90px_-54px_var(--glow)]">
          <div className="border-hair flex flex-col gap-5 border-b p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className="grid size-24 shrink-0 place-items-center rounded-full text-3xl font-black text-white"
                style={{ background: user.avatar }}
              >
                {getAvatarInitial(user.name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-ink text-2xl font-black">{user.name}</h1>
                  {user.verified && (
                    <span className="text-gold rounded-full border border-[rgba(243,186,99,.24)] px-2 py-1 text-[11px] font-black">
                      تایید شده
                    </span>
                  )}
                  {blocked && (
                    <span className="text-danger rounded-full border border-danger/30 px-2 py-1 text-[11px] font-black">
                      بلاک شده
                    </span>
                  )}
                </div>
                <p className="text-gold mt-1 text-sm font-bold">{user.title || user.role}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {canFollow && (
                  <Button
                    type="button"
                    variant={followed ? 'ghost' : 'primary'}
                    size="sm"
                    disabled={follow.isToggling}
                    onClick={() => follow.toggle()}
                    className={cn(
                      'min-w-31 gap-1.5 transition-[border-color,background,color,opacity]',
                      followed && 'border-gold/50 bg-white/5 text-gold border',
                    )}
                  >
                    {follow.isToggling && <InlineSpinner className="size-3.5" />}
                    {followed ? 'هم‌پرواز هستید' : 'هم پرواز شدن'}
                  </Button>
                )}
                {canBlock && (
                  <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={block.isPending}
                  onClick={() => block.mutate(blocked)}
                  className={cn('gap-1.5 border border-danger text-danger', blocked && 'border-gold text-gold')}
                >
                  {block.isPending && <InlineSpinner className="size-3.5" />}
                  {blocked ? 'رفع بلاک' : 'بلاک'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ProfileStat label="پست" value={user.stats.streak} />
              <ProfileStat label="لایک" value={user.stats.xp} />
              <ProfileStat label="هم‌پروازان" value={user.stats.peersFollowed} />
              <ProfileStat label="هم‌پرواز شده" value={user.stats.peersFollowing} />
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
              {!postsQuery.isLoading && postsQuery.data?.pages.flat().length === 0 && (
                <p className="text-ink-3 rounded-2xl border border-[var(--color-hair)] bg-black/20 p-5 text-center text-sm">
                  هنوز پستی ثبت نشده است.
                </p>
              )}
              {postsQuery.data?.pages.flat().map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => router.push(`/social/${post.id}`)}
                  className="border-hair block w-full rounded-2xl border bg-black/20 p-4 text-start transition-colors hover:border-[var(--color-hair-2)]"
                >
                  <p className="text-ink-2 line-clamp-3 text-sm leading-7">{post.text}</p>
                  <div className="text-ink-4 mt-3 flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="heart" size={15} />
                        {toPersianDigits(post.likes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="msg" size={15} />
                        {toPersianDigits(post.comments.length)}
                      </span>
                    </span>
                    <time>{formatRelativeTime(post.time)}</time>
                  </div>
                </button>
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
      </DashboardPageShell>
    </MotionPage>
  );
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
