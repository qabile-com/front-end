import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { BaseModal, Button, Icon, type IconName, OptionalImage, UserAvatar } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { formatRelativeTime } from '@/core/lib/format-relative-time';
import { showError, showSuccess } from '@/shared/lib/toast';
import { Panel } from '@/shared/ui';
import { useLogout } from '@/features/auth/application/use-auth-guard';
import { ProfileSettingsPanel } from '../components/profile-settings-panel';
import { EditProfileModal } from '../components/edit-profile-modal';
import type {
  Achievement,
  AchievementCondition,
} from '@/features/dashboard/domain/dashboard.types';
import {
  DEFAULT_ACHIEVEMENT_IMAGE,
  getAchievementAssetUrl,
} from '@/features/dashboard/domain/achievement-normalizer';
import type { IProfileRepository, MyProfile } from '../../domain/profile-repository';
import { useClaimAchievement } from '../../application/use-claim-achievement';
import { useMyAchievements } from '../../application/use-my-achievements';
import { CreatePost } from '@/features/social/presentation/sections/create-post';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import type { AchievementCard } from '@/features/social/domain/social.data';
import { useActionRewardQueue } from '@/features/dashboard/application/use-action-reward-queue';
import { ActionRewardModals } from '@/features/dashboard/presentation/components/action-reward-modals';
import { formatUsername } from '@/features/social/presentation/lib/format-username';
import { useDeleteOwnPost } from '@/features/social/application/use-delete-own-post';
import { usePinOwnPost } from '@/features/social/application/use-pin-own-post';
import { DeletePostConfirmModal } from '@/features/social/presentation/components/delete-post-confirm-modal';
import { getPostPublishErrorMessage } from '@/features/social/application/social-error-message';
import { invalidateSocialPostCreation } from '@/features/social/application/social-cache';
import { useUserPosts } from '@/features/leaderboard/application/use-user-posts';
import { userProfileRepo } from '@/features/leaderboard/infrastructure/repository-factory';
import { shareUrl } from '@/shared/lib/native-share';

interface ProfileTabProps {
  profile: MyProfile;
  profileRepo: IProfileRepository;
  initialEditProfileOpen?: boolean;
}

type ProfileBottomTab = 'posts' | 'settings';

