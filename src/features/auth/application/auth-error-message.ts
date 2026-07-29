import { ApiError } from '@/core/api/http-client';

const AUTH_STATUS_MESSAGES: Record<number, string> = {
  400: 'اطلاعات وارد شده درست نیست. لطفاً دوباره بررسی کن.',
  401: 'اطلاعات ورود یا کد تایید درست نیست.',
  403: 'اجازه انجام این عملیات را نداری.',
  404: 'حسابی با این اطلاعات پیدا نشد.',
  408: 'درخواست بیش از حد طول کشید. دوباره تلاش کن.',
  409: 'این اطلاعات قبلاً ثبت شده است.',
  422: 'فرمت اطلاعات وارد شده درست نیست.',
  429: 'لطفاً قبل از درخواست کد جدید کمی صبر کن.',
  500: 'مشکلی در سرور پیش آمده. چند دقیقه دیگر دوباره تلاش کن.',
  502: 'ارتباط با سرور موقتاً مشکل دارد.',
  503: 'سرویس موقتاً در دسترس نیست. کمی بعد دوباره تلاش کن.',
  504: 'پاسخ سرور بیش از حد طول کشید. دوباره تلاش کن.',
};

const AUTH_MESSAGE_MAP: Record<string, string> = {
  'Please wait before requesting a new OTP.': 'لطفاً قبل از درخواست کد جدید کمی صبر کن.',
  Unauthorized: 'نشست تو معتبر نیست. لطفاً دوباره وارد شو.',
  'Validation failed': 'اطلاعات وارد شده درست نیست. لطفاً دوباره بررسی کن.',
};

export function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    const backendMessage = error.message?.trim();

    if (backendMessage && AUTH_MESSAGE_MAP[backendMessage]) {
      return AUTH_MESSAGE_MAP[backendMessage];
    }

    if (backendMessage && isPersianMessage(backendMessage)) {
      return backendMessage;
    }

    if (error.statusCode && AUTH_STATUS_MESSAGES[error.statusCode]) {
      return AUTH_STATUS_MESSAGES[error.statusCode];
    }

    return backendMessage || fallback;
  }

  if (error instanceof Error) {
    return AUTH_MESSAGE_MAP[error.message] ?? error.message ?? fallback;
  }

  return fallback;
}

function isPersianMessage(message: string) {
  return /[\u0600-\u06FF]/.test(message);
}
