'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import {
  isCompleteOtp,
  isValidEmail,
  isNonEmpty,
  isValidLoginId,
} from '@/features/auth/domain/validation';
import { AuthButton } from './auth-button';
import { AuthTabs } from './auth-tabs';
import { Field } from './field';
import { OtpInput } from './otp-input';
import { IAuthRepository } from '../../domain/auth-repository';
import { useAuth } from '../../application/use-auth';
type View = 'login' | 'signup';
type LoginTab = 'pass' | 'otp';

const RESEND_SECONDS = 120;

interface AuthCardProps {
  repository: IAuthRepository;
}

export function AuthCard({ repository }: AuthCardProps) {
  const [view, setView] = useState<View>('login');
  const { loading, success, requestOtp, verifyOtp, clearSuccess } = useAuth(repository);

  return (
    <div className="border-hair relative w-full max-w-[420px] overflow-hidden rounded-[28px] border p-9 px-8 shadow-[0_32px_80px_-28px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.03)_inset] [backdrop-filter:blur(var(--glass-blur))_saturate(140%)] [background:var(--glass)]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] [mask-composite:exclude] [padding:1px] [-webkit-mask-composite:xor] [background:linear-gradient(155deg,rgba(255,190,130,.16),transparent_34%)] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]" />

      {success && <SuccessOverlay title={success.title} msg={success.msg} />}

      {view === 'login' ? (
        <LoginView
          onGoSignup={() => setView('signup')}
          requestOtp={requestOtp}
          verifyOtp={verifyOtp}
          loading={loading}
        />
      ) : (
        <SignupView
          onGoLogin={() => setView('login')}
          requestOtp={requestOtp}
          verifyOtp={verifyOtp}
          loading={loading}
        />
      )}
    </div>
  );
}

