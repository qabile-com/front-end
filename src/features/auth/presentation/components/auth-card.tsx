'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import { BaseModal, Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { showError } from '@/shared/lib/toast';
import { isCompleteOtp, isNonEmpty, isValidEmail } from '@/features/auth/domain/validation';
import type { GoogleAuthPayload, IAuthRepository } from '../../domain/auth-repository';
import { useAuth } from '../../application/use-auth';
import { AuthButton } from './auth-button';
import { AuthTabs } from './auth-tabs';
import { Field } from './field';
import { OtpInput } from './otp-input';
import { useIsLargeScreen } from '@/core/lib/use-is-large-screen';

type View = 'login' | 'forgot';
type LoginTab = 'pass' | 'otp';

const RESEND_SECONDS = 120;

interface AuthCardProps {
  repository: IAuthRepository;
  getRedirectTo?: () => string;
  googleEnabled?: boolean;
  googleMockEnabled?: boolean;
  initialReferralCode?: string;
}

export function AuthCard({
  repository,
  getRedirectTo,
  googleEnabled = true,
  googleMockEnabled = false,
  initialReferralCode = '',
}: AuthCardProps) {
  const [view, setView] = useState<View>('login');
  const auth = useAuth(repository, getRedirectTo);

  return (
    <div className="border-hair relative w-full max-w-[420px] overflow-hidden rounded-[28px] border p-8 px-6 shadow-[0_32px_80px_-28px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.03)_inset] [backdrop-filter:blur(var(--glass-blur))_saturate(140%)] [background:var(--glass)] sm:p-9 sm:px-8">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] [mask-composite:exclude] [padding:1px] [-webkit-mask-composite:xor] [background:linear-gradient(155deg,rgba(255,190,130,.16),transparent_34%)] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]" />

      {auth.success && <SuccessOverlay title={auth.success.title} msg={auth.success.msg} />}

      {view === 'login' && (
        <LoginView
          onForgot={() => setView('forgot')}
          loading={auth.loading}
          loginWithPassword={auth.loginWithPassword}
          loginWithGoogle={auth.loginWithGoogle}
          validateReferralCode={auth.validateReferralCode}
          googleEnabled={googleEnabled}
          googleMockEnabled={googleMockEnabled}
          initialReferralCode={initialReferralCode}
          requestOtp={auth.requestOtp}
          verifyOtp={auth.verifyOtp}
        />
      )}
      {view === 'forgot' && (
        <ForgotPasswordView
          loading={auth.loading}
          onBack={() => setView('login')}
          requestForgotPassword={auth.requestForgotPassword}
          verifyForgotPassword={auth.verifyForgotPassword}
          resetPassword={auth.resetPassword}
        />
      )}
    </div>
  );
}

function CardHeader({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <>
      <div className="mx-auto mb-[18px] grid size-12 place-items-center rounded-[15px] text-white shadow-[0_0_22px_-4px_var(--glow),inset_0_1px_0_rgba(255,255,255,.42)] [background:var(--fire-grad)]">
        <Icon name="flame" size={26} />
      </div>
      <h1 className="text-center text-[22px] font-black tracking-[-0.01em]">{title}</h1>
      <p className="text-ink-2 mt-[5px] text-center text-[14px]">{sub}</p>
    </>
  );
}

