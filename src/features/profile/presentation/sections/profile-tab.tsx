import { useState } from 'react';
import { BaseModal, Button, Icon, type IconName, OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import { Panel } from '@/shared/ui';
import { useLogout } from '@/features/auth/application/use-auth-guard';
import { ProfileSettingsPanel } from '../components/profile-settings-panel';
import { EditProfileModal } from '../components/edit-profile-modal';
import type {
  Achievement,
  AchievementCondition,
} from '@/features/dashboard/domain/dashboard.types';
import type { IProfileRepository, MyProfile } from '../../domain/profile-repository';
import { CreatePost } from '@/features/social/presentation/sections/create-post';
import { BaseModal as PostBaseModal } from '@/shared/ui';
import { socialRepo } from '@/features/social/infrastructure/repository-factory';
import type { AchievementCard } from '@/features/social/domain/social.data';

interface ProfileTabProps {
  profile: MyProfile;
  profileRepo: IProfileRepository;
  initialEditProfileOpen?: boolean;
}

export function ProfileTab({
  profile,
  profileRepo,
  initialEditProfileOpen = false,
}: ProfileTabProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(initialEditProfileOpen);
  const [isSharePostOpen, setIsSharePostOpen] = useState(false);
  const logout = useLogout();
  const sortedAchievements = sortAchievementsByUnlocked(profile.achievements);

  const handleAchievementShare = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsSharePostOpen(true);
  };

  const handlePublishPost = async (
    text: string,
    imageFile?: File | null,
    achievement?: AchievementCard | null,
  ) => {
    try {
      await socialRepo.createPost(text, imageFile, achievement);
      showSuccess('پست با موفقیت منتشر شد!');
      setIsSharePostOpen(false);
      setSelectedAchievement(null);
    } catch (error) {
      showError('خطا در انتشار پست');
    }
  };

  return (
    <>
      <div className="flex max-w-full min-w-0 flex-col gap-6 overflow-x-clip">
        <div className="relative max-w-full min-w-0 overflow-hidden rounded-[26px] border border-[rgba(255,130,50,.18)] px-6 py-7 [background:linear-gradient(135deg,rgba(255,98,0,.15),rgba(243,186,99,.07))] sm:px-8 sm:py-9">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:flex-wrap sm:gap-7 sm:text-start">
            <span
              className="relative grid size-28 shrink-0 place-items-center rounded-full text-[46px] font-black text-[#1a0a00] [background:var(--fire-grad)] sm:size-24 sm:text-[34px]"
              style={{ background: profile.avatar }}
            >
              {profile.initial}
              <span className="absolute -end-1 -bottom-1 grid size-11 place-items-center rounded-[18px] border-2 border-[#0e0806] text-sm font-extrabold text-[#1a0a00] [background:var(--fire-grad)] sm:size-8 sm:rounded-full sm:text-xs">
                {toPersianDigits(profile.level)}
              </span>
            </span>
            <div className="w-full flex-1 sm:w-auto">
              <h2 className="text-[24px] font-black sm:text-[26px]">{profile.name}</h2>
              <p className="text-gold mt-2 text-[15px] font-extrabold sm:mt-0 sm:font-normal">
                {profile.title} · سطح {toPersianDigits(profile.level)}
              </p>
              <div className="mt-5 grid grid-cols-[repeat(2,minmax(0,1fr))] gap-3 sm:mt-4 sm:flex sm:flex-wrap">
                {profile.profileStats.map((s) => (
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

        <div className="grid min-w-0 gap-6 xl:grid-cols-2">
          {/* <Panel
            title="نقشه راه رشد فردی"
            action={<span className="text-gold text-[13px] font-bold">۸ از ۱۲</span>}
          >
            <div className="flex gap-1.5">
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-2 flex-1 rounded-full',
                    i < 8
                      ? '[background:var(--fire-grad)]'
                      : i === 8
                        ? '[background:linear-gradient(90deg,var(--color-ember),var(--color-gold))]'
                        : '[background:var(--glass-2)]',
                  )}
                />
              ))}
            </div>
            <p className="text-ink-3 mt-4 text-[13px] leading-[1.8]">
              ۸ مرحله از مسیر رشد فردی‌ات را کامل کرده‌ای. برای آزادسازی مرحله‌ی بعد، تمرین تمرکز
              عمیق را تمام کن.
            </p>
          </Panel> */}

          <Panel title="تنظیمات">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(2,minmax(0,1fr))]">
              {profile.settings.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    if (s.label === 'تنظیمات') setIsSettingsOpen(true);
                    if (s.label === 'ویرایش پروفایل') setIsEditProfileOpen(true);
                  }}
                  className="border-hair hover:border-hair-2 flex min-w-0 items-center gap-2 rounded-[14px] border px-3 py-3 text-start transition-[transform,border-color] [background:var(--glass-2)] hover:-translate-x-[3px] sm:gap-3 sm:px-3.5"
                >
                  <span className="text-gold grid size-9 shrink-0 place-items-center rounded-[10px] [background:var(--glass)]">
                    <Icon name={s.icon as IconName} size={18} />
                  </span>
                  <b className="min-w-0 flex-1 truncate text-[13px] font-bold sm:text-[13.5px]">
                    {s.label}
                  </b>
                  <Icon name="arrow-left" size={16} className="text-ink-3" />
                </button>
              ))}
            </div>
          </Panel>

          {/* <Panel title="آتش">
            <Link
              href="/profile/fire-history"
              className="border-hair hover:border-hair-2 group flex min-w-0 items-center gap-3 rounded-[18px] border p-4 text-start transition-[transform,border-color,box-shadow] [background:linear-gradient(135deg,rgba(255,98,0,.12),rgba(243,186,99,.05))] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-34px_var(--glow)]"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-[#1a0a00] shadow-[0_14px_34px_-18px_var(--glow)] [background:var(--fire-grad)]">
                <Icon name="flame" size={23} />
              </span>
              <span className="min-w-0 flex-1">
                <b className="text-ink block text-sm font-black">تاریخچه آتش</b>
                <span className="text-ink-3 mt-1 block text-xs leading-6">
                  دریافت‌ها و خرج‌کردن‌های آتش حسابت را ببین.
                </span>
              </span>
              <Icon
                name="arrow-left"
                size={17}
                className="text-gold shrink-0 transition-transform group-hover:-translate-x-1"
              />
            </Link>
          </Panel> */}
        </div>

        <Panel
          title="دستاوردها"
          // action={<a className="text-gold cursor-pointer text-[13px] font-bold">مشاهده همه</a>}
        >
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))] gap-x-4 gap-y-7 sm:grid-cols-4 sm:gap-x-5 lg:grid-cols-6 xl:grid-cols-7">
            {sortedAchievements.map((achievement) => (
              <button
                key={achievement.label}
                type="button"
                onClick={() => setSelectedAchievement(achievement)}
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
              </button>
            ))}
          </div>
        </Panel>

        <button
          type="button"
          onClick={logout}
          className="border-hair flex min-h-13 w-full items-center justify-center gap-2.5 rounded-[18px] border border-red-500/25 px-4 text-[13.5px] font-extrabold text-red-300 shadow-[0_18px_42px_-34px_rgba(255,90,90,.75)] transition-[transform,border-color,background,color] duration-300 [background:linear-gradient(135deg,rgba(255,90,90,.12),rgba(255,98,0,.04))] active:scale-[.98] lg:hidden"
          aria-label="خروج از حساب کاربری"
        >
          <span className="grid size-9 place-items-center rounded-[12px] border border-red-500/20 bg-red-500/10">
            <Icon name="logout" size={19} />
          </span>
          خروج از حساب کاربری
        </button>
      </div>

      {selectedAchievement && !isSharePostOpen && (
        <AchievementModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          onShare={() => handleAchievementShare(selectedAchievement)}
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
              title: selectedAchievement.label,
              sub: getAchievementDescription(selectedAchievement),
              icon: getAchievementIcon(selectedAchievement),
            }}
            onPublish={handlePublishPost}
            onPublished={() => setIsSharePostOpen(false)}
          />
        </BaseModal>
      )}
    </>
  );
}

