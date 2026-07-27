'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseModal, ErrorState, Icon, InlineSkeleton, SocialSkeleton, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { getAvatarInitial } from '@/core/lib/avatar';
import { toPersianDigits } from '@/core/lib/persian';
import type { Post, ActiveUser } from '../../domain/social.data';
import { Panel } from '@/shared/ui';
import { AdamAvatar } from '@/features/dashboard/presentation/sections/dashboard-sidebar';
import { CreatePost } from './create-post';
import { SharePostModal } from '../components/share-post-modal';
import { UserProfileModalContainer } from '@/features/leaderboard/presentation/components/user-profile-modal-container';
import { adminRepo, socialRepo } from '@/features/social/infrastructure/repository-factory';
import { userProfileRepo } from '@/features/leaderboard/infrastructure/repository-factory';
import {
  type UseInfiniteQueryResult,
  type InfiniteData,
  useQueryClient,
} from '@tanstack/react-query';
import { IAdminRepository } from '../../domain/admin-repository';
import { useLikePost } from '../../application/use-like-post';
import { useToggleUserFollow } from '../../application/use-toggle-user-follow';
import { followRepo } from '@/features/leaderboard/infrastructure/repository-factory';

type Feed = 'for-you' | 'following';

interface SocialTabProps {
  feedQuery: UseInfiniteQueryResult<InfiniteData<Post[]>>;
  tags: string[];
  activeUsers: ActiveUser[];
  onPublish: (text: string, imageFile?: File | null) => void;
  currentUserRole?: string;
  adminRepo?: IAdminRepository;
}

