'use client';

import { useMemo, useState } from 'react';
import { Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import {
  ACTIVE_USERS,
  POSTS,
  TRENDING_TAGS,
  type Post,
} from '@/features/dashboard/domain/social.data';
import { Panel } from '../components/panel';
import { AdamAvatar } from './dashboard-sidebar';
import { CreatePost } from './create-post';

type Feed = 'for-you' | 'following';

export function SocialTab() {
  const [feed, setFeed] = useState<Feed>('for-you');
  const [query, setQuery] = useState('');

  const [userPosts, setUserPosts] = useState<Post[]>([]);

  const visible = useMemo(() => {
    let list = [...userPosts, ...POSTS];
    if (feed === 'following')
      list = list.filter((p) => p.authorId === 'adam' || p.authorId === 'arash');
    const q = query.trim();
    if (q) list = list.filter((p) => p.text.includes(q) || p.author.includes(q));
    return list;
  }, [feed, query, userPosts]);

  return (
    <div className="grid gap-7 min-[1100px]:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Icon
            name="target"
            size={18}
            className="text-ink-3 absolute inset-y-0 start-3.5 my-auto"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجوی پست، کاربر یا #هشتگ"
            className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 h-12 w-full rounded-xl border ps-4 pe-11 pr-10 text-[14px] outline-none [background:var(--glass-2)]"
          />
        </div>

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

        {visible.length === 0 ? (
          <div className="text-ink-3 border-hair rounded-[20px] border py-16 text-center [background:var(--glass)]">
            نتیجه‌ای پیدا نشد
          </div>
        ) : (
          visible.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <div className="hidden flex-col gap-4 min-[1100px]:flex">
        <Panel title={undefined}>
          <h4 className="mb-3 text-[14px] font-extrabold">داغ‌ترین هشتگ‌ها</h4>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => (
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
            {ACTIVE_USERS.map((u) => (
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
      <>
        {visible.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        <CreatePost onPublish={(post) => setUserPosts((prev) => [post, ...prev])} />
      </>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const likes = post.likes + (liked ? 1 : 0);

  return (
    <article
      className={cn(
        'border-hair overflow-hidden rounded-[20px] border [background:var(--glass)]',
        post.isAdam && 'border-[rgba(255,100,30,.22)]',
      )}
    >
      {post.isAdam && <div className="h-1 [background:var(--fire-grad)]" />}
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
              {/* {post.verified && <Icon name="check" size={13} className="text-ember shrink-0" />} */}
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
              onClick={() => setLiked((l) => !l)}
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
              className="hover:text-ink flex items-center gap-1.5 transition-colors"
            >
              <Icon name="msg" size={18} />
              {toPersianDigits(post.comments.length)}
            </button>
            <button
              type="button"
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
