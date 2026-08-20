'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { BaseModal, Icon, type IconName } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { toPersianDigits } from '@/core/lib/persian';
import { showError, showSuccess } from '@/shared/lib/toast';
import type {
  IProfileRepository,
  MyProfile,
  ProfileSettingField,
} from '../../domain/profile-repository';
import {
  useConfirmPasswordChange,
  useRequestPasswordChangeCode,
  useUpdateProfileSetting,
  useVerifyPasswordChangeCode,
} from '../../application/use-profile-settings';
import { getApiErrorMessage } from '@/core/api/api-error-message';
import { useNotificationRegistration } from '@/features/notifications/application/use-notification-registration';
import {
  useMyPushTokenDevice,
  useUpdatePushTokenMode,
} from '@/features/notifications/application/use-push-notification-mode';
import type { PushNotificationMode } from '@/core/api/users.api';
import { RebirthPanel } from './rebirth-panel';

type SettingsScreen = 'settings' | 'password-email' | 'password-code' | 'password-new' | 'rebirth';

interface ProfileSettingsPanelProps {
  profile: MyProfile;
  repo: IProfileRepository;
  onClose: () => void;
}

const SETTING_ROWS: {
  field: ProfileSettingField;
  title: string;
  description: string;
  icon: IconName;
}[] = [
  {
    field: 'dailyReminder',
    title: 'اعلان روز و شب',
    description: 'با هر ورود از دستگاه جدید هشدار دریافت کنید',
    icon: 'bell',
  },
  {
    field: 'autoLogout',
    title: 'خروج خودکار',
    description: 'بعد از بی‌وقفه عدم فعالیت به صورت خودکار از حساب کاربری خارج شوید',
    icon: 'logout',
  },
  {
    field: 'weeklySummary',
    title: 'دریافت خبرنامه',
    description: 'هر هفته آخرین اخبار را دریافت کنید',
    icon: 'book',
  },
];