export function SocialTab({
  feedQuery,
  tags,
  activeUsers,
  onPublish,
  currentUserRole,
}: SocialTabProps) {
  const router = useRouter();
  const followToggle = useToggleUserFollow(followRepo);
  const [feed, setFeed] = useState<Feed>('for-you');
  const [query, setQuery] = useState('');
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const allPosts = useMemo(() => feedQuery.data?.pages.flat() ?? [], [feedQuery.data]);
  // Client‑side filtering (replace with server‑side later)
  const visible = useMemo(() => {
    let list = allPosts;
    if (feed === 'following') {
      // TODO: replace with API param once backend supports it
      list = list.filter((p) => p.authorId === 'adam'); // placeholder
    }
    const q = query.trim();
    if (q) list = list.filter((p) => p.text.includes(q) || p.author.includes(q));
    return list;
  }, [feed, query, allPosts]);
  const handleShare = (postId: string) => setSharePostId(postId);

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی پست، کاربر یا #هشتگ"
            className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 h-12 w-full rounded-xl border ps-11 pe-4 text-[14px] outline-none [background:var(--glass-2)]"
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
              onClick={() => setFeed(id)}
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
              message="ارتباط با انجمن برقرار نشد. دوباره تلاش کن."
              action={{
                label: 'تلاش دوباره',
                onClick: () => void feedQuery.refetch(),
                icon: 'bolt',
              }}
            />
          </div>
        )}

        {/* Feed */}
        {feedQuery.isSuccess && visible.length === 0 && (
          <div className="text-ink-3 border-hair rounded-[20px] border py-16 text-center [background:var(--glass)]">
            نتیجه‌ای پیدا نشد
          </div>
        )}
        {visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => router.push(`/social/${post.id}`)}
            onShare={() => handleShare(post.id)}
            onAuthorClick={(authorId) => setSelectedProfileUserId(authorId)}
            onToggleAuthorFollow={(authorId, isFollowedByMe) =>
              followToggle.mutate({ userId: authorId, isFollowedByMe })
            }
            isTogglingAuthorFollow={followToggle.isPending}
            togglingAuthorId={followToggle.variables?.userId}
            currentUserRole={currentUserRole}
            adminRepo={adminRepo}
          />
        ))}

        {/* Load more pagination */}
        {feedQuery.hasNextPage && !feedQuery.isFetchingNextPage && (
          <button
            onClick={() => feedQuery.fetchNextPage()}
            className="text-gold hover:text-ember mt-4 w-full text-center text-sm font-bold transition-colors"
          >
            نمایش بیشتر
          </button>
        )}
        {feedQuery.isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <InlineSkeleton className="h-4 w-32" />
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="hidden flex-col gap-4 min-[1100px]:flex">
        <Panel title={undefined}>
          <h4 className="mb-3 text-[14px] font-extrabold">داغ‌ترین هشتگ‌ها</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-ember rounded-full border border-[rgba(255,98,0,.18)] px-3 py-1.5 text-[12.5px] font-bold [background:rgba(255,98,0,.08)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </Panel>

        <Panel title={undefined}>
          <h4 className="mb-3 text-[14px] font-extrabold text-[#FDEEE299]">اعضای فعال</h4>
          <div className="flex flex-col gap-3">
            {activeUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-2.5">
                {u.isAdam ? (
                  <AdamAvatar className="size-9" />
                ) : (
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-black text-white"
                    style={{ background: u.avatar }}
                  >
                    {getAvatarInitial(u.name)}
                  </span>
                )}
                <span className="min-w-0 flex-1 leading-tight">
                  <b className="block truncate text-[13px] font-bold">{u.name}</b>
                  <small className="text-ink-3 text-[11px]">{u.role}</small>
                </span>
                {u.canFollow && (
                  <button
                    type="button"
                    disabled={followToggle.isPending && followToggle.variables?.userId === u.id}
                    onClick={() =>
                      followToggle.mutate({
                        userId: u.id,
                        isFollowedByMe: Boolean(u.isFollowedByMe),
                      })
                    }
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[11px] font-extrabold transition-colors disabled:opacity-60',
                      u.isFollowedByMe
                        ? 'border-[rgba(243,186,99,.28)] text-ink-2 bg-white/5'
                        : 'text-gold border-[rgba(243,186,99,.32)] hover:border-[rgba(243,186,99,.5)]',
                    )}
                  >
                    {followToggle.isPending && followToggle.variables?.userId === u.id
                      ? '...'
                      : u.isFollowedByMe
                        ? 'هم‌پرواز'
                        : 'هم پرواز شدن'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Post Detail Modal */}
      <button
        type="button"
        onClick={() => setIsCreatePostOpen(true)}
        aria-label="ایجاد پست جدید"
        className="fixed bottom-24 left-4 z-40 inline-flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full border border-[rgba(255,130,50,.36)] px-4 text-[#1a0a00] shadow-[0_18px_48px_-18px_var(--glow)] transition-[transform,opacity,box-shadow] duration-250 [background:var(--fire-grad)] hover:-translate-y-0.5 hover:shadow-[0_24px_56px_-18px_var(--glow)] active:scale-95 lg:bottom-8 lg:left-8 lg:min-w-40"
      >
        <Icon name="plus" size={22} />
        <span className="hidden text-sm font-black lg:inline">ایجاد پست</span>
      </button>

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

      {/* User Profile Modal */}
      {selectedProfileUserId && (
        <UserProfileModalContainer
          userId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
          repository={userProfileRepo}
        />
      )}

      {/* Share Modal */}
      <SharePostModal isOpen={sharePostId !== null} onClose={() => setSharePostId(null)} />
    </div>
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
  adminRepo,
}: {
  post: Post;
  onClick: () => void;
  onShare: () => void;
  onAuthorClick: (authorId: string) => void;
  onToggleAuthorFollow: (authorId: string, isFollowedByMe: boolean) => void;
  isTogglingAuthorFollow: boolean;
  togglingAuthorId?: string;
  currentUserRole?: string;
  adminRepo?: IAdminRepository;
}) {
  const { like, unlike } = useLikePost(socialRepo); // need to get socialRepo from context or prop – for now we can use the same repository factory, but we'll inject it through props too. Actually, we can import `socialRepo` directly from the factory in this component (since it's a singleton) to avoid prop drilling. We'll do that.

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

  const handleDeletePost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!adminRepo) return;
    const confirmed = window.confirm('آیا از حذف این پست مطمئن هستید؟');
    if (confirmed) {
      adminRepo.deletePost(post.id).then(() => {
        // Invalidate feed
        queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      });
    }
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!adminRepo) return;
    adminRepo.pinPost(post.id, !post.isPinned).then(() => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    });
  };

  const isAdmin = currentUserRole === 'admin' || currentUserRole === 'super_admin';
  const canFollowAuthor = Boolean(post.canFollowAuthor);
  const isFollowingAuthor = Boolean(post.isAuthorFollowedByMe);
  const isCurrentAuthorToggling = isTogglingAuthorFollow && togglingAuthorId === post.authorId;

  return (
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
          <Icon name="star" size={16} /> پین شده
        </div>
      )}
      {post.isAdam && <FounderBanner />}
      <div className="p-5">
        {/* Author area */}
        <div className="flex items-center gap-3">
          {/* ... author avatar and name (unchanged) ... */}
          {/* Admin actions */}
          {post.isAdam ? (
            <AdamAvatar className="size-11" />
          ) : (
            <div
              className="flex cursor-pointer items-center gap-3"
              onClick={(e) => {
                e.stopPropagation();
                onAuthorClick(post.authorId);
              }}
            >
              <span
                className="grid size-11 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                style={{ background: post.avatar }}
              >
                {getAvatarInitial(post.author)}
              </span>
            </div>
          )}
          <div
            className="min-w-0 flex-1 leading-tight"
            onClick={(e) => {
              e.stopPropagation();
              onAuthorClick(post.authorId);
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <b className="truncate text-sm font-extrabold">{post.author}</b>
              {post.isAdam && (
                <span className="text-gold rounded-xs border border-[rgba(255,98,0,.18)] px-2 py-1 text-[10px] font-extrabold shadow-[0_4px_16px_-8px_rgba(255,98,0,.25)] [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.08))]">
                  موسس
                </span>
              )}
            </div>
            <small className={`${post.isAdam ? 'text-gold' : 'text-ink-3'} text-[12px]`}>
              {post.isAdam ? 'ققنوس' : post.badge}
            </small>
          </div>
          {/* {post.location && <div className="mt-3 text-sm text-orange-300">📍 {post.location}</div>}
        </div> */}
          {isAdmin && (
            <div className="ms-auto flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button onClick={handlePinToggle} className="text-gold hover:text-ember">
                <Icon name={post.isPinned ? 'star' : 'star-line'} size={18} />
              </button>
              <button onClick={handleDeletePost} className="text-danger hover:text-red-400">
                <Icon name="trash" size={18} />
              </button>
            </div>
          )}
          {canFollowAuthor && (
            <button
              type="button"
              disabled={isCurrentAuthorToggling}
              onClick={(event) => {
                event.stopPropagation();
                onToggleAuthorFollow(post.authorId, isFollowingAuthor);
              }}
              className={cn(
                'ms-auto shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-colors disabled:opacity-60',
                isFollowingAuthor
                  ? 'border-[rgba(243,186,99,.28)] bg-white/5 text-ink-2'
                  : 'text-gold border-[rgba(243,186,99,.32)] hover:border-[rgba(243,186,99,.5)]',
              )}
            >
              {isCurrentAuthorToggling ? '...' : isFollowingAuthor ? 'هم‌پرواز' : 'هم پرواز شدن'}
            </button>
          )}
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
        {(post.image || post.hasImage) && (
          <div className="text-ink-4 mt-3 grid h-44 place-items-center overflow-hidden rounded-[14px] [background:var(--glass-2)]">
            {post.image ? (
              <img src={post.image} alt="Post attachment" className="h-full w-full object-cover" />
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
              {toPersianDigits(post.comments.length)}
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
          <time className="text-ink-4 block text-xs sm:text-[13px]">{formatRelativeTime(post.time)}</time>
        </div>
      </div>
    </article>
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