function AchievementModal({
  achievement,
  onClose,
  onShare,
}: {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
}) {
  const count = getAchievementCount(achievement);
  const conditions = getAchievementConditions(achievement);
  const isEarned = achievement.unlocked && conditions.every((condition) => condition.passed);
  const canShare = achievement.isShareable ?? isEarned;

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
          {getAchievementDescription(achievement)}
        </p>

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

const ACHIEVEMENT_RULES: Record<
  string,
  {
    description: string;
    condition: string;
  }
> = {
  'atash-afrooz': {
    description: 'امروز اولین آتش را روشن کردی. از این لحظه، مسیر رشد تو آغاز شده است.',
    condition: 'انجام اولین تمرین',
  },
  setare: {
    description: 'نور تو راه را برای دیگران روشن می‌کند.',
    condition: 'قرار گرفتن در رتبه‌های برتر لیدربورد هفتگی',
  },
  'farzand-ghabile': {
    description: 'تو دیگر رهگذر نیستی؛ مسیر، خانه‌ی تو شده است.',
    condition: 'ارتقا در هر ۵ سطح',
  },
  tizbaal: {
    description: 'سرعت تو فقط در دیدن ویدیوها نیست؛ در رشد کردن است.',
    condition: 'تکمیل سه درس در مدت زمان کوتاه',
  },
  gahreman: {
    description: 'بزرگ‌ترین نبرد، نبرد با خودت بود... و تو پیروز شدی.',
    condition: 'دریافت هر ۱۰۰۰ آتش XP',
  },
  'safir-ghabile': {
    description: 'امروز فقط عضوی از قبیله نیستی؛ بخشی از آینده‌ی آن هستی.',
    condition: 'دعوت موفق از ۳ کاربر یا کمک به سایر کاربران',
  },
  'vares-ghabile': {
    description: 'هر روز حضورت، یک قدم دیگر به آینده‌ای است که می‌خواهی.',
    condition: 'هر ۳۰ روز ورود متوالی',
  },
  'seda-qabile': {
    description: 'تو باعث شدی آشیانه ققنوس پرجنب‌وجوش‌تر از همیشه باقی بماند.',
    condition: 'هر ۳۰ فعالیت اجتماعی مثل پیام، لایک، کامنت و اشتراک‌گذاری',
  },
  'ghalb-ghabile': {
    description:
      'نام تو با احترام برده می‌شود. همراهی، حمایت و انرژی تو، قبیله را گرم‌تر و متحدتر کرده است.',
    condition: 'رسیدن به ۳۰ هم‌پرواز یا ثبت ۳۰ پیام در انجمن',
  },
};

const ACHIEVEMENT_SLUG_BY_LABEL: Record<string, string> = {
  آتش‌افروز: 'atash-afrooz',
  ستاره: 'setare',
  'فرزند قبیله': 'farzand-ghabile',
  تیزبال: 'tizbaal',
  قهرمان: 'gahreman',
  'سفیر قبیله': 'safir-ghabile',
  'وارث آتش': 'vares-ghabile',
  'صدای قبیله': 'seda-qabile',
  'قلب قبیله': 'ghalb-ghabile',
};

const ACHIEVEMENT_IMAGE_BY_LABEL: Record<string, string> = {
  آتش‌افروز: '/assets/achievements/atash-afrooz.webp',
  'وارث آتش': '/assets/achievements/vares-ghabile.webp',
  قهرمان: '/assets/achievements/gahreman.webp',
  'سفیر قبیله': '/assets/achievements/safir-ghabile.webp',
  تیزبال: '/assets/achievements/tizbaal.webp',
  'فرزند قبیله': '/assets/achievements/farzand-ghabile.webp',
  ستاره: '/assets/achievements/setare.webp',
  'قلب قبیله': '/assets/achievements/ghalb-ghabile.webp',
  'صدای قبیله': '/assets/achievements/seda-qabile.webp',
};

const ACHIEVEMENT_SLUG_ALIASES: Record<string, string> = {
  atashafrooz: 'atash-afrooz',
  'atash-afrooz': 'atash-afrooz',
  'fire-starter': 'atash-afrooz',
  star: 'setare',
  setareh: 'setare',
  setare: 'setare',
  'farzand-ghabile': 'farzand-ghabile',
  'farzand-qabile': 'farzand-ghabile',
  'child-of-tribe': 'farzand-ghabile',
  tizbal: 'tizbaal',
  tizbaal: 'tizbaal',
  hero: 'gahreman',
  ghahreman: 'gahreman',
  gahreman: 'gahreman',
  'safir-ghabile': 'safir-ghabile',
  'safir-qabile': 'safir-ghabile',
  ambassador: 'safir-ghabile',
  'vares-atash': 'vares-ghabile',
  'vares-ghabile': 'vares-ghabile',
  'vares-qabile': 'vares-ghabile',
  'warese-atash': 'vares-ghabile',
  'heir-of-fire': 'vares-ghabile',
  'seda-ghabile': 'seda-qabile',
  'seda-qabile': 'seda-qabile',
  'seda-ye-ghabile': 'seda-qabile',
  'sedaye-ghabile': 'seda-qabile',
  'sedaye-qabile': 'seda-qabile',
  'voice-of-tribe': 'seda-qabile',
  'ghalb-ghabile': 'ghalb-ghabile',
  'ghalb-qabile': 'ghalb-ghabile',
  'heart-of-tribe': 'ghalb-ghabile',
};

function getAchievementCount(achievement: Achievement) {
  return achievement.count ?? 1;
}

function getAchievementImage(achievement: Achievement) {
  const slug = getAchievementSlug(achievement);
  return slug
    ? `/assets/achievements/${slug}.webp`
    : (ACHIEVEMENT_IMAGE_BY_LABEL[achievement.label] ?? '/assets/achievements/atash-afrooz.webp');
}

function getAchievementSlug(achievement: Achievement) {
  const rawSlug = achievement.slug?.trim();
  return (
    (rawSlug ? (ACHIEVEMENT_SLUG_ALIASES[rawSlug] ?? rawSlug) : undefined) ??
    ACHIEVEMENT_SLUG_BY_LABEL[achievement.label]
  );
}

function getAchievementDescription(achievement: Achievement) {
  const slug = getAchievementSlug(achievement);
  return (
    (slug ? ACHIEVEMENT_RULES[slug]?.description : undefined) ??
    'این دستاورد با تکمیل شرط مشخص‌شده برای کاربر ثبت می‌شود.'
  );
}

function getAchievementIcon(achievement: Achievement): IconName {
  return 'flame';
}

function getAchievementConditions(achievement: Achievement): AchievementCondition[] {
  if (achievement.conditions?.length) return achievement.conditions;

  const slug = getAchievementSlug(achievement);
  const rule = slug ? ACHIEVEMENT_RULES[slug] : undefined;

  return [
    {
      id: `${slug ?? achievement.label}-main-condition`,
      label: rule?.condition ?? 'تکمیل شرط تعیین‌شده برای این دستاورد',
      passed: achievement.unlocked,
    },
  ];
}

function sortAchievementsByUnlocked(achievements: Achievement[]) {
  return [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
}
