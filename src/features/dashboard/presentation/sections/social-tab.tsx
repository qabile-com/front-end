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

type Feed = 'for-you' | 'following';

interface SocialTabProps {
  posts: Post[];
  tags: string[];
  activeUsers: ActiveUser[];
  onPublish: (text: string, location?: string, emoji?: string) => void;
}

export function SocialTab({ posts, tags, activeUsers, onPublish }: SocialTabProps) {
  const [feed, setFeed] = useState<Feed>('for-you');
  const [query, setQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const visible = useMemo(() => {
    let list = posts;
    if (feed === 'following') {
      list = list.filter((p) => p.authorId === 'adam' || p.authorId === 'arash');
    }
    const q = query.trim();
    if (q) list = list.filter((p) => p.text.includes(q) || p.author.includes(q));
    return list;
  }, [feed, query, posts]);

  return (
    <div className="grid gap-7 min-[1100px]:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-4">
        {/* Search bar */}
        <div className="relative">
          <Icon
            name="search"
            size={18}
            className="absolute inset-y-7 start-3.5 my-auto text-[#FF6200]"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی پست، کاربر یا #هشتگ"
            className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 h-12 w-full rounded-xl border ps-4 pe-11 pr-10 text-[14px] outline-none [background:var(--glass-2)]"
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

        {/* Feed */}
        {visible.length === 0 ? (
          <div className="text-ink-3 border-hair rounded-[20px] border py-16 text-center [background:var(--glass)]">
            نتیجه‌ای پیدا نشد
          </div>
        ) : (
          visible.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
          ))
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
                  <button className="text-gold rounded-full border-1 border-[gradient(--gold-grad)] px-2.5 py-1 text-[11px] font-extrabold text-[#1a0a00]">
                    هم پرواز شدن
                  </button>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {/* Post composer */}
      <CreatePost onPublish={() => {}} />
      {/* Post Detail Modal */}
      {selectedPost && (
        <SocialPostDetailModal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          post={selectedPost}
        />
      )}
    </div>
  );
}

// ---- PostCard (now clickable) ----

function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const [liked, setLiked] = useState(false);
  const likes = post.likes + (liked ? 1 : 0);

  return (
    <article
      className={cn(
        'relative overflow-hidden transition-all',
        post.isAdam
          ? `border-t border-[rgba(255,98,0,.25)] bg-[#140C07] shadow-[0_0_0_1px_rgba(255,130,40,.05),0_20px_40px_rgba(0,0,0,.35)]`
          : `border-t border-[#2A1C16] bg-[#090705]`,
      )}
      onClick={onClick}
    >
      {post.isAdam && <FounderBanner />}
      <div className="p-5">
        <div className="flex items-center gap-3">
          {post.isAdam ? (
            <AdamAvatar className="size-11" />
          ) : (
            <span className="size-11 shrink-0 rounded-full" style={{ background: post.avatar }} />
          )}
          <div className="min-w-0 flex-1 leading-tight">
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
          {post.location && <div className="mt-3 text-sm text-orange-300">📍 {post.location}</div>}
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

        {post.hasImage && (
          <div className="text-ink-4 mt-3 grid h-44 place-items-center rounded-[14px] [background:var(--glass-2)]">
            <Icon name="book" size={34} />
          </div>
        )}

        <div className="text-ink-3 mt-4 flex items-center justify-between gap-5 text-[13px]">
          <div className="flex gap-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setLiked((l) => !l);
              }}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                liked && 'text-[#ff5a5a]',
              )}
            >
              <Icon name="heart" size={18} className={liked ? 'fill-current' : ''} />
              {toPersianDigits(likes)}
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-ink flex items-center gap-1.5 transition-colors"
            >
              <Icon name="msg" size={18} />
              {toPersianDigits(post.comments.length)}
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
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
        className="my-4 h-[3px] bg-gradient-to-r from-[rgba(255,98,0,.25)] from-20% via-[#E8A545] via-30% to-[rgba(255,98,0,.25)] to-80%"
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
