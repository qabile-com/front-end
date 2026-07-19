'use client';

import { useState } from 'react';
import { cn } from '@/core/lib/cn';
import { Button, Icon, Input } from '@/shared/ui';
import type { CoursePart } from '../../domain/courses.data';
import { useScrollLock } from '../../application/use-scroll-lock';
import { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import { PaginatedComments } from '../../domain/comments-repository';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: CoursePart;
  videoUrl?: string;
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  onMarkComplete: () => void;
  onAddComment: (text: string) => void;
}

export function CourseSessionModal({
  isOpen,
  onClose,
  session,
  onMarkComplete,
  commentsQuery,
  videoUrl,
  onAddComment,
}: Props) {
  useScrollLock(!!isOpen);
  const [commentText, setCommentText] = useState('');

  if (!isOpen) return null;

  const allComments = commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText('');
    }
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="md:border-hair flex max-h-full w-full max-w-4xl flex-col overflow-hidden bg-[var(--color-panel)] md:max-h-[90vh] md:rounded-2xl md:border">
        {/* Header */}
        <div className="border-hair flex shrink-0 items-center justify-between border-b p-4 md:hidden">
          <button
            onClick={onClose}
            className="text-ink-2 hover:text-gold flex items-center gap-2 transition-colors"
          >
            <div className="text-gold flex cursor-pointer items-center gap-2 md:hidden">
              <Icon
                name="arrow-right"
                size={20}
                className="transition-transform group-hover:-translate-x-1"
              />
              بازگشت
            </div>
          </button>
          <h2 className="text-lg font-bold md:hidden">{session.title}</h2>
          <button
            onClick={onClose}
            className="text-ink-2 hover:text-ink rounded-lg p-2 transition-colors"
          >
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Video player */}
          <div className="relative h-[220px] w-full bg-black sm:h-[260px] md:h-[320px]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {videoUrl ? (
              <video src={videoUrl} controls className="h-full w-full object-cover" />
            ) : (
              <button className="bg-ember hover:bg-ember-deep absolute inset-0 z-10 m-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors">
                <Icon name="play" size={22} className="text-white" />
              </button>
            )}
            {/* <div className="absolute right-4 bottom-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white/80">
              {session.duration}
            </div> */}
          </div>

          {/* Info bar */}
          <div className="border-hair flex items-center justify-between border-b px-6 py-4">
            <div className="text-ink-3 flex items-center gap-2 text-sm">
              <button
                onClick={onClose}
                className="text-ink-2 hover:text-gold flex items-center gap-2 transition-colors"
              >
                <div className="text-gold flex hidden cursor-pointer items-center gap-2 md:flex">
                  <Icon
                    name="arrow-right"
                    size={20}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                  بازگشت
                </div>
              </button>
            </div>
            <h2 className="hidden text-lg font-bold md:block">{session.title}</h2>
            <button className="bg-ember hover:bg-ember-deep flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-[#1a0a00] transition-colors">
              ویدیو بعدی
              <Icon name="arrow-left" size={16} />
            </button>
          </div>

          {/* Exercise Steps */}
          {session.steps && session.steps.length > 0 && (
            <div className="space-y-3 p-6 pb-0">
              <h3 className="text-ink-2 mb-2 font-bold">مراحل تمرین:</h3>
              {session.steps.map((step) => (
                <label
                  key={step.id}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg bg-[var(--glass-2)] p-3 transition-colors hover:bg-[var(--glass-3)]"
                >
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                      step.isCompleted
                        ? 'border-ember bg-ember text-white'
                        : 'border-hair group-hover:border-ink-4 text-transparent',
                    )}
                  >
                    {step.isCompleted && <Icon name="check" size={16} />}
                  </div>
                  <span className="text-ink-2 text-right text-sm leading-relaxed">{step.text}</span>
                </label>
              ))}
            </div>
          )}
          <div className="text-ink-3 flex items-center gap-6 text-sm">
            <span className="flex items-center gap-2">
              <Icon name="clock" size={16} /> {session.duration}
            </span>
            <span className="flex items-center gap-2">
              <Icon name="eye" size={16} /> {session.views}
            </span>
          </div>
          {/* Comments Section */}
          <div className="p-6 pb-20">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-ink-2 text-sm font-bold">
                نظرات کاربران ({commentsQuery.data?.pages[0]?.totalItems ?? 0})
              </h3>
            </div>
            <div className="space-y-4">
              {allComments.map((c, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">
                    {c.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-ink text-sm font-bold">{c.name}</span>
                      <span className="text-ink-4 text-xs">{c.time}</span>
                    </div>
                    <p className="text-ink-3 mt-1 text-sm">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {commentsQuery.hasNextPage && (
              <button
                onClick={() => commentsQuery.fetchNextPage()}
                className="text-gold hover:text-ember mt-4 w-full text-center text-sm font-bold transition-colors"
                disabled={commentsQuery.isFetchingNextPage}
              >
                {commentsQuery.isFetchingNextPage ? 'در حال بارگذاری...' : 'نمایش بیشتر'}
              </button>
            )}
          </div>
        </div>

        {/* Fixed comment input footer */}
        <div className="border-hair flex shrink-0 items-center gap-3 border-t bg-[var(--color-panel)] p-4">
          <div className="bg-ember flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">
            آ
          </div>
          <Input
            placeholder="نظرت رو بنویس..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
          />
          <Button
            variant="secondary"
            size="md"
            onClick={handleSubmitComment}
            disabled={!commentText.trim()}
            className="text-ember bg-ember rounded-sm"
          >
            ارسال
          </Button>
        </div>
      </div>
    </div>
  );
}