function LoginView({
  onForgot,
  loginWithPassword,
  loginWithGoogle,
  validateReferralCode,
  requestOtp,
  verifyOtp,
  loading,
  googleEnabled,
  googleMockEnabled,
  initialReferralCode,
}: {
  onForgot: () => void;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (payload: GoogleAuthPayload) => Promise<boolean>;
  validateReferralCode: (referralCode: string) => Promise<boolean>;
  requestOtp: (email: string, referralCode?: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string, referralCode?: string) => Promise<boolean>;
  loading: boolean;
  googleEnabled: boolean;
  googleMockEnabled: boolean;
  initialReferralCode?: string;
}) {
  const [tab, setTab] = useState<LoginTab>('otp');
  const [isMockGoogleOpen, setIsMockGoogleOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [referralCode, setReferralCode] = useState(initialReferralCode ?? '');
  const [modalReferralCode, setModalReferralCode] = useState('');
  const [modalReferralError, setModalReferralError] = useState<string | null>(null);
  const cleanReferralCode = referralCode.trim();
  const googleReferralCodeRef = useRef('');

  useEffect(() => {
    queueMicrotask(() => setReferralCode((current) => current || initialReferralCode || ''));
  }, [initialReferralCode]);

  const googleLogin = useGoogleLogin({
    flow: 'implicit',
    scope: 'openid email profile',
    onSuccess: async (response) => {
      const finalReferralCode = googleReferralCodeRef.current.trim();
      const googleProfile = await getGoogleProfile(response.access_token);
      void loginWithGoogle({
        ...toGoogleAuthPayload(response, finalReferralCode),
        googleAvatarUrl: googleProfile?.picture,
      });
    },
    onError: (error) => {
      showError(error.error_description || 'ورود با گوگل شروع نشد. تنظیمات Google OAuth را بررسی کن.');
    },
    onNonOAuthError: (error) => {
      const message =
        error.type === 'popup_closed'
          ? 'پنجره گوگل بسته شد.'
          : error.type === 'popup_failed_to_open'
            ? 'مرورگر اجازه باز شدن پنجره گوگل را نداد.'
            : 'پنجره ورود گوگل باز نشد.';
      showError(message);
    },
  });

  const canUseGoogle = googleEnabled || googleMockEnabled;

  const handleGoogleLogin = () => {
    setModalReferralCode(cleanReferralCode);
    setModalReferralError(null);
    setIsReferralModalOpen(true);
  };

  const resumeGoogleLogin = () => {
    setIsReferralModalOpen(false);
    if (googleMockEnabled) {
      setIsMockGoogleOpen(true);
      return;
    }

    if (!googleEnabled) {
      showError('Google Client ID در برنامه فعال نیست. dev server را بعد از تغییر env ری‌استارت کن.');
      return;
    }

    googleLogin();
  };

  const handleReferralContinueWithCode = async () => {
    const nextReferralCode = modalReferralCode.trim();
    if (!nextReferralCode) {
      setModalReferralError('اگر می‌خواهی با کد رفرال ادامه بدهی، کد را وارد کن.');
      return;
    }

    setModalReferralError(null);
    const isValid = await validateReferralCode(nextReferralCode);
    if (!isValid) {
      setModalReferralError('کد رفرال معتبر نیست. کد را بررسی کن یا بدون کد ادامه بده.');
      return;
    }

    googleReferralCodeRef.current = nextReferralCode;
    setReferralCode(nextReferralCode);
    resumeGoogleLogin();
  };

  const handleReferralContinueWithoutCode = () => {
    googleReferralCodeRef.current = '';
    setModalReferralCode('');
    setModalReferralError(null);
    resumeGoogleLogin();
  };

  const handleSelectMockGoogleAccount = (account: MockGoogleAccount) => {
    setIsMockGoogleOpen(false);
    const finalReferralCode = googleReferralCodeRef.current.trim();
    void loginWithGoogle({
      mock: true,
      mockEmail: account.email,
      mockName: account.name,
      accessToken: 'mock-google-access-token',
      referralCode: finalReferralCode || undefined,
      googleAvatarUrl: account.avatarUrl,
      refreshToken: 'mock-google-refresh-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      scope: 'openid email profile',
    });
  };

  return (
    <>
      <CardHeader title="خوش آمدی" sub="وارد حساب خود شو" />
      <AuthTabs<LoginTab>
        tabs={[
          { id: 'pass', label: 'رمز عبور' },
          { id: 'otp', label: 'کد یکبار مصرف' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'pass' ? (
        <PasswordForm
          loading={loading}
          onUseOtp={() => setTab('otp')}
          onForgot={onForgot}
          onSubmit={loginWithPassword}
        />
      ) : (
        <OtpLoginForm
          loading={loading}
          requestOtp={requestOtp}
          verifyOtp={verifyOtp}
          referralCode={cleanReferralCode}
        />
      )}
      <ReferralCodeField value={referralCode} onChange={setReferralCode} disabled={loading} />
      <GoogleLoginSection
        onClick={handleGoogleLogin}
        disabled={loading || !canUseGoogle}
        mockEnabled={googleMockEnabled}
      />
      <MockGoogleAccountChooser
        isOpen={isMockGoogleOpen}
        onClose={() => setIsMockGoogleOpen(false)}
        onSelect={handleSelectMockGoogleAccount}
      />
      <ReferralModal
        isOpen={isReferralModalOpen}
        value={modalReferralCode}
        onChange={setModalReferralCode}
        error={modalReferralError}
        loading={loading}
        onContinueWithCode={() => void handleReferralContinueWithCode()}
        onContinueWithoutCode={handleReferralContinueWithoutCode}
      />
    </>
  );
}

function AuthForm({
  children,
  onSubmit,
  className,
}: {
  children: ReactNode;
  onSubmit: () => void;
  className?: string;
}) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}

function PasswordForm({
  onUseOtp,
  onForgot,
  onSubmit,
  loading,
}: {
  onUseOtp: () => void;
  onForgot: () => void;
  onSubmit: (email: string, password: string) => Promise<boolean>;
  loading: boolean;
}) {
  const isLargeScreen = useIsLargeScreen();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = () => {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = isNonEmpty(email) ? 'ایمیل معتبر نیست' : 'ایمیل را وارد کنید';
    if (!isNonEmpty(password)) next.password = 'رمز عبور را وارد کنید';
    setErrors(next);
    if (Object.keys(next).length) return;
    void onSubmit(email, password);
  };

  return (
    <AuthForm onSubmit={submit}>
      <Field
        label="ایمیل"
        type="email"
        inputMode="email"
        placeholder="name@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors((prev) => ({ ...prev, email: undefined }));
        }}
        error={errors.email}
        autoComplete="email"
        autoFocus={isLargeScreen}
      />
      <Field
        label="رمز عبور"
        type={showPw ? 'text' : 'password'}
        placeholder="حداقل ۸ کاراکتر"
        value={password}
        hasToggle
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        error={errors.password}
        autoComplete="current-password"
        adornment={
          <button
            type="button"
            onClick={() => setShowPw((value) => !value)}
            aria-label="نمایش رمز"
            className="text-ink-3 hover:text-gold absolute inset-y-0 start-3.5 my-auto flex h-fit items-center transition-colors"
          >
            <Icon name={showPw ? 'eye-off' : 'eye'} size={18} />
          </button>
        }
      />
      <div className="mb-5 flex items-center text-[13px]">
        <label className="text-ink-2 flex flex-1 cursor-pointer items-center gap-2">
          <input type="checkbox" className="accent-ember size-[18px] rounded-[5px]" />
          مرا به خاطر بسپار
        </label>
        <button
          type="button"
          onClick={onForgot}
          className="text-ink-3 hover:text-gold ms-auto cursor-pointer transition-colors"
        >
          فراموشی رمز
        </button>
      </div>
      <AuthButton type="submit" loading={loading}>
        ورود به قبیله
      </AuthButton>
      <Divider />
      <AuthButton type="button" variant="alt" className="text-[#FDEEE299]" onClick={onUseOtp}>
        <Icon name="mail" color="#FDEEE299" />
        ادامه با ایمیل
      </AuthButton>
    </AuthForm>
  );
}