export function ProfileSettingsPanel({ profile, repo, onClose }: ProfileSettingsPanelProps) {
  const [screen, setScreen] = useState<SettingsScreen>('settings');
  const [passwordEmail, setPasswordEmail] = useState(profile.email ?? '');
  const [passwordCode, setPasswordCode] = useState('');
  const [passwordVerificationToken, setPasswordVerificationToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordCodeErrorFocusSignal, setPasswordCodeErrorFocusSignal] = useState(0);
  const lastSubmittedPasswordCode = useRef('');
  const autoSubmittedPasswordCode = useRef('');

  const updateSetting = useUpdateProfileSetting(repo);
  const requestPasswordCode = useRequestPasswordChangeCode(repo);
  const verifyPasswordCode = useVerifyPasswordChangeCode(repo);
  const confirmPassword = useConfirmPasswordChange(repo);

  const isBusy =
    updateSetting.isPending ||
    requestPasswordCode.isPending ||
    verifyPasswordCode.isPending ||
    confirmPassword.isPending;

  const closeOrBack = () => {
    if (screen === 'settings') {
      onClose();
      return;
    }
    setScreen('settings');
  };

  const handleToggle = async (field: ProfileSettingField, value: boolean) => {
    try {
      await updateSetting.mutateAsync({ field, value });
      showSuccess('تنظیمات ذخیره شد');
    } catch (error) {
      showError(getApiErrorMessage(error, 'ذخیره تنظیمات انجام نشد'));
    }
  };

  const handleRequestPasswordCode = async () => {
    if (!passwordEmail.trim()) {
      showError('ایمیل شما در پروفایل ثبت نشده است');
      return;
    }
    try {
      await requestPasswordCode.mutateAsync({ email: passwordEmail.trim() });
      setScreen('password-code');
    } catch (error) {
      showError(getApiErrorMessage(error, 'ارسال رمز یکبار مصرف انجام نشد'));
    }
  };

  const handleVerifyPasswordCode = useCallback(async () => {
    const code = normalizeDigits(passwordCode);
    if (code.length < 6) {
      showError('رمز یکبار مصرف را کامل وارد کنید');
      return;
    }
    if (lastSubmittedPasswordCode.current === code) return;

    lastSubmittedPasswordCode.current = code;
    try {
      const result = await verifyPasswordCode.mutateAsync({
        email: passwordEmail.trim(),
        code,
      });
      setPasswordVerificationToken(result.verificationToken);
      setScreen('password-new');
    } catch (error) {
      lastSubmittedPasswordCode.current = '';
      setPasswordCodeErrorFocusSignal((current) => current + 1);
      showError(getApiErrorMessage(error, 'رمز وارد شده درست نیست'));
    }
  }, [passwordCode, passwordEmail, verifyPasswordCode]);

  const handleConfirmPassword = async () => {
    if (password.length < 6) {
      showError('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (password !== passwordConfirmation) {
      showError('تکرار رمز عبور با رمز جدید یکی نیست');
      return;
    }
    try {
      await confirmPassword.mutateAsync({
        password,
        passwordConfirmation,
        verificationToken: passwordVerificationToken,
      });
      showSuccess('رمز عبور تغییر کرد');
      onClose();
    } catch (error) {
      showError(getApiErrorMessage(error, 'تغییر رمز عبور انجام نشد'));
    }
  };

  useEffect(() => {
    const code = normalizeDigits(passwordCode);
    if (screen !== 'password-code' || isBusy || code.length !== 6) return;
    if (autoSubmittedPasswordCode.current === code) return;

    autoSubmittedPasswordCode.current = code;
    void handleVerifyPasswordCode();
  }, [passwordCode, screen, isBusy, handleVerifyPasswordCode]);

  useEffect(() => {
    if (normalizeDigits(passwordCode).length < 6) {
      autoSubmittedPasswordCode.current = '';
    }
  }, [passwordCode]);

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title="تنظیمات"
      zIndexClassName="z-[1000]"
      className="p-3 sm:p-5"
      panelClassName="border-hair w-full max-w-[720px] overflow-hidden rounded-[10px] border bg-[#080402] p-3 shadow-[0_34px_100px_-42px_var(--glow)] sm:p-7"
    >
        <PanelHeader
          onBack={closeOrBack}
          onSave={onClose}
          showSave={screen === 'settings'}
          isSaving={isBusy}
        />

        {screen === 'settings' && (
          <SettingsMain
            profile={profile}
            isBusy={isBusy}
            onToggle={handleToggle}
            onPassword={() => setScreen('password-email')}
            onRebirth={() => setScreen('rebirth')}
          />
        )}

        {screen === 'rebirth' && <RebirthPanel repo={repo} />}

        {screen === 'password-email' && (
          <SingleInputStep
            title="تغییر رمز عبور"
            description="کد تایید به ایمیل حساب شما ارسال می‌شود"
            value={passwordEmail}
            onChange={setPasswordEmail}
            icon="mail"
            inputMode="email"
            disabled={isBusy}
            action="ادامه"
            onSubmit={handleRequestPasswordCode}
          />
        )}

        {screen === 'password-code' && (
          <OtpStep
            title="تغییر رمز عبور"
            description="رمز یکبار مصرف ارسال شده را وارد کنید"
            code={passwordCode}
            setCode={setPasswordCode}
            disabled={isBusy}
            errorFocusSignal={passwordCodeErrorFocusSignal}
            onSubmit={handleVerifyPasswordCode}
          />
        )}

        {screen === 'password-new' && (
          <PasswordStep
            password={password}
            passwordConfirmation={passwordConfirmation}
            setPassword={setPassword}
            setPasswordConfirmation={setPasswordConfirmation}
            disabled={isBusy}
            onSubmit={handleConfirmPassword}
          />
        )}
    </BaseModal>
  );
}

function PanelHeader({
  onBack,
  onSave,
  showSave,
  isSaving,
}: {
  onBack: () => void;
  onSave: () => void;
  showSave: boolean;
  isSaving: boolean;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onBack}
        className="text-gold hover:text-gold-lite flex min-h-11 items-center gap-1.5 text-[13px] font-bold transition-colors"
      >
        <Icon name="arrow-right" size={16} />
        بازگشت
      </button>
      {showSave && (
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="from-ember to-gold inline-flex h-9 min-w-21 items-center justify-center gap-2 rounded-[7px] bg-gradient-to-l px-5 text-[12px] font-black text-black shadow-[0_12px_26px_-18px_var(--glow)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon name="check" size={14} />
          ذخیره
        </button>
      )}
    </div>
  );
}

