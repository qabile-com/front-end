// // src/features/dashboard/presentation/sections/social-tab.tsx
// 'use client';

// import { useMemo, useState } from 'react';
// import { Icon, type IconName } from '@/shared/ui';
// import { cn } from '@/core/lib/cn';
// import { toPersianDigits } from '@/core/lib/persian';
// import type { Post, ActiveUser } from '../../domain/social.data';
// import { Panel } from '../components/panel';
// import { AdamAvatar } from './dashboard-sidebar';
// import { CreatePost } from './create-post';
// import { SocialPostDetailModal } from '../components/social-post-detail-modal';

// type Feed = 'for-you' | 'following';

// interface SocialTabProps {
//   posts: Post[];
//   tags: string[];
//   activeUsers: ActiveUser[];
//   onPublish: (text: string, location?: string, emoji?: string) => void;
// }

// export function SocialTab({ posts, tags, activeUsers, onPublish }: SocialTabProps) {
//   const [feed, setFeed] = useState<Feed>('for-you');
//   const [query, setQuery] = useState('');
//   const [selectedPost, setSelectedPost] = useState<Post | null>(null);

//   const visible = useMemo(() => {
//     let list = posts;
//     if (feed === 'following') {
//       list = list.filter((p) => p.authorId === 'adam' || p.authorId === 'arash');
//     }
//     const q = query.trim();
//     if (q) list = list.filter((p) => p.text.includes(q) || p.author.includes(q));
//     return list;
//   }, [feed, query, posts]);

//   return (
//     <div className="grid gap-7 min-[1100px]:grid-cols-[1fr_300px]">
//       <div className="flex flex-col gap-4">
//         {/* Search bar */}
//         <div className="relative">
//           <Icon
//             name="target"
//             size={18}
//             className="text-ink-3 absolute inset-y-0 start-3.5 my-auto"
//           />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="جستجوی پست، کاربر یا #هشتگ"
//             className="text-ink border-hair placeholder:text-ink-3 focus:border-hair-2 bg-bg-2 h-12 w-full rounded-xl border ps-4 pe-11 pr-10 text-[14px] outline-none"
//           />
//         </div>

//         {/* Feed tabs */}
//         <div className="border-hair bg-bg-2 grid grid-cols-2 gap-1 rounded-xl border p-1">
//           {(
//             [
//               ['for-you', 'برای شما'],
//               ['following', 'دنبال‌شده‌ها'],
//             ] as const
//           ).map(([id, label]) => (
//             <button
//               key={id}
//               type="button"
//               onClick={() => setFeed(id)}
//               className={cn(
//                 'rounded-lg py-2.5 text-[13.5px] font-bold transition-colors',
//                 feed === id ? 'bg-ember text-[#1a0a00]' : 'text-ink-2 hover:text-ink',
//               )}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         {/* Post composer */}

//         {/* Feed */}
//         {visible.length === 0 ? (
//           <div className="text-ink-3 border-hair bg-panel rounded-[20px] border py-16 text-center">
//             نتیجه‌ای پیدا نشد
//           </div>
//         ) : (
//           visible.map((post) => (
//             <PostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
//           ))
//         )}
//       </div>

//       {/* Right sidebar */}
//       <div className="hidden flex-col gap-4 min-[1100px]:flex">
//         <Panel title={undefined}>
//           <h4 className="text-ink mb-3 text-[14px] font-extrabold">داغ‌ترین هشتگ‌ها</h4>
//           <div className="flex flex-wrap gap-2">
//             {tags.map((tag) => (
//               <span
//                 key={tag}
//                 className="text-ember border-ember/20 bg-ember/10 rounded-full border px-3 py-1.5 text-[12.5px] font-bold"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </Panel>

//         <Panel title={undefined}>
//           <h4 className="text-ink-2 mb-3 text-[14px] font-extrabold">اعضای فعال</h4>
//           <div className="flex flex-col gap-3">
//             {activeUsers.map((u) => (
//               <div key={u.name} className="flex items-center gap-2.5">
//                 {u.isAdam ? (
//                   <AdamAvatar className="size-9" />
//                 ) : (
//                   <span className="size-9 shrink-0 rounded-full" style={{ background: u.avatar }} />
//                 )}
//                 <span className="min-w-0 flex-1 leading-tight">
//                   <b className="text-ink block truncate text-[13px] font-bold">{u.name}</b>
//                   <small className="text-ink-3 text-[11px]">{u.role}</small>
//                 </span>
//                 {u.canFollow && (
//                   <button className="text-ember border-ember/50 hover:bg-ember/10 rounded-full border bg-transparent px-2.5 py-1 text-[11px] font-extrabold transition-colors">
//                     هم پرواز شدن
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </Panel>
//       </div>
//       <CreatePost onPublish={onPublish} />

