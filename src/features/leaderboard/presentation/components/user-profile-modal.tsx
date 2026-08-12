// src/features/dashboard/presentation/components/user-profile-modal.tsx
'use client';

import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { toPersianDigits } from '@/core/lib/persian';
import {
  BaseModal,
  GlassCard,
  Button,
  Icon,
  IconName,
  InlineSpinner,
  OptionalImage,
  UserAvatar,
} from '@/shared/ui';
import type { UserProfileData, UserProfilePost } from '../../domain/user-profile-repository';
import { formatUsername } from '@/features/social/presentation/lib/format-username';
import { cn } from '@/core/lib/cn';
import { useAuthSession } from '@/providers/auth-provider';
import { shareUrl } from '@/shared/lib/native-share';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfileData;
  isFollowed?: boolean;
  onToggleFollow?: () => void;
  isToggling?: boolean;
  onToggleBlock?: () => void;
  isBlocking?: boolean;
  postsQuery: UseInfiniteQueryResult<InfiniteData<UserProfilePost[]>>;
  onPostClick: (postId: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  user,
  isFollowed,
  isToggling,
  onToggleFollow,
  onToggleBlock,
  isBlocking,
  postsQuery,
  onPostClick,
}: Props) {
  const { user: currentUser } = useAuthSession();
  const posts = sortPinnedFirst(postsQuery.data?.pages.flat() ?? []);
  const isOwnProfile = Boolean(currentUser?.id && user.id === currentUser.id);
  const followed = Boolean(isFollowed ?? user.followedByMe);
  const blocked = Boolean(user.blockedByMe);
  const canFollow = Boolean(user.canFollow) && !blocked && !isOwnProfile;
  const canBlock = !user.isAdam && !isOwnProfile;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={user.name}
      className="bg-black/60"
      panelClassName="w-full max-w-2xl"
    >
      <GlassCard className="border-hair relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-y-auto overscroll-contain [background:var(--color-panel)]">
        {/* Header */}
        <div className="border-hair flex items-center justify-between border-b p-6">
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-(--glass-2)"
          >
            <div className="absolute top-7 right-5 flex items-center gap-2">
              <Icon name="arrow-right" size={24} className="text-ink-2" />
              بازگشت
            </div>
          </button>
          <span className="text-lg font-bold">{user.name}</span>
          <div className="w-8" />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-start px-6 pt-6">
          <div className="flex w-full items-baseline justify-start gap-4">
            <UserAvatar name={user.name} avatar={user.avatar} className="size-20 text-2xl" />
            <div className="text-right">
              <h2 className="text-ink text-2xl font-bold">{user.name}</h2>
              {formatUsername(user.username) && (
                <p className="text-ink-3 mt-1 text-sm font-bold">{formatUsername(user.username)}</p>
              )}
              <p className="text-gold mt-1 text-sm">
                {user.title} ، سطح {toPersianDigits(user.level)}
              </p>
              {user.bio?.trim() && (
                <p className="text-ink-3 mt-3 max-w-md text-sm leading-7">{user.bio.trim()}</p>
              )}
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 py-4 pl-6 text-start">
                <div>
                  <div className="text-ink text-lg font-bold">
                    {toPersianDigits(user.stats.peersFollowing)}
                  </div>
                  <div className="text-ink-3 mt-1 text-xs">فالور</div>
                </div>{' '}
                <div>
                  <div className="text-ink text-lg font-bold">
                    {toPersianDigits(user.stats.peersFollowed)}
                  </div>
                  <div className="text-ink-3 mt-1 text-xs">فالویینگ</div>
                </div>
                <div>
                  <div className="text-ink text-lg font-bold">
                    {toPersianDigits(user.stats.streak)}
                  </div>
                  <div className="text-ink-3 mt-1 text-xs">روز زنجیره</div>
                </div>
                <div>
                  <div className="text-ink text-lg font-bold">{toPersianDigits(user.stats.xp)}</div>
                  <div className="text-ink-3 mt-1 text-xs">آتش</div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex justify-start gap-4 pb-2">
                <Button
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
                <Button
                  variant={followed ? 'ghost' : 'primary'}
                  size="sm"
                  disabled={isToggling || !canFollow}
                  onClick={onToggleFollow}
                  className={cn('gap-1.5', followed && 'border-gold text-gold border')}
                >
                  {isToggling && <InlineSpinner className="size-3.5" />}
                  {followed ? 'فالو شده' : 'فالو کردن'}
                </Button>
                {/* <Button
                  variant={isFollowed ? 'ghost' : 'primary'}
                  size="sm"
                  disabled={isToggling}
                  onClick={onToggleFollow}
                  className={isFollowed ? 'border-gold text-gold border' : ''}
                >
                  {isToggling ? '...' : isFollowed ? 'لغو دنبال کردن' : 'دنبال کردن'}
                </Button> */}
                {canBlock && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isBlocking}
                    onClick={onToggleBlock}
                    className={cn(
                      'border-danger text-danger gap-1.5 border',
                      blocked && 'border-gold text-gold',
                    )}
                  >
                    {isBlocking && <InlineSpinner className="size-3.5" />}
                    {blocked ? 'رفع بلاک' : 'بلاک'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {user.achievements?.map((a) => (
          <div key={a.label} className="flex flex-col items-center gap-2 text-center">
            <span
              className={cn(
                'grid size-15 place-items-center rounded-[18px]',
                a.unlocked
                  ? 'text-gold [background:linear-gradient(135deg,rgba(243,186,99,.2),rgba(204,67,8,.12))]'
                  : 'text-ink-4 [background:var(--glass-2)]',
              )}
            >
              <Icon name={a.icon as IconName} size={26} />
            </span>
            <span className={cn('text-[11px]', a.unlocked ? 'text-ink-2' : 'text-ink-4')}>
              {a.label}
            </span>
          </div>
        ))}

        {/* User Posts */}
        <div className="my-2 px-6 pb-6">
          <div className="border-hair mb-4 flex items-center justify-between border-b pb-2">
            <h3 className="text-ink-2 text-sm font-black">پست‌ها</h3>
            {postsQuery.isFetching && !postsQuery.isFetchingNextPage && (
              <span className="text-ink-4 text-xs">در حال بروزرسانی...</span>
            )}
          </div>
          <div className="max-h-72 space-y-4 overflow-y-auto overscroll-contain pr-2">
            {postsQuery.isLoading && (
              <>
                <PostPreviewSkeleton />
                <PostPreviewSkeleton />
              </>
            )}
            {!postsQuery.isLoading && posts.length === 0 && (
              <p className="text-ink-3 rounded-lg border border-[var(--color-hair)] bg-(--glass) p-4 text-center text-sm">
                هنوز پستی ثبت نشده است.
              </p>
            )}
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => onPostClick(post.id)}
                className={cn(
                  'block w-full rounded-lg border bg-(--glass) p-4 text-right transition-colors',
                  post.isPinned
                    ? 'border-gold/45 hover:border-gold/60'
                    : 'border-hair hover:border-[var(--color-hair-2)]',
                )}
              >
                {post.isPinned && (
                  <span className="text-gold border-gold/25 bg-gold/10 mb-3 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black">
                    <Icon name="star" size={11} />
                    سنجاق شده
                  </span>
                )}
                <p className="text-ink-2 text-right text-sm leading-relaxed">{post.text}</p>
                {(post.attachment?.url || post.image || post.hasImage) && (
                  <div className="border-hair mt-3 overflow-hidden rounded-lg border bg-black/20">
                    {post.attachment?.url || post.image ? (
                      <OptionalImage
                        src={post.attachment?.url ?? post.image ?? ''}
                        alt="تصویر پیوست پست"
                        fill={false}
                        className="max-h-[360px] w-full object-cover"
                      />
                    ) : (
                      <div className="text-ink-4 grid h-28 place-items-center">
                        <Icon name="book" size={26} />
                      </div>
                    )}
                  </div>
                )}
                <div className="text-ink-4 mt-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Icon name="heart" size={16} /> {toPersianDigits(post.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="msg" size={16} />{' '}
                    {toPersianDigits(post.commentsCount ?? post.comments.length)}
                  </span>
                </div>
              </button>
            ))}
            {postsQuery.hasNextPage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={postsQuery.isFetchingNextPage}
                onClick={() => postsQuery.fetchNextPage()}
              >
                {postsQuery.isFetchingNextPage ? '...' : 'نمایش بیشتر'}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </BaseModal>
  );
}

function sortPinnedFirst<T extends { isPinned?: boolean }>(posts: T[]) {
  return [...posts].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));
}

function PostPreviewSkeleton() {
  return (
    <div className="border-hair rounded-lg border bg-(--glass) p-4">
      <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/10" />
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
      <div className="mt-4 flex gap-3">
        <div className="h-3 w-10 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-10 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  );
}