function SettingsMain({
  profile,
  isBusy,
  onToggle,
  onPassword,
  onRebirth,
}: {
  profile: MyProfile;
  isBusy: boolean;
  onToggle: (field: ProfileSettingField, value: boolean) => void;
  onPassword: () => void;
  onRebirth: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[620px]">
      <h3 className="mb-4 text-right text-[15px] font-black">امنیت و حریم خصوصی</h3>
      <div className="rounded-[16px] border border-[rgba(255,98,0,.16)] bg-[rgba(255,98,0,.035)] p-2 sm:p-3">
        {/* <div className="grid gap-2">
          {SETTING_ROWS.map((setting) => (
            <SettingToggleRow
              key={setting.field}
              setting={setting}
              checked={profile.securitySettings[setting.field]}
              disabled={isBusy}
              onChange={(checked) => onToggle(setting.field, checked)}
            />
          ))}
        </div> */}

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <ActionRow title="تغییر رمز عبور" icon="lock" onClick={onPassword} />
          <InfoRow title="ایمیل حساب" value={profile.email ?? 'ایمیلی ثبت نشده است'} icon="mail" />
        </div>
      </div>

      <h3 className="mt-6 mb-4 text-right text-[15px] font-black">اعلان‌ها</h3>
      <div className="rounded-[16px] border border-[rgba(255,98,0,.16)] bg-[rgba(255,98,0,.035)] p-2 sm:p-3">
        <NotificationsSection />
      </div>

      <h3 className="mt-6 mb-4 text-right text-[15px] font-black">تولد دوباره</h3>
      <button
        type="button"
        onClick={onRebirth}
        className="flex min-h-15 w-full items-center gap-3 rounded-[16px] border border-[rgba(255,98,0,.18)] bg-[rgba(255,98,0,.035)] px-3.5 py-3 text-right transition-colors hover:border-[rgba(255,98,0,.3)]"
      >
        <span className="text-gold grid size-10 shrink-0 place-items-center rounded-[12px] border border-[rgba(243,186,99,.24)] bg-black/25">
          <Icon name="flame" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <b className="text-ink block text-[13px] font-black">تولد دوباره و دریافت تیک تأیید هویت</b>
          <span className="text-ink-3 mt-1 block text-[11px] leading-5">
            {profile.verified
              ? `سطح تولد دوباره فعلی: ${toPersianDigits(profile.rebirthCount ?? 0)}`
              : 'با فدا کردن پیشرفتت، هویت خود را برای همیشه تأیید کن'}
          </span>
        </span>
        <Icon name="arrow-left" size={16} className="text-ink-3 shrink-0" />
      </button>
    </div>
  );
}

const NOTIFICATION_MODE_OPTIONS: { mode: PushNotificationMode; label: string; description: string }[] = [
  { mode: 'all', label: 'همه', description: 'دریافت تمام اعلان‌ها' },
  { mode: 'medium', label: 'متوسط', description: 'دریافت اعلان‌های مهم‌تر' },
  { mode: 'weak', label: 'کم', description: 'فقط اعلان‌های ضروری' },
];