function ReferralCodeField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <Field
      label="کد رفرال"
      type="text"
      inputMode="text"
      placeholder="اختیاری"
      value={value}
      onChange={(event) => onChange(event.target.value.trimStart())}
      disabled={disabled}
      autoComplete="off"
    />
  );
}

function OtpLoginForm({
  requestOtp,
  verifyOtp,
  loading,
  referralCode,
}: {
  requestOtp: (email: string, referralCode?: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string, referralCode?: string) => Promise<boolean>;
  loading: boolean;
  referralCode?: string;
}) {
  const isLargeScreen = useIsLargeScreen();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { cooldown, start } = useCooldown();
  const [code, setCode] = useState('');

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setError('ایمیل معتبر نیست');
      return;
    }
    const ok = await requestOtp(email, referralCode);
    if (ok) {
      setSent(true);
      start(RESEND_SECONDS);
    }
  };

  const submitCode = useOtpSubmit({
    code,
    enabled: sent,
    loading,
    onSubmit: (nextCode) => verifyOtp(email, nextCode, referralCode),
  });

  if (!sent) {
    return (
      <AuthForm onSubmit={() => void handleSendOtp()}>
        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <div className="w-full flex-1">
            <Field
              label="ایمیل"
              type="email"
              inputMode="email"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(undefined);
              }}
               error={error}
               autoComplete="email"
               autoFocus={isLargeScreen}
             />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-[53px] w-full shrink-0 rounded-[11px] px-4 text-[13.5px] font-extrabold whitespace-nowrap text-[#1a0a00] shadow-[0_6px_20px_-8px_var(--glow)] transition-transform [background:var(--fire-grad)] enabled:hover:-translate-y-0.5 disabled:opacity-50 sm:mb-4 sm:w-auto"
          >
            {loading ? 'در حال ارسال' : 'دریافت کد'}
          </button>
        </div>
      </AuthForm>
    );
  }

  return (
    <AuthForm onSubmit={submitCode}>
      <p className="text-ink-2 mb-3.5 text-center text-[13px] leading-[1.65]">
        کد تایید به <b className="text-gold" dir="ltr">{email}</b> ارسال شد
      </p>
      <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} autoFocus={isLargeScreen} />
      <ResendRow cooldown={cooldown} onResend={() => void requestOtp(email).then((ok) => ok && start(RESEND_SECONDS))} />
      <AuthButton type="submit" loading={loading} disabled={!isCompleteOtp(code)}>
        تایید و ورود
      </AuthButton>
      <BottomLink>
        <button type="button" onClick={() => setSent(false)} className="text-gold cursor-pointer font-bold">
          ← تغییر ایمیل
        </button>
      </BottomLink>
    </AuthForm>
  );
}

