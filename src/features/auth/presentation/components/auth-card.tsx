'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/shared/ui';
import { cn } from '@/core/lib/cn';
import {
  isCompleteOtp,
  isNonEmpty,
  isValidIranPhone,
  isValidLoginId,
} from '@/features/auth/domain/validation';
import { AuthButton } from './auth-button';
import { AuthTabs } from './auth-tabs';
import { Field } from './field';
import { OtpInput } from './otp-input';

type View = 'login' | 'signup';
type LoginTab = 'pass' | 'otp';

const RESEND_SECONDS = 60;

export function AuthCard() {
  const router = useRouter();
  const [view, setView] = useState<View>('login');
  const [success, setSuccess] = useState<{ title: string; msg: string } | null>(null);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.push('/dashboard'), 1200);
    return () => clearTimeout(t);
  }, [success, router]);

  return (
    <div className="border-hair relative w-full max-w-[420px] overflow-hidden rounded-[28px] border p-9 px-8 shadow-[0_32px_80px_-28px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.03)_inset] [backdrop-filter:blur(var(--glass-blur))_saturate(140%)] [background:var(--glass)]">
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] [mask-composite:exclude] [padding:1px] [-webkit-mask-composite:xor] [background:linear-gradient(155deg,rgba(255,190,130,.16),transparent_34%)] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]" />

      {success && <SuccessOverlay title={success.title} msg={success.msg} />}

      {view === 'login' ? (
        <LoginView onSuccess={setSuccess} onGoSignup={() => setView('signup')} />
      ) : (
        <SignupView onSuccess={setSuccess} onGoLogin={() => setView('login')} />
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
  onSuccess,
  onGoSignup,
}: {
  onSuccess: (s: { title: string; msg: string }) => void;
  onGoSignup: () => void;
}) {
  const [tab, setTab] = useState<LoginTab>('pass');

  return (
    <>
      <CardHeader title="خوش آمدی" sub="وارد حساب خود شو" />
      <AuthTabs
        tabs={[
          { id: 'pass', label: 'رمز عبور' },
          { id: 'otp', label: 'کد یکبار مصرف' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'pass' ? (
        <PasswordForm onSuccess={onSuccess} onGoSignup={onGoSignup} />
      ) : (
        <OtpLoginForm onSuccess={onSuccess} onGoSignup={onGoSignup} />
      )}
    </>
  );
}

function PasswordForm({
  onSuccess,
  onGoSignup,
}: {
  onSuccess: (s: { title: string; msg: string }) => void;
  onGoSignup: () => void;
}) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const next: typeof errors = {};
    if (!isValidLoginId(id))
      next.id = isNonEmpty(id) ? 'فرمت وارد شده معتبر نیست' : 'این فیلد اجباری است';
    if (!isNonEmpty(pw)) next.pw = 'رمز عبور را وارد کنید';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ title: 'خوش آمدی! 🔥', msg: 'ورود موفقیت‌آمیز بود. در حال ورود به قبیله...' });
    }, 1400);
  };

  return (
    <>
      <Field
        label="شماره موبایل یا ایمیل"
        placeholder="09xxxxxxxxx یا name@email.com"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
          setErrors((p) => ({ ...p, id: undefined }));
        }}
        error={errors.id}
        autoComplete="username"
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
  onSuccess,
  onGoSignup,
}: {
  onSuccess: (s: { title: string; msg: string }) => void;
  onGoSignup: () => void;
}) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { cooldown, start } = useCooldown();
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const sendOtp = () => {
    if (!isValidIranPhone(phone)) {
      setError('شماره موبایل معتبر نیست');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      start(RESEND_SECONDS);
    }, 900);
  };

  const verify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess({ title: 'خوش آمدی! 🔥', msg: 'ورود موفقیت‌آمیز بود. در حال ورود به قبیله...' });
    }, 1200);
  };

  if (!sent) {
    return (
      <>
        <div className="mb-4 flex items-end gap-2.5">
          <div className="flex-1">
            <Field
              label="شماره موبایل"
              type="tel"
              inputMode="numeric"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(undefined);
              }}
              error={error}
              autoComplete="tel"
            />
          </div>
          <button
            type="button"
            onClick={sendOtp}
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
          {phone}
        </b>
        <br />
        ارسال شد
      </p>
      <OtpInput
        value={code}
        onChange={(c) => {
          setCode(c);
          setCodeErr(false);
        }}
        error={codeErr}
        ok={isCompleteOtp(code)}
      />
      <ResendRow cooldown={cooldown} onResend={() => start(RESEND_SECONDS)} />
      <AuthButton loading={loading} disabled={!isCompleteOtp(code)} onClick={verify}>
        تایید و ورود
      </AuthButton>
      <BottomLink>
        <a onClick={() => setSent(false)} className="text-gold cursor-pointer font-bold">
          ← تغییر شماره
        </a>
      </BottomLink>
    </>
  );
}

function SignupView({
  onSuccess,
  onGoLogin,
}: {
  onSuccess: (s: { title: string; msg: string }) => void;
  onGoLogin: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');

  if (step === 2) {
    return (
      <SignupStep2
        phone={phone}
        onBack={() => setStep(1)}
        onSuccess={() =>
          onSuccess({ title: 'حساب ساخته شد! 🔥', msg: 'به قبیله ققنوس خوش آمدی. سفرت شروع شد.' })
        }
      />
    );
  }
  return (
    <SignupStep1
      onGoLogin={onGoLogin}
      onNext={(p) => {
        setPhone(p);
        setStep(2);
      }}
    />
  );
}

function SignupStep1({
  onNext,
  onGoLogin,
}: {
  onNext: (phone: string) => void;
  onGoLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ref, setRef] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = () => {
    const next: typeof errors = {};
    if (!isNonEmpty(name)) next.name = 'نام و نام خانوادگی را وارد کنید';
    if (!isValidIranPhone(phone)) next.phone = 'شماره موبایل معتبر نیست';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onNext(phone);
    }, 1300);
  };

  return (
    <>
      <CardHeader title="عضویت در قبیله" sub="سفرت را همین‌جا شروع کن" />
      <div className="h-5" />
      <Field
        label="نام و نام خانوادگی"
        placeholder="مثال: آرش کریمی"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setErrors((p) => ({ ...p, name: undefined }));
        }}
        error={errors.name}
        autoComplete="name"
      />
      <Field
        label="شماره موبایل"
        type="tel"
        inputMode="numeric"
        placeholder="09xxxxxxxxx"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          setErrors((p) => ({ ...p, phone: undefined }));
        }}
        error={errors.phone}
        autoComplete="tel"
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
      <AuthButton loading={loading} onClick={submit}>
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

function SignupStep2({
  phone,
  onBack,
  onSuccess,
}: {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { cooldown, start } = useCooldown(RESEND_SECONDS);

  const verify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 1500);
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
        title="تایید شماره موبایل"
        sub={
          <>
            کد ۶ رقمی ارسال شده به
            <br />
            <b className="text-gold" dir="ltr">
              {phone}
            </b>
          </>
        }
      />
      <div className="h-5" />
      <OtpInput value={code} onChange={setCode} ok={isCompleteOtp(code)} />
      <ResendRow cooldown={cooldown} onResend={() => start(RESEND_SECONDS)} />
      <AuthButton loading={loading} disabled={!isCompleteOtp(code)} onClick={verify}>
        ساخت حساب و ورود
      </AuthButton>
    </>
  );
}

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