function NotificationsSection() {
  const notifications = useNotificationRegistration();
  const isEnabled = notifications.isSupported && notifications.permission === 'granted';
  const deviceQuery = useMyPushTokenDevice({ enabled: isEnabled });
  const updateMode = useUpdatePushTokenMode();
  const device = deviceQuery.data;

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await notifications.register();
    } else {
      await notifications.unregister();
    }
  };

  const handleModeChange = (mode: PushNotificationMode) => {
    if (!device || device.notificationMode === mode) return;
    updateMode.mutate({ tokenId: device.id, mode });
  };

  if (!notifications.isSupported) {
    return (
      <p className="text-ink-3 px-1 py-2 text-[11.5px] leading-6">
        {notifications.availability === 'requires-install'
          ? 'برای فعال‌سازی اعلان‌ها، ابتدا قبیله را روی صفحه اصلی گوشی نصب کن.'
          : 'اعلان‌ها روی این مرورگر یا دستگاه پشتیبانی نمی‌شود.'}
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      <div className="grid min-h-13 w-full min-w-0 grid-cols-[32px_minmax(0,1fr)] items-start gap-x-2 gap-y-2 rounded-[9px] border border-[rgba(255,98,0,.12)] bg-[rgba(255,98,0,.08)] px-2.5 py-2.5 sm:grid-cols-[36px_minmax(0,1fr)_44px] sm:items-center sm:gap-3 sm:px-3 sm:py-2">
        <span className="text-gold grid size-8 shrink-0 place-items-center rounded-[8px] bg-[rgba(243,186,99,.08)] sm:size-9">
          <Icon name="bell" size={17} />
        </span>
        <div className="min-w-0 flex-1 text-right">
          <b className="block text-[12.5px] font-black">اعلان‌های فوری</b>
          <span className="text-ink-3 mt-1 block text-[10.5px] leading-5 sm:truncate">
            یادآوری کورس‌ها، پاداش‌ها و خبرهای مهم قبیله
          </span>
        </div>
        <div className="col-span-2 flex justify-end sm:col-span-1 sm:block">
          <Toggle checked={isEnabled} disabled={notifications.isRegistering} onChange={handleToggle} />
        </div>
      </div>

      {isEnabled && device && (
        <div className="rounded-[9px] border border-[rgba(255,98,0,.12)] bg-[rgba(255,98,0,.08)] px-2.5 py-2.5 sm:px-3">
          <b className="block text-right text-[12px] font-black">میزان دریافت اعلان</b>
          <div className="mt-2.5 grid grid-cols-3 gap-1.5">
            {NOTIFICATION_MODE_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                disabled={updateMode.isPending}
                onClick={() => handleModeChange(option.mode)}
                className={cn(
                  'rounded-[7px] border px-1.5 py-2 text-center text-[11px] font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                  device.notificationMode === option.mode
                    ? 'border-ember text-[#1a0a00] [background:var(--fire-grad)]'
                    : 'border-hair text-ink-2 hover:border-hair-2',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-ink-3 mt-2 text-right text-[10.5px] leading-5">
            {NOTIFICATION_MODE_OPTIONS.find((option) => option.mode === device.notificationMode)
              ?.description ?? ''}
          </p>
        </div>
      )}
    </div>
  );
}

function SettingToggleRow({
  setting,
  checked,
  disabled,
  onChange,
}: {
  setting: (typeof SETTING_ROWS)[number];
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="grid min-h-13 w-full min-w-0 grid-cols-[32px_minmax(0,1fr)] items-start gap-x-2 gap-y-2 rounded-[9px] border border-[rgba(255,98,0,.12)] bg-[rgba(255,98,0,.08)] px-2.5 py-2.5 sm:grid-cols-[36px_minmax(0,1fr)_44px] sm:items-center sm:gap-3 sm:px-3 sm:py-2">
      <span className="text-gold grid size-8 shrink-0 place-items-center rounded-[8px] bg-[rgba(243,186,99,.08)] sm:size-9">
        <Icon name={setting.icon} size={17} />
      </span>
      <div className="min-w-0 flex-1 text-right">
        <b className="block text-[12.5px] font-black">{setting.title}</b>
        <span className="text-ink-3 mt-1 block text-[10.5px] leading-5 sm:truncate">
          {setting.description}
        </span>
      </div>
      <div className="col-span-2 flex justify-end sm:col-span-1 sm:block">
        <Toggle checked={checked} disabled={disabled} onChange={onChange} />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-11 shrink-0 justify-self-end rounded-[8px] border transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        checked
          ? 'border-ember bg-[linear-gradient(90deg,var(--color-ember),var(--color-gold))]'
          : 'border-hair bg-black/70',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-5 rounded-[5px] bg-white shadow-[0_6px_12px_-8px_black] transition-[left,right]',
          checked ? 'right-1' : 'left-1',
        )}
      />
    </button>
  );
}

function ActionRow({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: IconName;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-hair hover:border-hair-2 flex min-h-13 items-center gap-3 rounded-[9px] border bg-[rgba(255,98,0,.08)] px-3 py-2 text-right transition-colors"
    >
      <span className="text-gold grid size-8 shrink-0 place-items-center rounded-[8px] bg-[rgba(243,186,99,.08)]">
        <Icon name={icon} size={16} />
      </span>
      <b className="flex-1 text-[12px] font-black">{title}</b>
      <Icon name="arrow-left" size={15} className="text-gold shrink-0" />
    </button>
  );
}

function InfoRow({ title, value, icon }: { title: string; value: string; icon: IconName }) {
  return (
    <div className="border-hair flex min-h-13 items-center gap-3 rounded-[9px] border bg-[rgba(255,98,0,.08)] px-3 py-2 text-right">
      <span className="text-gold grid size-8 shrink-0 place-items-center rounded-[8px] bg-[rgba(243,186,99,.08)]">
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <b className="block text-[12px] font-black">{title}</b>
        <span className="text-ink-3 mt-1 block truncate text-left text-[11px]" dir="ltr">
          {value}
        </span>
      </div>
    </div>
  );
}

function SingleInputStep({
  title,
  description,
  helper,
  value,
  onChange,
  icon,
  inputMode,
  disabled,
  action,
  onSubmit,
}: {
  title: string;
  description: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  icon: IconName;
  inputMode: 'text' | 'email';
  disabled: boolean;
  action: string;
  onSubmit: () => void;
}) {
  return (
    <StepShell title={title} description={description}>
      <StepForm onSubmit={onSubmit}>
        <FieldFrame>
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            inputMode={inputMode}
            disabled={disabled}
            className="placeholder:text-ink-4 h-full min-w-0 flex-1 bg-transparent px-3 text-right text-base outline-none disabled:opacity-60"
            placeholder="name@email.com"
          />
          <Icon name={icon} size={18} className="text-gold shrink-0" />
        </FieldFrame>
        {helper && <p className="text-ink mt-4 text-center text-[13px] font-bold">{helper}</p>}
        <PrimaryAction type="submit" disabled={disabled}>
          {action}
        </PrimaryAction>
      </StepForm>
    </StepShell>
  );
}

function OtpStep({
  title,
  description,
  code,
  setCode,
  disabled,
  errorFocusSignal,
  onSubmit,
}: {
  title: string;
  description: string;
  code: string;
  setCode: (value: string) => void;
  disabled: boolean;
  errorFocusSignal: number;
  onSubmit: () => void;
}) {
  return (
    <StepShell title={title} description={description}>
      <StepForm onSubmit={onSubmit}>
        <SixDigitOtpInput
          value={code}
          onChange={setCode}
          disabled={disabled}
          errorFocusSignal={errorFocusSignal}
        />
        <PrimaryAction type="submit" disabled={disabled || normalizeDigits(code).length < 6}>
      
        ادامه
        </PrimaryAction>
      </StepForm>
    </StepShell>
  );
}

function SixDigitOtpInput({
  value,
  onChange,
  disabled,
  errorFocusSignal,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  errorFocusSignal: number;
}) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const valueRef = useRef(value);
  const digits = Array.from({ length: 6 }, (_, index) => normalizeDigits(value)[index] ?? '');

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (disabled) return;
    const codeLength = normalizeDigits(valueRef.current).length;
    const index = codeLength ? Math.min(codeLength - 1, 5) : 0;
    inputRefs.current[index]?.focus();
  }, [disabled]);

  useEffect(() => {
    if (disabled || errorFocusSignal === 0) return;
    const codeLength = normalizeDigits(value).length;
    inputRefs.current[Math.min(Math.max(codeLength - 1, 0), 5)]?.focus();
  }, [disabled, errorFocusSignal, value]);

  const updateDigit = (index: number, digit: string) => {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join('').slice(0, 6));
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const raw = normalizeDigits(event.target.value);
    if (raw.length > 1 && !digits[index]) {
      const next = raw.slice(0, 6);
      onChange(next);
      inputRefs.current[Math.min(next.length, 5)]?.focus();
      return;
    }

    const digit = raw ? raw[raw.length - 1]! : '';
    updateDigit(index, digit);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      updateDigit(index - 1, '');
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = normalizeDigits(event.clipboardData.getData('text')).slice(0, 6);
    if (!pasted) return;
    onChange(pasted);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div dir="ltr" className="grid grid-cols-6 gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          value={digit}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          disabled={disabled}
          className={cn(
            'focus:border-ember h-12 min-w-0 rounded-[8px] border bg-[rgba(255,98,0,.12)] text-center text-lg font-black outline-none transition-[border-color,box-shadow,transform] disabled:opacity-60',
            digit ? 'border-[rgba(255,98,0,.4)]' : 'border-[rgba(255,98,0,.18)]',
            'focus:scale-[1.04] focus:shadow-[0_0_0_3px_rgba(255,98,0,.14)]',
          )}
        />
      ))}
    </div>
  );
}