function ForgotPasswordView({
  loading,
  onBack,
  requestForgotPassword,
  verifyForgotPassword,
  resetPassword,
}: {
  loading: boolean;
  onBack: () => void;
  requestForgotPassword: (email: string) => Promise<boolean>;
  verifyForgotPassword: (email: string, code: string) => Promise<{ verificationToken: string } | null>;
  resetPassword: (
    verificationToken: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<boolean>;
}) {
  const isLargeScreen = useIsLargeScreen();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | undefined>();
  const { cooldown, start } = useCooldown();

  const submitEmail = async () => {
    if (!isValidEmail(email)) {
      setError('ایمیل معتبر نیست');
      return;
    }
    const ok = await requestForgotPassword(email);
    if (ok) {
      setStep(2);
      start(RESEND_SECONDS);
    }
  };

  const submitPassword = async () => {
    if (password.length < 8) {
      setError('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('تکرار رمز عبور درست نیست');
      return;
    }
    const ok = await resetPassword(verificationToken, password, passwordConfirmation);
    if (ok) onBack();
  };

  const submitForgotCode = useOtpSubmit({
    code,
    enabled: step === 2,
    loading,
    onSubmit: async (nextCode) => {
      const result = await verifyForgotPassword(email, nextCode);
      if (result) {
        setVerificationToken(result.verificationToken);
        setStep(3);
      }
      return Boolean(result);
    },
  });

  return (
    <>
      <BackButton onClick={step === 1 ? onBack : () => setStep((current) => (current === 3 ? 2 : 1))} />
      <CardHeader title="بازیابی رمز عبور" sub="ایمیل حسابت را وارد کن تا کد بازیابی دریافت کنی" />
      <div className="h-5" />

      {step === 1 && (
        <AuthForm onSubmit={() => void submitEmail()}>
          <Field
            label="ایمیل"
            type="email"
            inputMode="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            error={error}
            autoComplete="email"
            autoFocus={isLargeScreen}
          />
          <AuthButton type="submit" loading={loading}>
            دریافت کد بازیابی
          </AuthButton>
        </AuthForm>
      )}

      {step === 2 && (
        <AuthForm onSubmit={submitForgotCode}>
          <p className="text-ink-2 mb-3.5 text-center text-[13px] leading-[1.65]">
            کد بازیابی به <b className="text-gold" dir="ltr">{email}</b> ارسال شد
          </p>
      <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} autoFocus={isLargeScreen} />
          <ResendRow cooldown={cooldown} onResend={() => void requestForgotPassword(email).then((ok) => ok && start(RESEND_SECONDS))} />
          <AuthButton type="submit" loading={loading} disabled={!isCompleteOtp(code)}>
            ادامه
          </AuthButton>
        </AuthForm>
      )}

      {step === 3 && (
        <AuthForm onSubmit={() => void submitPassword()}>
          <Field
            label="رمز عبور جدید"
            type="password"
            placeholder="StrongPass123!"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(undefined);
            }}
            error={error}
            autoComplete="new-password"
            autoFocus={isLargeScreen}
          />
          <Field
            label="تکرار رمز عبور"
            type="password"
            placeholder="StrongPass123!"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              setError(undefined);
            }}
            autoComplete="new-password"
          />
          <AuthButton type="submit" loading={loading}>
            تغییر رمز عبور
          </AuthButton>
        </AuthForm>
      )}
    </>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-ink-3 hover:text-gold mb-5 flex items-center gap-[7px] text-[13px] transition-colors"
    >
      <Icon name="arrow-right" size={15} /> بازگشت
    </button>
  );
}

