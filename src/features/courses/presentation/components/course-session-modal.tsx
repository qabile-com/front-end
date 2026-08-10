'use client';

import { BaseModal } from '@/shared/ui';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';
import type { PaginatedComments } from '../../domain/comments-repository';
import type { CoursePart } from '../../domain/courses.data';
import { SessionContent } from './session-content';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  session: CoursePart;
  videoUrl?: string;
  audioUrl?: string;
  commentsQuery: UseInfiniteQueryResult<InfiniteData<PaginatedComments>>;
  onNextSession: () => void;
  onWatchProgress: (body: SectionWatchProgressInput) => void;
  onAddComment: (text: string) => void;
  isAddingComment?: boolean;
  userName?: string;
  userAvatar?: string | null;
}

export function CourseSessionModal({
  isOpen,
  onClose,
  session,
  onNextSession,
  onWatchProgress,
  commentsQuery,
  videoUrl,
  audioUrl,
  userName,
  userAvatar,
  onAddComment,
  isAddingComment = false,
}: Props) {
  const handleClose = () => {
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={session.title}
      zIndexClassName="z-999"
      className="bg-black/80 p-0 md:p-4"
      panelClassName="md:border-hair flex max-h-full w-full max-w-4xl flex-col overflow-hidden bg-[var(--color-panel)] md:max-h-[90dvh] md:rounded-2xl md:border"
    >
        <SessionContent
          session={session}
          videoUrl={videoUrl}
          audioUrl={audioUrl}
          commentsQuery={commentsQuery}
          onNextSession={onNextSession}
          onWatchProgress={onWatchProgress}
          onAddComment={onAddComment}
          userName={userName}
          userAvatar={userAvatar}
          isAddingComment={isAddingComment}
          onBack={handleClose}
        />
    </BaseModal>
  );
}

export { formatDurationFa } from './session-content';