function CardHeader({ title, sub }: { title: string; sub: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto mb-[18px] grid size-12 place-items-center rounded-[15px] text-[#fff] shadow-[0_0_22px_-4px_var(--glow),inset_0_1px_0_rgba(255,255,255,.42)] [background:var(--fire-grad)]">
        <Icon name="flame" size={26} />
      </div>
      <h1 className="text-center text-[22px] font-black tracking-[-0.01em]">{title}</h1>
      <p className="text-ink-2 mt-[5px] text-center text-[14px]">{sub}</p>
    </>
  );
}

function LoginView({
  onGoSignup,
  requestOtp,
  verifyOtp,
  loading,
}: {
  onGoSignup: () => void;
  requestOtp: (identifier: string) => Promise<boolean>;
  verifyOtp: (identifier: string, code: string, name?: string, lastName?: string) => Promise<void>;
  loading: boolean;
}) {
  const [tab, setTab] = useState<LoginTab>('pass');

  return (
    <>
      <CardHeader title="خوش آمدی" sub="وارد حساب خود شو" />
      <AuthTabs
        tabs={[
          { id: 'pass', label: 'رمز عبور' },
          { id: 'otp', label: 'کد یکبار مصرف' },
        ] as const}
        active={tab}
        onChange={setTab}
      />
      {tab === 'pass' ? (
        <PasswordForm onGoSignup={onGoSignup} />
      ) : (
        <OtpLoginForm
          onGoSignup={onGoSignup}
          requestOtp={requestOtp}
          verifyOtp={verifyOtp}
          loading={loading}
        />
      )}
    </>
  );
}
function PasswordForm({ onGoSignup }: { onGoSignup: () => void }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const next: typeof errors = {};
    if (!isValidLoginId(id))
      next.id = isNonEmpty(id) ? 'ایمیل معتبر نیست' : 'این فیلد اجباری است';
    if (!isNonEmpty(pw)) next.pw = 'رمز عبور را وارد کنید';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Password login not implemented – show a message or keep as placeholder
    }, 1400);
  };

  return (
    <>
      <Field
        label="ایمیل"
        type="email"
        inputMode="email"
        placeholder="name@email.com"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
          setErrors((p) => ({ ...p, id: undefined }));
        }}
        error={errors.id}
        autoComplete="email"
      />
      <Field
        label="رمز عبور"
        type={showPw ? 'text' : 'password'}
        placeholder="حداقل ۸ کاراکتر"
        value={pw}
        hasToggle
        onChange={(e) => {
          setPw(e.target.value);
          setErrors((p) => ({ ...p, pw: undefined }));
        }}
        error={errors.pw}
        autoComplete="current-password"
        adornment={
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
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
        <a className="text-ink-3 hover:text-gold ms-auto cursor-pointer transition-colors">
          فراموشی رمز
        </a>
      </div>
      <AuthButton loading={loading} onClick={submit}>
        ورود به قبیله
      </AuthButton>
      <Divider />
      <AuthButton variant="alt" className="text-[#FDEEE299]">
        <Icon name="mail" color="#FDEEE299" />
        ادامه با ایمیل
      </AuthButton>
      <BottomLink>
        حساب ندارید؟{' '}
        <a onClick={onGoSignup} className="text-gold cursor-pointer font-bold hover:opacity-75">
          ثبت نام کنید
        </a>
      </BottomLink>
    </>
  );
}
function OtpLoginForm({
  onGoSignup,
  requestOtp,
  verifyOtp,
  loading,
}: {
  onGoSignup: () => void;
  requestOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  loading: boolean;
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { cooldown, start } = useCooldown();
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendOtp = async () => {
    if (!isValidEmail(email)) {
      setError('ایمیل معتبر نیست');
      return;
    }
    setSending(true);
    const ok = await requestOtp(email);
    setSending(false);
    if (ok) {
      setSent(true);
      start(RESEND_SECONDS);
    }
  };

  const handleVerify = () => {
    verifyOtp(email, code);
  };

  if (!sent) {
    return (
      <>
        <div className="mb-4 flex items-end gap-2.5">
          <div className="flex-1">
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
            />
          </div>
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sending}
            className="mb-4 h-[53px] shrink-0 rounded-[11px] px-4 text-[13.5px] font-extrabold whitespace-nowrap text-[#1a0a00] shadow-[0_6px_20px_-8px_var(--glow)] transition-transform [background:var(--fire-grad)] enabled:hover:-translate-y-0.5 disabled:opacity-50"
          >
            {sending ? '...' : 'دریافت کد'}
          </button>
        </div>
        <BottomLink className="mt-2">
          حساب ندارید؟{' '}
          <a onClick={onGoSignup} className="text-gold cursor-pointer font-bold hover:opacity-75">
            ثبت نام کنید
          </a>
        </BottomLink>
      </>
    );
  }

  return (
    <>
      <p className="text-ink-2 mb-3.5 text-center text-[13px] leading-[1.65]">
        کد تایید به{' '}
        <b className="text-gold" dir="ltr">
          {email}
        </b>
        <br />
        ارسال شد
      </p>
      <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} />
      <ResendRow cooldown={cooldown} onResend={() => start(RESEND_SECONDS)} />
      <AuthButton loading={loading} disabled={!isCompleteOtp(code)} onClick={handleVerify}>
        تایید و ورود
      </AuthButton>
      <BottomLink>
        <a onClick={() => setSent(false)} className="text-gold cursor-pointer font-bold">
          ← تغییر ایمیل
        </a>
      </BottomLink>
    </>
  );
}
function SignupView({
  onGoLogin,
  requestOtp,
  verifyOtp,
  loading,
}: {
  onGoLogin: () => void;
  requestOtp: (identifier: string) => Promise<boolean>;
  verifyOtp: (identifier: string, code: string, name?: string, lastName?: string) => Promise<void>;
  loading: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');

  if (step === 2) {
    return (
      <SignupStep2
        email={email}
        name={name}
        lastName={lastName}
        onBack={() => setStep(1)}
        verifyOtp={verifyOtp}
        loading={loading}
      />
    );
  }
  return (
    <SignupStep1
      onGoLogin={onGoLogin}
      onNext={(p, n, ln) => {
        setEmail(p);
        setName(n);
        setLastName(ln);
        setStep(2);
      }}
      requestOtp={requestOtp}
    />
  );
}
function SignupStep1({
  onNext,
  onGoLogin,
  requestOtp,
}: {
  onNext: (email: string, name: string, lastName: string) => void;
  onGoLogin: () => void;
  requestOtp: (email: string) => Promise<boolean>;
}) {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [ref, setRef] = useState('');
  const [errors, setErrors] = useState<{ name?: string; lastName?: string; email?: string }>({});
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!isNonEmpty(name)) next.name = 'نام را وارد کنید';
    if (!isNonEmpty(lastName)) next.lastName = 'نام خانوادگی را وارد کنید';
    if (!isValidEmail(email)) next.email = 'ایمیل معتبر نیست';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    const ok = await requestOtp(email);
    setSending(false);
    if (ok) {
      onNext(email, name, lastName);
    }
  };

  return (
    <>
      <CardHeader title="عضویت در قبیله" sub="سفرت را همین‌جا شروع کن" />
      <div className="h-5" />
      <Field
        label="نام"
        placeholder="مثال: آرش"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors((p) => ({ ...p, name: undefined }));
        }}
        error={errors.name}
        autoComplete="given-name"
      />
      <Field
        label="نام خانوادگی"
        placeholder="مثال: کریمی"
        value={lastName}
        onChange={(e) => {
          setLastName(e.target.value);
          setErrors((p) => ({ ...p, lastName: undefined }));
        }}
        error={errors.lastName}
        autoComplete="family-name"
      />
      <Field
        label="ایمیل"
        type="email"
        inputMode="email"
        placeholder="name@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors((p) => ({ ...p, email: undefined }));
        }}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label={
          <span className="flex items-center">
            کد معرف
            <span className="text-gold ms-1.5 rounded-[6px] border border-[rgba(243,186,99,.22)] px-1.5 py-px text-[11px] font-bold [background:rgba(243,186,99,.12)]">
              اختیاری
            </span>
          </span>
        }
        placeholder="اگر کد دارید وارد کنید"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        autoComplete="off"
      />
      <AuthButton loading={sending} onClick={submit}>
        دریافت کد تایید
        <Icon name="flame" size={16} />
      </AuthButton>
      <BottomLink>
        حساب دارید؟{' '}
        <a onClick={onGoLogin} className="text-gold cursor-pointer font-bold hover:opacity-75">
          وارد شوید
        </a>
      </BottomLink>
    </>
  );
}