function Divider() {
  return (
    <div className="text-ink-3 my-[18px] flex items-center gap-3.5 text-[13px] before:h-px before:flex-1 before:[background:var(--color-hair)] after:h-px after:flex-1 after:[background:var(--color-hair)]">
      یا
    </div>
  );
}

function BottomLink({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('text-ink-3 mt-5 text-center text-[13.5px]', className)}>{children}</div>
  );
}

function GoogleLoginSection({
  onClick,
  disabled,
  mockEnabled,
}: {
  onClick: () => void;
  disabled: boolean;
  mockEnabled: boolean;
}) {
  return (
    <>
      <Divider />
      <AuthButton
        type="button"
        variant="alt"
        className="border-[rgba(255,98,0,.24)] text-ink shadow-[0_18px_42px_-34px_var(--glow),inset_0_1px_0_rgba(255,255,255,.08)] [background:linear-gradient(135deg,rgba(255,98,0,.13),rgba(243,186,99,.05),rgba(255,255,255,.035))]"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="grid size-7 place-items-center rounded-[10px] border border-[rgba(243,186,99,.26)] bg-black/24 text-[14px] font-black text-gold shadow-[inset_0_1px_0_rgba(255,255,255,.08)]">
          G
        </span>
        <span className="inline-flex min-w-0 flex-col items-start leading-none">
          <span className="text-[14px] font-black">ادامه با Gmail</span>
          {mockEnabled && <span className="text-ink-4 mt-1 text-[10px] font-bold">حالت آزمایشی</span>}
        </span>
      </AuthButton>
    </>
  );
}

interface MockGoogleAccount {
  name: string;
  email: string;
  initial: string;
  accent: string;
  avatarUrl?: string;
}

