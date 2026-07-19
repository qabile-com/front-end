import type { ICommentsRepository, PaginatedComments } from '../../domain/comments-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_COMMENTS = [
  { name: 'سارا محمدی', text: 'خیلی مفید بود!', time: '۲ روز پیش' },
  { name: 'مهدی عباسی', text: 'توضیحات عالی بود', time: '۱ روز پیش' },
  { name: 'نیلوفر رضایی', text: 'مرحله دوم رو متوجه نشدم', time: '۱۲ ساعت پیش' },
  { name: 'آرش کریمی', text: 'لطفاً مثال بیشتری بزنید', time: '۶ ساعت پیش' },
  { name: 'زهرا کاظمی', text: 'تشکر از زحماتتون', time: '۳ ساعت پیش' },
  { name: 'علی نوری', text: 'بسیار عالی بود', time: '۱ ساعت پیش' },
  { name: 'پریسا احمدی', text: 'لطفا فایل PDF هم قرار بدید', time: '۳۰ دقیقه پیش' },
];

export class MockCommentsRepository implements ICommentsRepository {
  async getComments(
    _courseId: string,
    _partId: string,
    limit = 5,
    offset = 0,
  ): Promise<PaginatedComments> {
    await delay(300);
    const sliced = MOCK_COMMENTS.slice(offset, offset + limit);
    return {
      comments: sliced,
      totalItems: MOCK_COMMENTS.length,
      totalPages: Math.ceil(MOCK_COMMENTS.length / limit),
      currentPage: Math.floor(offset / limit) + 1,
    };
  }
}