// -----------------------------------------------
// Signup step 2 – verify OTP
// -----------------------------------------------
function SignupStep2({
  email,
  name,
  lastName,
  onBack,
  verifyOtp,
  loading,
}: {
  email: string;
  name: string;
  lastName: string;
  onBack: () => void;
  verifyOtp: (identifier: string, code: string, name?: string, lastName?: string) => Promise<void>;
  loading: boolean;
}) {
  const [code, setCode] = useState('');
  const { cooldown, start } = useCooldown(RESEND_SECONDS);

  const handleVerify = () => {
    verifyOtp(email, code, name, lastName);
  };

  return (
    <>
      <button
        onClick={onBack}
        className="text-ink-3 hover:text-gold mb-5 flex items-center gap-[7px] text-[13px] transition-colors"
      >
        <Icon name="arrow-left" size={15} /> بازگشت
      </button>
      <CardHeader
        title="تایید ایمیل"
        sub={
          <>
            کد ۶ رقمی ارسال شده به
            <br />
            <b className="text-gold" dir="ltr">
              {email}
            </b>
          </>
        }
      />
      <div className="h-5" />
      <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} />
      <ResendRow cooldown={cooldown} onResend={() => start(RESEND_SECONDS)} />
      <AuthButton loading={loading} disabled={!isCompleteOtp(code)} onClick={handleVerify}>
        ساخت حساب و ورود
      </AuthButton>
    </>
  );
}

// -----------------------------------------------
// Shared helpers
// -----------------------------------------------
function Divider() {
  return (
    <div className="text-ink-3 my-[18px] flex items-center gap-3.5 text-[13px] before:h-px before:flex-1 before:[background:var(--color-hair)] after:h-px after:flex-1 after:[background:var(--color-hair)]">
      یا
    </div>
  );
}

function BottomLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('text-ink-3 mt-5 text-center text-[13.5px]', className)}>{children}</div>
  );
}

function ResendRow({ cooldown, onResend }: { cooldown: number; onResend: () => void }) {
  return (
    <div className="text-ink-3 mb-[18px] text-center text-[13px]">
      {cooldown > 0 ? (
        <>
          ارسال مجدد تا{' '}
          <span className="text-ember font-extrabold tabular-nums">{toFa(cooldown)}</span> ثانیه
          دیگر
        </>
      ) : (
        <a onClick={onResend} className="text-gold cursor-pointer font-bold">
          ارسال مجدد کد
        </a>
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
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  return { cooldown, start: (secs: number) => setCooldown(secs) };
}

const FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (n: number) => String(n).replace(/\d/g, (d) => FA[+d]!);
