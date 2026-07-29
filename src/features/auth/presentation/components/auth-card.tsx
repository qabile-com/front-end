'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import { isCompleteOtp, isNonEmpty, isValidEmail } from '@/features/auth/domain/validation';
import type { IAuthRepository } from '../../domain/auth-repository';
import { useAuth } from '../../application/use-auth';
import { AuthButton } from './auth-button';
import { AuthTabs } from './auth-tabs';
import { Field } from './field';
import { OtpInput } from './otp-input';

type View = 'login' | 'forgot';
type LoginTab = 'pass' | 'otp';

const RESEND_SECONDS = 120;

interface AuthCardProps {
  repository: IAuthRepository;
  getRedirectTo?: () => string;
}

export function AuthCard({ repository, getRedirectTo }: AuthCardProps) {
  const [view, setView] = useState<View>('login');
  const auth = useAuth(repository, getRedirectTo);

  return (
    <div className="border-hair relative w-full max-w-[420px] overflow-hidden rounded-[28px] border p-9 px-8 shadow-[0_32px_80px_-28px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.03)_inset] [backdrop-filter:blur(var(--glass-blur))_saturate(140%)] [background:var(--glass)]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] [mask-composite:exclude] [padding:1px] [-webkit-mask-composite:xor] [background:linear-gradient(155deg,rgba(255,190,130,.16),transparent_34%)] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]" />

      {auth.success && <SuccessOverlay title={auth.success.title} msg={auth.success.msg} />}

      {view === 'login' && (
        <LoginView
          onForgot={() => setView('forgot')}
          loading={auth.loading}
          loginWithPassword={auth.loginWithPassword}
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
  requestOtp,
  verifyOtp,
  loading,
}: {
  onForgot: () => void;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  loading: boolean;
}) {
  const [tab, setTab] = useState<LoginTab>('pass');

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
        />
      )}
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
        autoFocus
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

function OtpLoginForm({
  requestOtp,
  verifyOtp,
  loading,
}: {
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<boolean>;
  loading: boolean;
}) {
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
    const ok = await requestOtp(email);
    if (ok) {
      setSent(true);
      start(RESEND_SECONDS);
    }
  };

  const submitCode = useOtpSubmit({
    code,
    enabled: sent,
    loading,
    onSubmit: (nextCode) => verifyOtp(email, nextCode),
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
              autoFocus
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
      <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} autoFocus />
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
            autoFocus
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
          <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} autoFocus />
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
            autoFocus
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
    submit();
  }, [submit]);

  return submit;
}

const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (value: number) => String(value).replace(/\d/g, (digit) => FA[+digit]!);
