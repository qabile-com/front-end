// src/features/dashboard/presentation/components/course-session-modal.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useScrollLock } from '../../application/use-scroll-lock';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { SectionWatchProgressInput } from '../../domain/dashboard.types';
import type { PaginatedComments } from '../../domain/comments-repository';
import type { CoursePart } from '../../domain/courses.data';
import { SessionContent } from './session-content';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: CoursePart;
  videoUrl?: string;
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  onNextSession: () => void;
  onWatchProgress: (body: SectionWatchProgressInput) => void;
  onAddComment: (text: string) => void;
  isAddingComment?: boolean;
  userName?: string;
}

export function CourseSessionModal({
  isOpen,
  onClose,
  session,
  onNextSession,
  onWatchProgress,
  commentsQuery,
  videoUrl,
  userName,
  onAddComment,
  isAddingComment = false,
}: Props) {
  useScrollLock(!!isOpen);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="md:border-hair flex max-h-full w-full max-w-4xl flex-col overflow-hidden bg-[var(--color-panel)] md:max-h-[90vh] md:rounded-2xl md:border">
        <SessionContent
          session={session}
          videoUrl={videoUrl}
          commentsQuery={commentsQuery}
          onNextSession={onNextSession}
          onWatchProgress={onWatchProgress}
          onAddComment={onAddComment}
          userName={userName}
          isAddingComment={isAddingComment}
          onBack={handleClose}
        />
      </div>
    </div>
  );
}

export { formatDurationFa } from './session-content';