function PasswordStep({
  password,
  passwordConfirmation,
  setPassword,
  setPasswordConfirmation,
  disabled,
  onSubmit,
}: {
  password: string;
  passwordConfirmation: string;
  setPassword: (value: string) => void;
  setPasswordConfirmation: (value: string) => void;
  disabled: boolean;
  onSubmit: () => void;
}) {
  const passwordsMismatch = Boolean(passwordConfirmation) && password !== passwordConfirmation;

  return (
    <StepShell title="تغییر رمز عبور" description="رمز عبور جدیدی برای خود انتخاب کنید">
      <StepForm onSubmit={onSubmit}>
      <FieldFrame>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          disabled={disabled}
          className="placeholder:text-ink-4 h-full min-w-0 flex-1 bg-transparent px-3 text-right text-base outline-none disabled:opacity-60"
          placeholder="رمز عبور"
        />
        <Icon name="lock" size={18} className="text-gold shrink-0" />
      </FieldFrame>
      <FieldFrame>
        <input
          value={passwordConfirmation}
          onChange={(event) => setPasswordConfirmation(event.target.value)}
          type="password"
          disabled={disabled}
          className="placeholder:text-ink-4 h-full min-w-0 flex-1 bg-transparent px-3 text-right text-base outline-none disabled:opacity-60"
          placeholder="تکرار رمز عبور"
        />
        <Icon name="lock" size={18} className="text-gold shrink-0" />
      </FieldFrame>
      <p className="text-ink mt-2 text-center text-[12.5px] leading-7 font-bold">
        رمز عبور شما باید حداقل ۶ کاراکتر یا بیشتر باشد و از حروف انگلیسی و اعداد استفاده کنید
      </p>
      {passwordsMismatch && (
        <p className="text-danger text-center text-[12px] font-bold">
          تکرار رمز عبور با رمز جدید یکی نیست
        </p>
      )}
      <PrimaryAction type="submit" disabled={disabled || passwordsMismatch}>
        تایید
      </PrimaryAction>
      </StepForm>
    </StepShell>
  );
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col gap-4 py-2 text-right">
      <h3 className="text-[17px] font-black">{title}</h3>
      <p className="text-ink-2 text-[13px]">{description}</p>
      {children}
    </div>
  );
}

function StepForm({ children, onSubmit }: { children: ReactNode; onSubmit: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      {children}
    </form>
  );
}

function FieldFrame({ children }: { children: ReactNode }) {
  return (
    <label className="flex h-12 items-center gap-2 rounded-[9px] border border-[rgba(255,98,0,.18)] bg-[rgba(255,98,0,.12)] px-3">
      {children}
    </label>
  );
}

function PrimaryAction({
  type = 'button',
  disabled,
  onClick,
  children,
}: {
  type?: 'button' | 'submit';
  disabled: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="from-ember to-gold mt-1 flex h-12 w-full items-center justify-center rounded-[7px] bg-gradient-to-l text-[13px] font-black text-black shadow-[0_18px_36px_-22px_var(--glow)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/\D/g, '');
}
