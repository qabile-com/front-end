'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import {
  useAddPostComment,
  useDeletePostComment,
  useSocialPost,
  useSocialPostComments,
} from '@/features/social/application/use-social-post';
import { useLikePost } from '@/features/social/application/use-like-post';
import { SocialPostDetail } from '@/features/social/presentation/components/social-post-detail';
import { useUser } from '@/features/dashboard/application/use-user';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { ErrorState, Icon, PostDetailSkeleton } from '@/shared/ui';
import { showError, showSuccess } from '@/shared/lib/toast';
import { shareUrl } from '@/shared/lib/native-share';
import { getApiErrorView } from '@/core/api/api-error-view';
import { createAuthRedirectHref } from '@/core/auth/redirect';
import { useActionRewardQueue } from '@/features/dashboard/application/use-action-reward-queue';
import { ActionRewardModals } from '@/features/dashboard/presentation/components/action-reward-modals';
import { useAuthSession } from '@/providers/auth-provider';
import { LoginRequiredModal } from '../components/login-required-modal';
import { useDeleteOwnPost } from '../../application/use-delete-own-post';
import { usePinOwnPost } from '../../application/use-pin-own-post';
import { DeletePostConfirmModal } from '../components/delete-post-confirm-modal';

export function SocialPostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = params.postId;
  const currentPath = `/social/${postId}`;
  const from = searchParams.get('from');
  const fromUserId = searchParams.get('userId');

  const { data: post, isLoading, error, refetch } = useSocialPost(socialRepo, postId);
  const comments = useSocialPostComments(socialRepo, postId);
  const { currentReward, enqueueReward, dismissCurrentReward } = useActionRewardQueue();
  const addComment = useAddPostComment(socialRepo, enqueueReward);
  const deleteComment = useDeletePostComment(socialRepo, postId);
  const { like, unlike } = useLikePost(socialRepo, enqueueReward);
  const deleteOwnPost = useDeleteOwnPost(socialRepo);
  const pinOwnPost = usePinOwnPost(socialRepo);
  const auth = useAuthSession();
  const { user } = useUser(userRepo, { enabled: auth.isLoggedIn });
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pinnedOverride, setPinnedOverride] = useState<boolean | null>(null);
  const role = auth.role;
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isOwnPost = Boolean(post && auth.user?.id && post.authorId === auth.user.id);
  const canManageComments = isAdmin || isOwnPost;

  const handleDeleteOwnPost = async () => {
    if (!post || !requireLogin()) return;

    try {
      await deleteOwnPost.mutateAsync(post.id);
      setDeleteModalOpen(false);
      showSuccess('پست حذف شد.');
      router.push('/social');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'حذف پست انجام نشد.');
    }
  };

  const handlePinOwnPost = () => {
    if (!post || !requireLogin()) return;
    const nextPinned = !(pinnedOverride ?? post.isPinned);
    setPinnedOverride(nextPinned);
    pinOwnPost.mutate(
      { postId: post.id, isPinned: nextPinned },
      {
        onSuccess: (updatedPost) => {
          setPinnedOverride(updatedPost.isPinned);
          showSuccess(updatedPost.isPinned ? 'پست سنجاق شد.' : 'پست از حالت سنجاق خارج شد.');
        },
        onError: (error) => {
          setPinnedOverride(post.isPinned);
          showError(error instanceof Error ? error.message : 'تغییر وضعیت سنجاق انجام نشد.');
        },
      },
    );
  };

  const requireLogin = () => {
    if (auth.isLoggedIn) return true;
    setLoginPromptOpen(true);
    return false;
  };

  const handleShare = async () => {
    const title = post?.author ? `پست ${post.author}` : 'پست قبیله';

    try {
      await shareUrl({ title, path: currentPath });
      showSuccess('لینک پست کپی شد');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      showError('اشتراک‌گذاری انجام نشد');
    }
  };

  if (isLoading) return <PostDetailSkeleton />;

  if (error || !post) {
    const errorView = getApiErrorView(error, {
      title: 'پست پیدا نشد',
      message: 'این پست آماده نیست یا حذف شده است.',
    });

    return (
      <div className="flex min-h-80 items-center justify-center">
        <ErrorState
          compact
          title={errorView.statusCode === 404 ? 'پست پیدا نشد' : errorView.title}
          message={errorView.message}
          icon={errorView.icon}
          tone={errorView.tone}
          action={
            errorView.statusCode === 401
              ? { label: 'ورود', href: createAuthRedirectHref(currentPath), icon: 'lock' }
              : { label: 'تلاش دوباره', onClick: () => void refetch(), icon: 'bolt' }
          }
          secondaryAction={{ label: 'بازگشت به محفل', href: '/social', icon: 'arrow-right' }}
        />
      </div>
    );
  }

  const backTarget =
    from === 'profile'
      ? '/profile'
      : from === 'user-profile' && fromUserId
        ? `/social/users/${encodeURIComponent(fromUserId)}`
        : '/social';
  const backLabel =
    from === 'profile' || from === 'user-profile' ? 'بازگشت به پروفایل' : 'بازگشت به محفل';
  const visiblePost = { ...post, isPinned: pinnedOverride ?? post.isPinned };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="sticky top-[env(safe-area-inset-top)] z-30 mb-4 flex">
        <button
          type="button"
          onClick={() => {
            if (!requireLogin()) return;
            router.push(backTarget);
          }}
          className="text-ink-3 hover:text-gold inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-hair)] bg-[var(--color-panel)] px-3 text-sm font-black shadow-[0_10px_30px_-18px_var(--glow)] backdrop-blur-xl transition-colors"
        >
          <Icon name="arrow-right" size={17} />
          {backLabel}
        </button>
      </div>

      <SocialPostDetail
        post={{
          ...visiblePost,
          comments: comments.data ?? post.comments,
          commentsCount: comments.data?.length ?? post.commentsCount,
        }}
        onAddComment={async (currentPostId, text) => {
          if (!requireLogin()) return false;
          try {
            await addComment.mutateAsync({ postId: currentPostId, text });
            return true;
          } catch (error) {
            showError(error instanceof Error ? error.message : 'ثبت نظر انجام نشد.');
            return false;
          }
        }}
        onShare={() => void handleShare()}
        onLike={() => {
          if (!requireLogin()) return;
          like(post.id);
        }}
        onUnlike={() => {
          if (!requireLogin()) return;
          unlike(post.id);
        }}
        onAuthorClick={(authorId) =>
          router.push(`/social/users/${authorId}?from=post&postId=${encodeURIComponent(post.id)}`)
        }
        onCommentAuthorClick={(authorId) =>
          router.push(`/social/users/${authorId}?from=post&postId=${encodeURIComponent(post.id)}`)
        }
        onDeleteComment={(commentId) => {
          if (!requireLogin()) return;
          deleteComment.mutate(commentId, {
            onSuccess: () => showSuccess('نظر حذف شد'),
            onError: (deleteError) =>
              showError(deleteError instanceof Error ? deleteError.message : 'حذف نظر انجام نشد'),
          });
        }}
        canManageComments={canManageComments}
        isAddingComment={addComment.isPending}
        currentUserName={user?.name}
        currentUserAvatar={user?.avatar}
      />
      {isOwnPost && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pinOwnPost.isPending}
            onClick={handlePinOwnPost}
            className="text-gold border-gold/30 hover:text-ember inline-flex min-h-11 items-center gap-2 rounded-xl border bg-black/20 px-3 text-sm font-black transition-colors disabled:opacity-60"
          >
            <Icon name={visiblePost.isPinned ? 'star' : 'star-line'} size={17} />
            {visiblePost.isPinned ? 'برداشتن سنجاق' : 'سنجاق پست'}
          </button>
          <button
            type="button"
            disabled={deleteOwnPost.isPending}
            onClick={() => setDeleteModalOpen(true)}
            className="text-danger border-danger/30 inline-flex min-h-11 items-center gap-2 rounded-xl border bg-black/20 px-3 text-sm font-black transition-colors hover:text-red-400 disabled:opacity-60"
          >
            <Icon name="trash" size={17} />
            حذف پست
          </button>
        </div>
      )}
      <DeletePostConfirmModal
        isOpen={deleteModalOpen}
        isDeleting={deleteOwnPost.isPending}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => void handleDeleteOwnPost()}
      />
      <LoginRequiredModal
        isOpen={loginPromptOpen}
        currentPath={currentPath}
        onClose={() => setLoginPromptOpen(false)}
      />
      <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
    </div>
  );
}