//       {/* Post Detail Modal */}
//       {selectedPost && (
//         <SocialPostDetailModal
//           isOpen={!!selectedPost}
//           onClose={() => setSelectedPost(null)}
//           post={selectedPost}
//         />
//       )}
//     </div>
//   );
// }

// // ---- PostCard (Updated for flat background and Founder header) ----

// function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
//   const [liked, setLiked] = useState(false);
//   const likes = post.likes + (liked ? 1 : 0);

//   return (
//     <article
//       className={cn(
//         'bg-panel font-vazirmatn flex cursor-pointer flex-col overflow-hidden rounded-[20px] border',
//         post.isAdam ? 'border-ember/30' : 'border-hair',
//       )}
//       onClick={onClick}
//     >
//       {/* Founder post top separator */}
//       {post.isAdam && (
//         <div className="border-ember/30 text-ember flex items-center gap-2 border-b px-5 pt-4 pb-3">
//           <span className="bg-ember size-1.5 shrink-0 rounded-full" />
//           <span className="text-[13px] font-extrabold">پیام از بنیان‌گذار</span>
//         </div>
//       )}

//       <div className="flex flex-col gap-4 p-5">
//         <div className="flex items-center gap-3">
//           {post.isAdam ? (
//             <AdamAvatar className="size-11" />
//           ) : (
//             <span className="size-11 shrink-0 rounded-full" style={{ background: post.avatar }} />
//           )}
//           <div className="min-w-0 flex-1 leading-tight">
//             <div className="mb-1 flex items-center gap-1.5">
//               <b className="text-ink truncate text-sm font-extrabold">{post.author}</b>
//               {post.isAdam && (
//                 <span className="text-gold border-gold/20 bg-gold/10 rounded-xs border px-2 py-1 text-[10px] font-extrabold">
//                   موسس
//                 </span>
//               )}
//             </div>
//             <small className={`${post.isAdam ? 'text-gold' : 'text-ink-3'} text-[12px]`}>
//               {post.isAdam ? 'ققنوس' : post.badge}
//             </small>
//           </div>
//           {post.location && <div className="text-ember/80 mt-3 text-sm">📍 {post.location}</div>}
//         </div>

//         <p className="text-ink-2 text-[14.5px] leading-[1.8] whitespace-pre-line">{post.text}</p>

//         {post.achievement && (
//           <div className="border-ember/20 bg-ember/10 mt-1 flex items-center gap-3 rounded-[14px] border p-3.5">
//             <span className="text-ember bg-ember/20 grid size-11 shrink-0 place-items-center rounded-xl">
//               <Icon name={post.achievement.icon as IconName} size={22} />
//             </span>
//             <span className="leading-tight">
//               <b className="text-ember block text-[13.5px] font-extrabold">
//                 {post.achievement.title}
//               </b>
//               <small className="text-ink-3 text-[12px]">{post.achievement.sub}</small>
//             </span>
//           </div>
//         )}

//         {post.hasImage && (
//           <div className="text-ink-4 bg-bg-2 border-hair/30 mt-1 grid h-44 place-items-center rounded-[14px] border">
//             <Icon name="book" size={34} />
//           </div>
//         )}

//         <div className="text-ink-3 border-hair/30 mt-1 flex items-center justify-between gap-5 border-t pt-3 text-[13px]">
//           <div className="flex gap-10">
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setLiked((l) => !l);
//               }}
//               className={cn('flex items-center gap-1.5 transition-colors', liked && 'text-ember')}
//             >
//               <Icon name="heart" size={18} className={liked ? 'fill-current' : ''} />
//               {toPersianDigits(likes)}
//             </button>
//             <button
//               type="button"
//               onClick={(e) => e.stopPropagation()}
//               className="hover:text-ink flex items-center gap-1.5 transition-colors"
//             >
//               <Icon name="msg" size={18} />
//               {toPersianDigits(post.comments.length)}
//             </button>
//             <button
//               type="button"
//               onClick={(e) => e.stopPropagation()}
//               className="hover:text-ink flex items-center gap-1.5 transition-colors"
//             >
//               <Icon name="share" size={18} />
//               اشتراک‌گذاری
//             </button>
//           </div>
//           {post.time}
//         </div>
//       </div>
//     </article>
//   );
// }