export function ProfileTab({
  profile,
  profileRepo,
  initialEditProfileOpen = false,
}: ProfileTabProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileBottomTab>('posts');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(initialEditProfileOpen);
  const [isSharePostOpen, setIsSharePostOpen] = useState(false);
  const queryClient = useQueryClient();
  const { currentReward, enqueueReward, dismissCurrentReward } = useActionRewardQueue();
  const enqueuedRewardKeysRef = useRef(new Set<string>());
  const logout = useLogout();
  const claimAchievement = useClaimAchievement(profileRepo);
  const achievementsQuery = useMyAchievements(profileRepo);
  const achievements = useMemo(
    () => mergeAchievementMetadata(profile.achievements, achievementsQuery.data),
    [profile.achievements, achievementsQuery.data],
  );
  const sortedAchievements = sortAchievementsByUnlocked(achievements);
  const summaryStats = getProfileSummaryStats(profile);

  useEffect(() => {
    if (!profile.actionReward?.unlockedAchievements?.length) return;

    const rewardKey = profile.actionReward.unlockedAchievements
      .map(
        (achievement) =>
          `${achievement.id}:${achievement.earnedAt ?? achievement.repeatIndex ?? ''}`,
      )
      .join('|');
    if (!rewardKey || enqueuedRewardKeysRef.current.has(rewardKey)) return;

    enqueuedRewardKeysRef.current.add(rewardKey);
    queueMicrotask(() => enqueueReward(profile.actionReward));
  }, [enqueueReward, profile.actionReward]);

  const handleAchievementShare = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsSharePostOpen(true);
  };

  const handleAchievementClaim = async (achievement: Achievement) => {
    if (!achievement.id) return;

    try {
      const result = await claimAchievement.mutateAsync(achievement.id);

      if (result.unlocked) {
        enqueueReward(result.reward);
        showSuccess('دستاورد برای تو ثبت شد.');
        setSelectedAchievement(null);
        return;
      }

      // Daily check-ins only unlock once the streak reaches the threshold; until then, tell
      // the user how far along they are instead of implying nothing happened.
      const streak = result.streak ?? 0;
      const threshold = result.threshold ?? 0;
      showSuccess(
        threshold > 0
          ? `امروز ثبت شد. ${toPersianDigits(streak)} از ${toPersianDigits(threshold)} روز`
          : 'امروز ثبت شد.',
      );
    } catch (error) {
      showError(error instanceof Error ? error.message : 'ثبت دستاورد انجام نشد.');
    }
  };

  const handlePublishPost = async (
    text: string,
    imageFile?: File | null,
    achievement?: AchievementCard | null,
  ) => {
    try {
      await socialRepo.createPost(text, imageFile, achievement);
      invalidateSocialPostCreation(queryClient);
      showSuccess('پست با موفقیت منتشر شد!');
      setIsSharePostOpen(false);
      setSelectedAchievement(null);
    } catch (error) {
      showError(getPostPublishErrorMessage(error));
      throw new Error('Achievement post publish failed');
    }
  };

  return (
    <>
      <div className="flex max-w-full min-w-0 flex-col gap-6 overflow-x-clip">
        <div className="relative max-w-full min-w-0 overflow-hidden rounded-[26px] border border-[rgba(255,130,50,.18)] px-6 py-7 [background:linear-gradient(135deg,rgba(255,98,0,.15),rgba(243,186,99,.07))] sm:px-8 sm:py-9">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:flex-wrap sm:gap-7 sm:text-start">
            <UserAvatar
              name={profile.name}
              avatar={profile.avatar}
              className="relative size-28 text-[46px] text-[#1a0a00] sm:size-24 sm:text-[34px]"
            >
              <span className="absolute -end-1 -bottom-1 grid size-11 place-items-center rounded-[18px] border-2 border-[#0e0806] text-sm font-extrabold text-[#1a0a00] [background:var(--fire-grad)] sm:size-8 sm:rounded-full sm:text-xs">
                {toPersianDigits(profile.level)}
              </span>
            </UserAvatar>
            <div className="w-full flex-1 sm:w-auto">
              <h2 className="text-[24px] font-black sm:text-[26px]">{profile.name}</h2>
              {formatUsername(profile.username) && (
                <p className="text-ink-3 mt-1 text-sm font-bold">
                  {formatUsername(profile.username)}
                </p>
              )}
              <p className="text-gold mt-2 text-[15px] font-extrabold sm:mt-0 sm:font-normal">
                {profile.title} · سطح {toPersianDigits(profile.level)}
              </p>
              {profile.bio?.trim() && (
                <p className="text-ink-3 mx-auto mt-3 max-w-2xl text-sm leading-7 sm:mx-0">
                  {profile.bio.trim()}
                </p>
              )}
              <button
                type="button"
                onClick={() =>
                  void shareUrl({
                    title: profile.name,
                    text: 'پروفایل من در قبیله',
                    path: `/social/users/${profile.id}`,
                  })
                }
                className="text-gold border-hair hover:border-gold/50 mx-auto mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border bg-black/25 px-3 text-xs font-black transition-colors sm:mx-0"
              >
                <Icon name="share" size={14} />
                اشتراک پروفایل
              </button>
              <div className="mt-5 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:mt-4 sm:flex sm:flex-wrap">
                {summaryStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[10px] border border-[rgba(255,98,0,.38)] bg-black px-4 py-4 text-center sm:min-w-20 sm:rounded-[7px] sm:border-[rgba(255,130,50,.20)] sm:py-3"
                  >
                    <b className="text-gradient-fire block text-[23px] leading-none font-black sm:text-xl">
                      {s.value}
                    </b>
                    <small className="text-ink-4 sm:text-ink-3 mt-3 block text-[13px] sm:mt-0 sm:text-[12px]">
                      {s.label}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Panel
          title="پروفایل"
          action={<ProfileTabSwitcher activeTab={activeTab} onChange={setActiveTab} />}
        >
          {activeTab === 'posts' ? (
            <UserPostsTab profileId={profile.id} posts={profile.posts ?? []} />
          ) : (
            <ProfileSettingsTab
              achievements={sortedAchievements}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onEditProfile={() => setIsEditProfileOpen(true)}
              onAchievementClick={setSelectedAchievement}
              onLogout={logout}
            />
          )}
        </Panel>
      </div>

      {selectedAchievement && !isSharePostOpen && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          onShare={() => handleAchievementShare(selectedAchievement)}
          onClaim={(achievement) => void handleAchievementClaim(achievement)}
          isClaiming={claimAchievement.isPending}
        />
      )}

      {isSharePostOpen && selectedAchievement && (
        <BaseModal
          isOpen
          onClose={() => setIsSharePostOpen(false)}
          title="اشتراک‌گذاری دستاورد"
          zIndexClassName="z-[1000]"
          panelClassName="w-full max-w-md"
        >
          <CreatePost
            achievement={{
              id: selectedAchievement.id,
              title: selectedAchievement.label,
              sub: getAchievementDescription(selectedAchievement),
              icon: getAchievementIcon(),
            }}
            onPublish={handlePublishPost}
            onPublished={() => setIsSharePostOpen(false)}
          />
        </BaseModal>
      )}

      {isSettingsOpen && (
        <BaseModal
          isOpen
          onClose={() => setIsSettingsOpen(false)}
          title="تنظیمات"
          zIndexClassName="z-[1000]"
          panelClassName="w-full max-w-md"
        >
          <ProfileSettingsPanel
            profile={profile}
            repo={profileRepo}
            onClose={() => setIsSettingsOpen(false)}
          />
        </BaseModal>
      )}

      {isEditProfileOpen && (
        <BaseModal
          isOpen
          onClose={() => setIsEditProfileOpen(false)}
          title="ویرایش پروفایل"
          zIndexClassName="z-[1000]"
          panelClassName="w-full max-w-md"
        >
          <EditProfileModal
            profile={profile}
            repo={profileRepo}
            onClose={() => setIsEditProfileOpen(false)}
            onReward={enqueueReward}
          />
        </BaseModal>
      )}
      <ActionRewardModals reward={currentReward} onClose={dismissCurrentReward} />
    </>
  );
}