const MOCK_GOOGLE_ACCOUNTS: MockGoogleAccount[] = [
  {
    name: 'کاربر Gmail',
    email: 'gmail-user@qabile.local',
    initial: 'G',
    accent: 'bg-[#1a73e8]',
  },
  {
    name: 'علی تست',
    email: 'ali.test@qabile.local',
    initial: 'A',
    accent: 'bg-[#188038]',
  },
];

function MockGoogleAccountChooser({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (account: MockGoogleAccount) => void;
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="انتخاب حساب Google"
      panelClassName="w-full max-w-[420px] overflow-hidden rounded-[22px] bg-white text-[#202124] shadow-[0_30px_90px_-38px_rgba(0,0,0,.75)]"
      contentClassName="max-h-[calc(100dvh-2rem)]"
    >
      <div dir="ltr" className="text-left">
        <div className="border-b border-[#dadce0] px-6 py-5">
          <div className="mb-7 flex items-center gap-2.5">
            <span className="text-[20px] font-medium text-[#4285f4]">G</span>
            <span className="text-[20px] font-medium text-[#ea4335]">o</span>
            <span className="text-[20px] font-medium text-[#fbbc04]">o</span>
            <span className="text-[20px] font-medium text-[#4285f4]">g</span>
            <span className="text-[20px] font-medium text-[#34a853]">l</span>
            <span className="text-[20px] font-medium text-[#ea4335]">e</span>
          </div>
          <h2 className="text-[24px] leading-8 font-normal">Choose an account</h2>
          <p className="mt-1 text-sm text-[#5f6368]">to continue to Qabile</p>
        </div>

        <div className="py-2">
          {MOCK_GOOGLE_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => onSelect(account)}
              className="flex min-h-17 w-full items-center gap-4 px-6 py-3 text-left transition-colors hover:bg-[#f8fafd] focus-visible:bg-[#f8fafd] focus-visible:outline-none"
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-full text-base font-medium text-white',
                  account.accent,
                )}
              >
                {account.initial}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#202124]">
                  {account.name}
                </span>
                <span className="mt-0.5 block truncate text-sm text-[#5f6368]">
                  {account.email}
                </span>
              </span>
            </button>
          ))}

          <button
            type="button"
            className="flex min-h-15 w-full items-center gap-4 px-6 py-3 text-left text-sm font-medium text-[#3c4043] transition-colors hover:bg-[#f8fafd]"
            onClick={() => onSelect(MOCK_GOOGLE_ACCOUNTS[0]!)}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[#dadce0] text-[#5f6368]">
              +
            </span>
            Use another account
          </button>
        </div>

        <div className="border-t border-[#dadce0] px-6 py-4 text-xs leading-5 text-[#5f6368]">
          This is a temporary mocked Google screen. Real Google account selection will appear
          when mock mode is disabled and a valid OAuth client id is configured.
        </div>
      </div>
    </BaseModal>
  );
}

