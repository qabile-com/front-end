'use client';

import { useParams, useRouter } from 'next/navigation';
import { adminRepo, socialRepo } from '@/features/social/infrastructure/repository-factory';
import {
  useAddPostComment,
  useSocialPost,
  useSocialPostComments,
} from '@/features/social/application/use-social-post';
import { useLikePost } from '@/features/social/application/use-like-post';
import { useAdminDeleteComment } from '@/features/social/application/useAdminPinPost';
import { SocialPostDetail } from '@/features/social/presentation/components/social-post-detail';
import { getStoredAuthSession } from '@/core/auth/token';
import { useUser } from '@/features/dashboard/application/use-user';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { ErrorState, Icon, PostDetailSkeleton } from '@/shared/ui';
import { showError, showSuccess } from '@/shared/lib/toast';
import { shareUrl } from '@/shared/lib/native-share';
import { getApiErrorView } from '@/core/api/api-error-view';
import { createAuthRedirectHref } from '@/core/auth/redirect';

export function SocialPostPage() {
  const params = useParams<{ postId: string }>();
  const router = useRouter();
  const postId = params.postId;
  const currentPath = `/social/${postId}`;

  const { data: post, isLoading, error, refetch } = useSocialPost(socialRepo, postId);
  const comments = useSocialPostComments(socialRepo, postId);
  const addComment = useAddPostComment(socialRepo);
  const deleteComment = useAdminDeleteComment(adminRepo);
  const { like, unlike } = useLikePost(socialRepo);
  const { user } = useUser(userRepo);
  const role = getStoredAuthSession()?.user?.role;
  const canManageComments = role === 'admin' || role === 'super_admin';

  const handleShare = async () => {
    const title = post?.author ? `پست ${post.author}` : 'پست قبیله';
    const text = post?.text ? post.text.slice(0, 120) : 'این پست قبیله را ببین.';

    try {
      await shareUrl({ title, text, path: currentPath });
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
        post={{
          ...post,
          comments: comments.data ?? post.comments,
          commentsCount: comments.data?.length ?? post.commentsCount,
        }}
        onAddComment={(currentPostId, text) => addComment.mutate({ postId: currentPostId, text })}
        onShare={() => void handleShare()}
        onLike={() => like(post.id)}
        onUnlike={() => unlike(post.id)}
        onAuthorClick={(authorId) => router.push(`/social/users/${authorId}`)}
        onDeleteComment={(commentId) => {
          if (!window.confirm('این نظر حذف شود؟')) return;
          deleteComment.mutate(commentId, {
            onSuccess: () => showSuccess('نظر حذف شد'),
            onError: (deleteError) =>
              showError(deleteError instanceof Error ? deleteError.message : 'حذف نظر انجام نشد'),
          });
        }}
        canManageComments={canManageComments}
        isAddingComment={addComment.isPending}
        currentUserName={user?.name}
      />
    </div>
  );
}
