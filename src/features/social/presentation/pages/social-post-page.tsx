'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import { userProfileRepo } from '@/features/leaderboard/infrastructure/repository-factory';
import { useAddPostComment, useSocialPost } from '@/features/social/application/use-social-post';
import { useLikePost } from '@/features/social/application/use-like-post';
import { UserProfileModalContainer } from '@/features/leaderboard/presentation/components/user-profile-modal-container';
import { SocialPostDetail } from '@/features/social/presentation/components/social-post-detail';
import { ErrorState, Icon, PostDetailSkeleton } from '@/shared/ui';
import { showError, showSuccess } from '@/shared/lib/toast';

export function SocialPostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = params.postId;
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);

  const { data: post, isLoading, error, refetch } = useSocialPost(socialRepo, postId);
  const addComment = useAddPostComment(socialRepo);
  const { like, unlike } = useLikePost(socialRepo);

  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.author ? `پست ${post.author}` : 'پست قبیله';
    const text = post?.text ? post.text.slice(0, 120) : 'این پست قبیله را ببین.';

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      showSuccess('لینک پست کپی شد');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      showError('اشتراک‌گذاری انجام نشد');
    }
  };

  if (isLoading) return <PostDetailSkeleton />;

  if (error || !post) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <ErrorState
          compact
          title="پست پیدا نشد"
          message={error instanceof Error ? error.message : 'این پست آماده نیست یا حذف شده است.'}
          action={{ label: 'تلاش دوباره', onClick: () => void refetch(), icon: 'bolt' }}
          secondaryAction={{ label: 'بازگشت به انجمن', href: '/social', icon: 'arrow-right' }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <button
        type="button"
        onClick={() => router.push('/social')}
        className="text-ink-3 hover:text-gold mb-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-hair)] bg-black/20 px-3 text-sm font-black transition-colors"
      >
        <Icon name="arrow-right" size={17} />
        بازگشت به انجمن
      </button>

      <SocialPostDetail
        post={post}
        onAddComment={(currentPostId, text) => addComment.mutate({ postId: currentPostId, text })}
        onShare={() => void handleShare()}
        onLike={() => like(post.id)}
        onUnlike={() => unlike(post.id)}
        onAuthorClick={setSelectedProfileUserId}
        isAddingComment={addComment.isPending}
      />

      {selectedProfileUserId && (
        <UserProfileModalContainer
          userId={selectedProfileUserId}
          onClose={() => setSelectedProfileUserId(null)}
          repository={userProfileRepo}
        />
      )}
    </div>
  );
}
