'use client';

import { useRef, useState } from 'react';
import { BaseModal, Button, Icon, OptionalImage } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { showError, showSuccess } from '@/shared/lib/toast';
import type { IProfileRepository, MyProfile } from '../../domain/profile-repository';
import {
  useDeleteMyAccount,
  useUpdateMyProfile,
  useUpdateProfileAvatar,
} from '../../application/use-edit-profile';
import { removeAccessToken } from '@/core/auth/token';
import { useRouter } from 'next/navigation';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';
import { getApiErrorMessage } from '@/core/api/api-error-message';

interface EditProfileModalProps {
  profile: MyProfile;
  repo: IProfileRepository;
  onClose: () => void;
  onReward?: (reward?: ActionRewardResult | null) => void;
}

export function EditProfileModal({ profile, repo, onClose, onReward }: EditProfileModalProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(profile.firstName || profile.name);
  const [lastName, setLastName] = useState(profile.lastName);
  const [username, setUsername] = useState(profile.username ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateMyProfile(repo, onReward);
  const updateAvatar = useUpdateProfileAvatar(repo, onReward);
  const deleteAccount = useDeleteMyAccount(repo);

  const isBusy = updateProfile.isPending || updateAvatar.isPending || deleteAccount.isPending;

  const handleSave = async () => {
    if (!firstName.trim()) {
      showError('نام را وارد کنید');
      return;
    }

    try {
      const nextFirstName = firstName.trim();
      const nextLastName = lastName.trim();

      await updateProfile.mutateAsync({
        firstName: nextFirstName,
        lastName: nextLastName,
        displayName: [nextFirstName, nextLastName].filter(Boolean).join(' '),
        username: username.trim() || null,
      });
      showSuccess('پروفایل ذخیره شد');
      onClose();
    } catch (error) {
      showError(getApiErrorMessage(error, 'ذخیره پروفایل انجام نشد'));
    }
  };

  const handleAvatarChange = async (file?: File) => {
    if (!file) return;
    try {
      await updateAvatar.mutateAsync(file);
      showSuccess('عکس پروفایل تغییر کرد');
    } catch (error) {
      showError(getApiErrorMessage(error, 'تغییر عکس انجام نشد'));
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('آیا از حذف حساب کاربری مطمئن هستید؟');
    if (!confirmed) return;

    try {
      await deleteAccount.mutateAsync();
      showSuccess('درخواست حذف حساب ثبت شد');
      removeAccessToken();
      router.replace('/');
      onClose();
    } catch (error) {
      showError(getApiErrorMessage(error, 'حذف حساب انجام نشد'));
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="ویرایش پروفایل"
      zIndexClassName="z-[1000]"
      className="overflow-hidden p-3 sm:p-5"
      panelClassName="border-hair flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[606px] flex-col overflow-hidden rounded-[10px] border bg-[#080402] shadow-[0_34px_100px_-42px_var(--glow)] sm:max-h-[calc(100dvh-2.5rem)]"
    >
        <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-5 pb-4 sm:px-7 sm:pt-7">
          <button
            type="button"
            onClick={onClose}
            className="text-gold hover:text-gold-lite flex min-h-11 items-center gap-1.5 text-[13px] font-bold transition-colors"
          >
            <Icon name="arrow-right" size={16} />
            بازگشت
          </button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isBusy}
            onClick={handleSave}
            className="min-w-24 rounded-[7px]"
          >
            <Icon name="flame" size={14} />
            ذخیره
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-7 sm:pb-7">
          <div className="border-hair rounded-[18px] px-5 py-5 text-center [background:linear-gradient(135deg,rgba(255,98,0,.16),rgba(243,186,99,.06))]">
            <ProfileAvatar profile={profile} />
            <h3 className="mt-3 text-[15px] font-black">{profile.name}</h3>
            <p className="text-gold mt-1 text-[11px] font-bold">
              {profile.title} · سطح {profile.level}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => void handleAvatarChange(event.target.files?.[0])}
            />
            {/* <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isBusy}
              onClick={() => fileRef.current?.click()}
              className="mx-auto mt-4 h-9 w-full max-w-[294px] rounded-[7px]"
            >
              <Icon name="paperclip" size={15} />
              تغییر عکس
            </Button> */}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <EditSection title="اطلاعات شخصی">
              <EditField
                label="نام"
                value={firstName}
                onChange={setFirstName}
                icon="user"
                placeholder="آرش"
                disabled={isBusy}
              />
              <EditField
                label="نام خانوادگی"
                value={lastName}
                onChange={setLastName}
                icon="user"
                placeholder="کریمی"
                disabled={isBusy}
              />
              <EditField
                label="نام کاربری"
                value={username}
                onChange={setUsername}
                icon="user-f"
                placeholder="Sample"
                disabled={isBusy}
                ltr
              />
            </EditSection>

            <EditSection title="اطلاعات تماس">
              <div className="text-ink-2 rounded-[6px] bg-[rgba(253,238,226,.18)] px-3 py-3 text-right text-[11px] leading-6">
                ایمیل فعلا قابل تغییر نیست و فقط برای ورود و دریافت کد تایید استفاده می‌شود.
              </div>
              <EditField
                label="ایمیل"
                value={profile.email ?? 'ایمیلی ثبت نشده است'}
                onChange={() => undefined}
                icon="mail"
                placeholder="email@example.com"
                disabled
                badge={profile.isEmailVerified ? 'تایید شده' : 'تایید نشده'}
                ltr
              />
            </EditSection>
          </div>

          <EditSection title="منطقه خطر" className="mt-4">
            <button
              type="button"
              disabled={isBusy}
              onClick={handleDeleteAccount}
              className="mx-auto flex h-9 w-full max-w-[294px] items-center justify-center gap-2 rounded-[7px] border border-red-600 bg-black text-[12px] font-black text-red-500 transition-colors hover:bg-red-600/10 disabled:opacity-50"
            >
              <Icon name="flame" size={15} />
              حذف حساب کاربری
            </button>
          </EditSection>
        </div>
    </BaseModal>
  );
}

function ProfileAvatar({ profile }: { profile: MyProfile }) {
  const hasImage = profile.avatar && !profile.avatar.startsWith('linear-gradient');

  return (
    <span
      className="relative mx-auto grid size-20 place-items-center overflow-hidden rounded-full border-2 border-[rgba(255,130,50,.35)] text-[26px] font-black text-black"
      style={{ background: profile.avatar }}
    >
      {hasImage ? (
        <OptionalImage src={profile.avatar} alt={profile.name} className="object-cover" />
      ) : (
        profile.initial
      )}
    </span>
  );
}

function EditSection({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        'border-hair rounded-[18px] p-4 [background:linear-gradient(135deg,rgba(255,98,0,.12),rgba(243,186,99,.04))]',
        className,
      )}
    >
      <h4 className="text-center text-[12px] font-black">{title}</h4>
      <div className="border-hair mt-3 border-t pt-3">
        <div className="grid gap-3">{children}</div>
      </div>
    </section>
  );
}

function EditField({
  label,
  value,
  onChange,
  icon,
  placeholder,
  disabled,
  badge,
  action,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: 'user' | 'user-f' | 'mail';
  placeholder: string;
  disabled?: boolean;
  badge?: string;
  action?: React.ReactNode;
  ltr?: boolean;
}) {
  return (
    <label className="block text-right">
      <span className="mb-1.5 block text-[11px] font-bold">{label}</span>
      <span className="flex min-h-11 min-w-0 flex-wrap items-center gap-2 rounded-[8px] border border-[rgba(255,98,0,.14)] bg-[rgba(255,98,0,.1)] px-2.5 py-2">
        <Icon name={icon} size={17} className="text-ember shrink-0" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          dir={ltr ? 'ltr' : 'rtl'}
          className="placeholder:text-ink-4 min-w-[120px] flex-1 truncate bg-transparent text-right text-base outline-none disabled:opacity-60"
        />
        {badge && (
          <span className="shrink-0 rounded-[6px] bg-[#2bd4a8] px-2.5 py-1 text-[10.5px] font-black whitespace-nowrap text-black">
            {badge}
          </span>
        )}
        {action}
      </span>
    </label>
  );
}
