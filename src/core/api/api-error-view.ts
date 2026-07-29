import { ApiError } from './http-client';

export interface ApiErrorView {
  statusCode?: number;
  title: string;
  message: string;
  tone: 'danger' | 'warning' | 'info';
  icon: 'shield' | 'lock' | 'bolt' | 'search';
}

export function getApiErrorView(
  error: unknown,
  fallback: { title: string; message: string },
): ApiErrorView {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        return {
          statusCode: 401,
          title: 'نیاز به ورود دوباره',
          message: 'برای دیدن این صفحه باید وارد حساب کاربری‌ات شوی.',
          tone: 'warning',
          icon: 'lock',
        };
      case 403:
        return {
          statusCode: 403,
          title: 'دسترسی نداری',
          message: error.message || 'این بخش برای حساب تو فعال نیست.',
          tone: 'warning',
          icon: 'lock',
        };
      case 404:
        return {
          statusCode: 404,
          title: 'پیدا نشد',
          message: error.message || 'چیزی که دنبالش بودی وجود ندارد یا حذف شده است.',
          tone: 'info',
          icon: 'search',
        };
      case 408:
      case 429:
        return {
          statusCode: error.statusCode,
          title: 'کمی بعد دوباره تلاش کن',
          message: error.message || 'تعداد درخواست‌ها زیاد بوده یا پاسخ بیش از حد طول کشیده است.',
          tone: 'warning',
          icon: 'bolt',
        };
      default:
        if (error.statusCode && error.statusCode >= 500) {
          return {
            statusCode: error.statusCode,
            title: 'مشکل سمت سرور',
            message: 'فعلاً سرور پاسخ مناسبی نمی‌دهد. چند دقیقه دیگر دوباره تلاش کن.',
            tone: 'danger',
            icon: 'shield',
          };
        }
    }

    return {
      statusCode: error.statusCode,
      title: fallback.title,
      message: error.message || fallback.message,
      tone: 'danger',
      icon: 'shield',
    };
  }

  if (error instanceof Error && error.message) {
    return {
      title: fallback.title,
      message: error.message,
      tone: 'danger',
      icon: 'shield',
    };
  }

  return {
    title: fallback.title,
    message: fallback.message,
    tone: 'danger',
    icon: 'shield',
  };
}
