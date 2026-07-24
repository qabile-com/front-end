'use client';

import { useMemo, useState } from 'react';
import { Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import type { Post, ActiveUser } from '../../domain/social.data';
import { Panel } from '../components/panel';
import { AdamAvatar } from './dashboard-sidebar';
import { CreatePost } from './create-post';
import { SocialPostDetailModal } from '../components/social-post-detail-modal';
import { SharePostModal } from '../components/share-post-modal';
import { UserProfileModalContainer } from '../components/user-profile-modal-container';
import { adminRepo, socialRepo, userProfileRepo } from '../../infrastructure/repository-factory';
import {
  type UseInfiniteQueryResult,
  type InfiniteData,
  useQueryClient,
} from '@tanstack/react-query';
import { IAdminRepository } from '../../domain/admin-repository';
import { useLikePost } from '../../application/use-like-post';

type Feed = 'for-you' | 'following';

interface SocialTabProps {
  feedQuery: UseInfiniteQueryResult<InfiniteData<Post[]>>;
  tags: string[];
  activeUsers: ActiveUser[];
  onPublish: (
    text: string,
    location?: string,
    emoji?: string,
    imageFile?: File | null,
    gifUrl?: string,
  ) => void;
  onAddComment: (postId: string, text: string) => void;
  currentUserRole?: string;
  adminRepo?: IAdminRepository;
}

export function SocialTab({
  feedQuery,
  tags,
  activeUsers,
  onPublish,
  onAddComment,
  currentUserRole,
}: SocialTabProps) {
  const [feed, setFeed] = useState<Feed>('for-you');
  const [query, setQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [sharePostId, setSharePostId] = useState<string | null>(null);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

  const allPosts = feedQuery.data?.pages.flat() ?? [];
  console.log(allPosts);
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
            className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 h-12 w-full rounded-xl border ps-4 pe-11 text-[14px] outline-none [background:var(--glass-2)]"
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

        {/* Post composer */}
        <CreatePost
          onPublish={(text, location?, emoji?, imageFile?, gifUrl?) =>
            onPublish(text, location, emoji, imageFile, gifUrl)
          }
        />

        {/* Loading & error states */}
        {feedQuery.isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-ink-3 text-lg">در حال بارگذاری...</div>
          </div>
        )}
        {feedQuery.isError && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-danger text-lg">خطا در دریافت پست‌ها</div>
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
            onClick={() => setSelectedPost(post)}
            onShare={() => handleShare(post.id)}
            onAuthorClick={(authorId) => setSelectedProfileUserId(authorId)}
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
          <div className="text-ink-3 text-center text-sm">در حال بارگذاری...</div>
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
              <div key={u.name} className="flex items-center gap-2.5">
                {u.isAdam ? (
                  <AdamAvatar className="size-9" />
                ) : (
                  <span className="size-9 shrink-0 rounded-full" style={{ background: u.avatar }} />
                )}
                <span className="min-w-0 flex-1 leading-tight">
                  <b className="block truncate text-[13px] font-bold">{u.name}</b>
                  <small className="text-ink-3 text-[11px]">{u.role}</small>
                </span>
                {u.canFollow && (
                  <button className="text-gold rounded-full border border-[gradient(--gold-grad)] px-2.5 py-1 text-[11px] font-extrabold">
                    هم پرواز شدن
                  </button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <SocialPostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
          onAddComment={onAddComment}
          onShare={() => handleShare(selectedPost.id)}
        />
      )}

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
  currentUserRole,
  adminRepo,
}: {
  post: Post;
  onClick: () => void;
  onShare: () => void;
  onAuthorClick: (authorId: string) => void;
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
              <span className="size-11 shrink-0 rounded-full" style={{ background: post.avatar }} />
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
        <div className="text-ink-3 mt-4 flex items-center justify-between gap-5 text-[13px]">
          <div className="flex gap-10">
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
          {post.time}
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