function getProfileSummaryStats(profile: MyProfile) {
  return [
    { value: toPersianDigits(profile.stats.xp), label: 'آتش' },
    { value: toPersianDigits(profile.stats.streak), label: 'روز زنجیره' },
    { value: toPersianDigits(profile.stats.followersCount), label: 'فالوورها' },
    { value: toPersianDigits(profile.stats.followingCount), label: 'فالووینگ‌ها' },
  ];
}

function ProfileTabSwitcher({
  activeTab,
  onChange,
}: {
  activeTab: ProfileBottomTab;
  onChange: (tab: ProfileBottomTab) => void;
}) {
  const tabs: Array<{ id: ProfileBottomTab; label: string; icon: IconName }> = [
    { id: 'posts', label: 'پست‌ها', icon: 'adam-chat' },
    { id: 'settings', label: 'تنظیمات', icon: 'settings' },
  ];

  return (
    <div
      role="tablist"
      aria-label="بخش‌های پروفایل"
      className="grid grid-cols-2 gap-1 rounded-[14px] border border-[rgba(255,98,0,.16)] bg-black/24 p-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[11px] px-3 text-xs font-black transition-[background,color,box-shadow] duration-200',
            activeTab === tab.id
              ? 'text-[#1a0a00] shadow-[0_12px_26px_-18px_var(--glow)] [background:var(--fire-grad)]'
              : 'text-ink-3 hover:text-gold',
          )}
        >
          <Icon name={tab.icon} size={15} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function UserPostsTab({
  profileId,
  posts,
}: {
  profileId: string;
  posts: NonNullable<MyProfile['posts']>;
}) {
  const postsQuery = useUserPosts(userProfileRepo, profileId);
  const deleteOwnPost = useDeleteOwnPost(socialRepo);
  const pinOwnPost = usePinOwnPost(socialRepo);
  const [pinnedOverrides, setPinnedOverrides] = useState<Record<string, boolean>>({});
  const [deletedPostIds, setDeletedPostIds] = useState<Set<string>>(() => new Set());
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const remotePosts = postsQuery.data?.pages.flat();
  const sourcePosts: ProfilePostItem[] =
    remotePosts?.map((post) => ({
      id: post.id,
      text: post.text,
      likes: post.likes,
      commentsCount: post.commentsCount ?? post.comments.length,
      time: post.time,
      image: post.attachment?.url ?? post.image,
      hasImage: post.hasImage,
      isPinned: post.isPinned,
    })) ?? posts;
  const visiblePosts = useMemo<ProfilePostItem[]>(
    () =>
      sourcePosts
        .filter((post) => !deletedPostIds.has(post.id))
        .map((post) => ({
          ...post,
          isPinned: pinnedOverrides[post.id] ?? post.isPinned,
        })),
    [deletedPostIds, pinnedOverrides, sourcePosts],
  );
  const sortedPosts = sortPinnedFirst(visiblePosts);

  const handleDelete = async () => {
    if (!postToDelete) return;

    try {
      await deleteOwnPost.mutateAsync(postToDelete);
      setDeletedPostIds((current) => new Set(current).add(postToDelete));
      setPostToDelete(null);
      showSuccess('پست حذف شد.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'حذف پست انجام نشد.');
    }
  };

  const handlePinToggle = (postId: string, isPinned: boolean) => {
    const nextPinned = !isPinned;
    setPinnedOverrides((current) => {
      const next: Record<string, boolean> = nextPinned ? {} : { ...current };
      if (nextPinned) {
        visiblePosts.forEach((post) => {
          next[post.id] = false;
        });
      }
      next[postId] = nextPinned;
      return next;
    });

    pinOwnPost.mutate(
      { postId, isPinned: nextPinned },
      {
        onSuccess: (updatedPost) => {
          setPinnedOverrides((current) => {
            const next: Record<string, boolean> = updatedPost.isPinned ? {} : { ...current };
            if (updatedPost.isPinned) {
              visiblePosts.forEach((post) => {
                next[post.id] = false;
              });
            }
            next[updatedPost.id] = updatedPost.isPinned;
            return next;
          });
          showSuccess(nextPinned ? 'پست سنجاق شد.' : 'پست از حالت سنجاق خارج شد.');
        },
        onError: (error) => {
          setPinnedOverrides((current) => ({ ...current, [postId]: isPinned }));
          showError(error instanceof Error ? error.message : 'تغییر وضعیت سنجاق انجام نشد.');
        },
      },
    );
  };

  if (!visiblePosts.length) {
    return (
      <div className="rounded-[18px] border border-dashed border-[rgba(255,98,0,.24)] bg-black/20 p-6 text-center">
        <Icon name="adam-chat" size={30} className="text-ember mx-auto" />
        <p className="text-ink mt-3 font-black">هنوز پستی منتشر نکردی.</p>
        <p className="text-ink-3 mt-1 text-sm leading-7">
          وقتی در محفل پست بگذاری، آخرین پست‌هایت اینجا نمایش داده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedPosts.map((post) => (
        <article
          key={post.id}
          className={cn(
            'rounded-[18px] border bg-black/24 p-4',
            post.isPinned
              ? 'border-gold/45 shadow-[0_18px_50px_-36px_var(--glow)]'
              : 'border-[rgba(255,98,0,.14)]',
          )}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <time className="text-ink-4 text-xs font-bold" dateTime={post.time}>
                {formatRelativeTime(post.time)}
              </time>
              {post.isPinned && (
                <span className="text-gold border-gold/25 bg-gold/10 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black">
                  <Icon name="star" size={11} />
                  سنجاق شده
                </span>
              )}
            </div>
            <div className="text-ink-3 flex items-center gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-1">
                <Icon name="heart" size={14} />
                {toPersianDigits(post.likes)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="msg" size={14} />
                {toPersianDigits(post.commentsCount)}
              </span>
              <button
                type="button"
                disabled={pinOwnPost.isPending}
                onClick={() => handlePinToggle(post.id, Boolean(post.isPinned))}
                className="text-gold hover:text-ember disabled:opacity-60"
                aria-label={post.isPinned ? 'برداشتن سنجاق پست' : 'سنجاق کردن پست'}
              >
                <Icon name={post.isPinned ? 'star' : 'star-line'} size={14} />
              </button>
              <button
                type="button"
                disabled={deleteOwnPost.isPending}
                onClick={() => setPostToDelete(post.id)}
                className="text-danger hover:text-red-400 disabled:opacity-60"
                aria-label="حذف پست"
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
          <Link
            href={`/social/${post.id}?from=profile&userId=${encodeURIComponent(profileId)}`}
            className="focus-visible:ring-ember hover:text-gold block rounded-xl transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <p className="text-ink-2 text-sm leading-7">{post.text}</p>
            {(post.image || post.hasImage) && (
              <div className="border-hair relative mt-3 h-36 overflow-hidden rounded-xl border bg-[var(--glass-2)]">
                {post.image ? (
                  <OptionalImage src={post.image} alt="" className="object-cover" />
                ) : (
                  <div className="text-ink-4 grid h-full place-items-center">
                    <Icon name="book" size={28} />
                  </div>
                )}
              </div>
            )}
          </Link>
        </article>
      ))}
      <DeletePostConfirmModal
        isOpen={Boolean(postToDelete)}
        isDeleting={deleteOwnPost.isPending}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}

type ProfilePostItem = NonNullable<MyProfile['posts']>[number];

function sortPinnedFirst<T extends { isPinned?: boolean }>(posts: T[]) {
  return [...posts].sort((a, b) => Number(Boolean(b.isPinned)) - Number(Boolean(a.isPinned)));
}

function ProfileSettingsTab({
  achievements,
  onOpenSettings,
  onEditProfile,
  onAchievementClick,
  onLogout,
}: {
  achievements: Achievement[];
  onOpenSettings: () => void;
  onEditProfile: () => void;
  onAchievementClick: (achievement: Achievement) => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ProfileActionButton
          title="ویرایش پروفایل"
          description="نام، نام کاربری و اطلاعات اصلی"
          icon="edit-post"
          onClick={onEditProfile}
        />
        <ProfileActionButton
          title="تنظیمات حساب"
          description="امنیت، اعلان‌ها و تغییر رمز عبور"
          icon="settings"
          onClick={onOpenSettings}
        />
      </div>

      <div>
        <h3 className="text-ink mb-4 text-sm font-black">دستاوردها</h3>
        <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6">
          {achievements.map((achievement) => (
            <button
              key={achievement.label}
              type="button"
              onClick={() => onAchievementClick(achievement)}
              className="group flex flex-col items-center gap-2.5 text-center"
            >
              <span
                className={cn(
                  'border-hair relative block size-[72px] overflow-hidden rounded-[8px] border bg-black shadow-[0_12px_26px_-18px_var(--glow)] transition-transform duration-200 group-hover:-translate-y-0.5',
                  achievement.unlocked
                    ? 'border-[rgba(255,98,0,.72)]'
                    : 'border-[rgba(253,238,226,.28)] opacity-70 grayscale',
                )}
              >
                <OptionalImage
                  src={getAchievementImage(achievement)}
                  alt={achievement.label}
                  className="object-cover"
                  fallbackSrc={DEFAULT_ACHIEVEMENT_IMAGE}
                  loading="lazy"
                />
                {getAchievementCount(achievement) > 1 && (
                  <span className="bg-ember absolute start-1.5 top-1.5 rounded-[5px] px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_6px_14px_-8px_var(--glow)]">
                    {toPersianDigits(getAchievementCount(achievement))}x
                  </span>
                )}
              </span>
              <span
                className={cn('text-[12px]', achievement.unlocked ? 'text-ink-2' : 'text-ink-4')}
              >
                {achievement.label}
              </span>
              {(() => {
                const progress = getAchievementProgress(achievement);
                if (!progress) return null;
                return (
                  <span
                    className={cn(
                      '-mt-1 text-[11px] font-black tabular-nums',
                      achievement.unlocked ? 'text-gold' : 'text-ink-4',
                    )}
                  >
                    {toPersianDigits(progress.done)} / {toPersianDigits(progress.threshold)}
                  </span>
                );
              })()}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-13 w-full items-center justify-center gap-2.5 rounded-[18px] border border-red-500/25 px-4 text-[13.5px] font-extrabold text-red-300 shadow-[0_18px_42px_-34px_rgba(255,90,90,.75)] transition-[transform,border-color,background,color] duration-300 [background:linear-gradient(135deg,rgba(255,90,90,.12),rgba(255,98,0,.04))] active:scale-[.98]"
      >
        <span className="grid size-9 place-items-center rounded-[12px] border border-red-500/20 bg-red-500/10">
          <Icon name="logout" size={19} />
        </span>
        خروج از حساب کاربری
      </button>
    </div>
  );
}

function ProfileActionButton({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: IconName;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-hair hover:border-hair-2 flex min-w-0 items-center gap-3 rounded-[16px] border px-3.5 py-3 text-start transition-[transform,border-color] [background:var(--glass-2)] hover:-translate-y-0.5"
    >
      <span className="text-gold grid size-11 shrink-0 place-items-center rounded-[13px] [background:var(--glass)]">
        <Icon name={icon} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <b className="text-ink block truncate text-sm font-black">{title}</b>
        <span className="text-ink-3 mt-1 block truncate text-xs">{description}</span>
      </span>
      <Icon name="arrow-left" size={16} className="text-ink-3 shrink-0" />
    </button>
  );
}

function AchievementModal({
  achievement,
  onClose,
  onShare,
  onClaim,
  isClaiming = false,
}: {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
  onClaim?: (achievement: Achievement) => void;
  isClaiming?: boolean;
}) {
  const count = getAchievementCount(achievement);
  const conditions = getAchievementConditions(achievement);
  const progress = getAchievementProgress(achievement);
  const isEarned = achievement.unlocked && conditions.every((condition) => condition.passed);
  const canShare = achievement.isShareable ?? isEarned;
  // Only daily check-in achievements are claimable by the user; everything else unlocks
  // automatically from its own trigger.
  const canClaim =
    Boolean(onClaim) && achievement.triggerType === 'manual_daily_check' && !achievement.unlocked;

  const handleShare = async () => {
    if (!canShare) return;
    if (onShare) {
      onShare();
      return;
    }
    const text = `من دستاورد ${achievement.label} را در قبیله ققنوس دریافت کردم.`;

    try {
      if (navigator.share) {
        await navigator.share({ title: achievement.label, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      showSuccess('متن اشتراک‌گذاری کپی شد');
    } catch {
      showError('اشتراک‌گذاری انجام نشد');
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={achievement.label}
      zIndexClassName="z-[1000]"
      panelClassName="border-hair relative w-full max-w-[426px] overflow-hidden rounded-[10px] border bg-[#050302] px-4 py-5 shadow-[0_28px_90px_-40px_var(--glow)] sm:px-8 sm:py-7"
    >
      <button
        type="button"
        onClick={onClose}
        className="text-gold hover:text-gold-lite mb-4 flex min-h-11 items-center gap-1.5 text-[13px] font-bold transition-colors"
      >
        <Icon name="arrow-right" size={16} />
        بازگشت
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div
            className={cn(
              'relative size-[200px] overflow-hidden rounded-[5px] border border-[rgba(255,98,0,.72)] bg-black shadow-[0_26px_40px_-32px_var(--glow)]',
              !achievement.unlocked && 'grayscale',
            )}
          >
            <OptionalImage
              src={getAchievementImage(achievement)}
              alt={achievement.label}
              className="object-cover"
              fallbackSrc={DEFAULT_ACHIEVEMENT_IMAGE}
              loading="lazy"
            />
          </div>
          {count > 1 && (
            <span className="text-gold absolute inset-x-0 -bottom-6 mx-auto grid size-13 place-items-center rounded-full border-2 border-[#050302] bg-[#120904] text-lg font-black shadow-[0_0_0_1px_rgba(255,98,0,.65),0_12px_26px_-14px_var(--glow)]">
              {toPersianDigits(count)}x
            </span>
          )}
        </div>

        <h3 className={cn('text-gold mt-9 text-[24px] font-black', count <= 1 && 'mt-6')}>
          {achievement.label}
        </h3>
        <p className="text-ink-2 mt-3 text-[13px] leading-7">
          با کسب این دستاورد
          <span className="text-ember"> {toPersianDigits(achievement.xpEarned)} آتش </span>
          دریافت میکنید
          {/* {getAchievementDescription(achievement)} */}
        </p>

        {progress && (
          <div className="mt-5 w-full">
            <div className="mb-2 flex items-baseline justify-between gap-3 text-[12px] font-black">
              <span className="text-ink-3">پیشرفت تو</span>
              <span className="text-gold tabular-nums">
                {toPersianDigits(progress.done)} از {toPersianDigits(progress.threshold)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,.08)]">
              <div
                className="h-full rounded-full transition-[width] duration-500 [background:var(--fire-grad)]"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-[13px] sm:justify-between">
          <span className="text-ink-3 font-bold">شرایط دریافت:</span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {conditions.map((condition) => (
              <span
                key={condition.id}
                className={cn(
                  'inline-flex items-center gap-2 leading-7 font-bold',
                  condition.passed ? 'text-gold' : 'text-ink-4 grayscale',
                )}
              >
                <Icon name="check-inner-empty" size={24} className="shrink-0" />
                <span>{condition.label}</span>
              </span>
            ))}
          </div>
        </div>

        {canClaim && (
          <Button
            type="button"
            variant="primary"
            size="md"
            block
            disabled={isClaiming}
            onClick={() => onClaim?.(achievement)}
            className="mt-5 h-11 rounded-[7px] text-[13px]"
          >
            <Icon name="check" size={17} />
            {isClaiming ? 'در حال ثبت...' : 'انجام دادم'}
          </Button>
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          block
          disabled={!canShare}
          onClick={handleShare}
          className="mt-4 h-11 rounded-[7px] text-[13px]"
        >
          <Icon name="share" size={17} />
          اشتراک گذاری
        </Button>

        <p className="text-ink-3 mt-5 text-[10.5px]">قبیله به تو افتخار می‌کند، ادامه بده.</p>
      </div>
    </BaseModal>
  );
}

function getAchievementCount(achievement: Achievement) {
  return achievement.count ?? 1;
}

/**
 * The profile payload drives the grid, but its achievement objects omit `triggerType` and
 * `threshold`. Those come from the dedicated achievements endpoint, matched by id (falling back
 * to slug), so the claim button can tell daily check-ins apart from auto-unlocked achievements.
 */
function mergeAchievementMetadata(
  achievements: Achievement[],
  detailed?: Achievement[],
): Achievement[] {
  if (!detailed?.length) return achievements;

  const byId = new Map<string, Achievement>();
  for (const item of detailed) {
    if (item.id) byId.set(item.id, item);
    if (item.slug) byId.set(item.slug, item);
  }

  return achievements.map((achievement) => {
    const match =
      (achievement.id ? byId.get(achievement.id) : undefined) ??
      (achievement.slug ? byId.get(achievement.slug) : undefined);
    if (!match) return achievement;

    return {
      ...achievement,
      triggerType: achievement.triggerType ?? match.triggerType,
      threshold: achievement.threshold ?? match.threshold,
      isRepeatable: achievement.isRepeatable ?? match.isRepeatable,
    };
  });
}

/**
 * Progress toward a multi-step achievement, e.g. 12 of 40 cold showers.
 * Returns null when there's nothing meaningful to show (no threshold, or a single-step
 * achievement where "۱ از ۱" would just be noise).
 */
function getAchievementProgress(achievement: Achievement) {
  const threshold = achievement.threshold ?? 0;
  if (threshold <= 1) return null;

  const done = Math.min(getAchievementCount(achievement), threshold);
  return { done, threshold, percent: Math.round((done / threshold) * 100) };
}

function getAchievementImage(achievement: Achievement) {
  return getAchievementAssetUrl(achievement);
}

function getAchievementSlug(achievement: Achievement) {
  return achievement.slug?.trim();
}

function getAchievementDescription(achievement: Achievement) {
  return achievement.description ?? 'این دستاورد با تکمیل شرط مشخص‌شده برای کاربر ثبت می‌شود.';
}

function getAchievementIcon(): IconName {
  return 'flame';
}

function getAchievementConditions(achievement: Achievement): AchievementCondition[] {
  if (achievement.conditions?.length) return achievement.conditions;

  const slug = getAchievementSlug(achievement);

  return [
    {
      id: `${slug ?? achievement.label}-main-condition`,
      label: achievement.description ?? 'تکمیل شرط تعیین‌شده برای این دستاورد',
      passed: achievement.unlocked,
    },
  ];
}

function sortAchievementsByUnlocked(achievements: Achievement[]) {
  return [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
}