function ReferralModal({
  isOpen,
  value,
  error,
  loading = false,
  onChange,
  onContinueWithCode,
  onContinueWithoutCode,
}: {
  isOpen: boolean;
  value: string;
  error?: string | null;
  loading?: boolean;
  onChange: (value: string) => void;
  onContinueWithCode: () => void;
  onContinueWithoutCode: () => void;
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={loading ? () => undefined : onContinueWithoutCode}
      title="کد رفرال"
      panelClassName="w-full max-w-[420px] overflow-hidden rounded-[22px] border border-hair bg-black/95 text-white shadow-[0_30px_90px_-38px_rgba(0,0,0,.75)]"
      contentClassName="max-h-[calc(100dvh-2rem)]"
    >
      <div className="px-6 py-6">
        <p className="text-ink-2 text-center text-[14px] leading-7">
          اگر کد رفرال دارید، در فیلد زیر وارد کنید. در غیر این صورت روی ادامه بدون کد رفرال کلیک
          کنید.
        </p>
        <div className="mt-5">
          <Field
            label="کد رفرال (اختیاری)"
            type="text"
            inputMode="text"
            placeholder="کد رفرال را وارد کنید"
            value={value}
            onChange={(event) => onChange(event.target.value.trimStart())}
            disabled={loading}
            autoComplete="off"
          />
          {error && <p className="mt-2 text-right text-[12px] font-bold text-red-400">{error}</p>}
        </div>
        <div className="mt-2 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onContinueWithoutCode}
            className="text-ink-3 hover:text-ink inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-[13px] font-bold transition-colors disabled:opacity-50"
          >
            ادامه بدون کد رفرال
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onContinueWithCode}
            className="text-gold border-ember hover:border-ember-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-[13px] font-black transition-colors [background:var(--glass)] disabled:opacity-50"
          >
            تایید و ادامه
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

function ResendRow({ cooldown, onResend }: { cooldown: number; onResend: () => void }) {
  return (
    <div className="text-ink-3 mb-[18px] text-center text-[13px]">
      {cooldown > 0 ? (
        <>
          ارسال مجدد تا <span className="text-ember font-extrabold tabular-nums">{toFa(cooldown)}</span>{' '}
          ثانیه دیگر
        </>
      ) : (
        <button type="button" onClick={onResend} className="text-gold cursor-pointer font-bold">
          ارسال مجدد کد
        </button>
      )}
    </div>
  );
}

function SuccessOverlay({ title, msg }: { title: string; msg: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 rounded-[inherit] [backdrop-filter:blur(8px)] [background:rgba(5,3,2,.92)]">
      <div className="grid size-16 animate-[popIn_.5s_var(--ease-back)] place-items-center rounded-full text-white shadow-[0_0_32px_-4px_rgba(43,212,168,.5)] [background:linear-gradient(135deg,#1f8a5b,#2bd4a8)]">
        <Icon name="check" size={32} />
      </div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="text-ink-2 max-w-[240px] text-center text-[14px]">{msg}</p>
    </div>
  );
}

function useCooldown(initial = 0) {
  const [cooldown, setCooldown] = useState(initial);
  const running = cooldown > 0;

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  return { cooldown, start: (secs: number) => setCooldown(secs) };
}

function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

function toGoogleAuthPayload(response: TokenResponse, referralCode?: string): GoogleAuthPayload {
  const responseWithRefresh = response as TokenResponse & { refresh_token?: string };

  return {
    accessToken: response.access_token,
    referralCode: referralCode?.trim() || undefined,
    refreshToken: responseWithRefresh.refresh_token,
    tokenType: response.token_type,
    expiresIn: response.expires_in,
    scope: response.scope,
  };
}

async function getGoogleProfile(accessToken?: string) {
  if (!accessToken) return null;

  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return null;
    return (await response.json()) as { picture?: string };
  } catch {
    return null;
  }
}

function useOtpSubmit({
  code,
  enabled = true,
  loading,
  onSubmit,
}: {
  code: string;
  enabled?: boolean;
  loading: boolean;
  onSubmit: (code: string) => Promise<boolean>;
}) {
  const submittedCode = useRef('');
  const autoSubmittedCode = useRef('');
  const onSubmitRef = useLatestRef(onSubmit);

  const submit = useCallback(() => {
    if (!enabled || loading || !isCompleteOtp(code)) return;
    if (submittedCode.current === code) return;

    submittedCode.current = code;
    void onSubmitRef.current(code).then((ok) => {
      if (!ok) submittedCode.current = '';
    });
  }, [code, enabled, loading, onSubmitRef]);

  useEffect(() => {
    if (!enabled || loading || !isCompleteOtp(code)) return;
    if (autoSubmittedCode.current === code) return;

    autoSubmittedCode.current = code;
    submit();
  }, [code, enabled, loading, submit]);

  return submit;
}

const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (value: number) => String(value).replace(/\d/g, (digit) => FA[+digit]!);
