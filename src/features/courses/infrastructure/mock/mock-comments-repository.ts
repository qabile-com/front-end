import type { ICommentsRepository, PaginatedComments } from '../../domain/comments-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_COMMENTS = [
  { id: 'comment-1', name: 'سارا محمدی', text: 'خیلی مفید بود!', time: '۲ روز پیش' },
  { id: 'comment-2', name: 'مهدی عباسی', text: 'توضیحات عالی بود', time: '۱ روز پیش' },
  { id: 'comment-3', name: 'نیلوفر رضایی', text: 'مرحله دوم رو متوجه نشدم', time: '۱۲ ساعت پیش' },
  { id: 'comment-4', name: 'آرش کریمی', text: 'لطفاً مثال بیشتری بزنید', time: '۶ ساعت پیش' },
  { id: 'comment-5', name: 'زهرا کاظمی', text: 'تشکر از زحماتتون', time: '۳ ساعت پیش' },
  { id: 'comment-6', name: 'علی نوری', text: 'بسیار عالی بود', time: '۱ ساعت پیش' },
  { id: 'comment-7', name: 'پریسا احمدی', text: 'لطفا فایل PDF هم قرار بدید', time: '۳۰ دقیقه پیش' },
];

export class MockCommentsRepository implements ICommentsRepository {
  private commentsBySection = new Map<string, typeof MOCK_COMMENTS>();

  async getComments(
    _courseId: string,
    sectionId: string,
    limit = 5,
    offset = 0,
  ): Promise<PaginatedComments> {
    await delay(300);
    const comments = this.getSectionComments(sectionId);
    const sliced = comments.slice(offset, offset + limit);
    return {
      comments: sliced,
      totalItems: comments.length,
      totalPages: Math.ceil(comments.length / limit),
      currentPage: Math.floor(offset / limit) + 1,
    };
  }

  async addComment(_courseId: string, sectionId: string, text: string) {
    await delay(200);
    const comment = {
      id: `${sectionId}-${Date.now()}`,
      name: 'آرش کریمی',
      text,
      time: 'همین حالا',
    };
    this.commentsBySection.set(sectionId, [comment, ...this.getSectionComments(sectionId)]);
    return comment;
  }

  private getSectionComments(sectionId: string) {
    const comments = this.commentsBySection.get(sectionId);
    if (comments) return comments;
    const initial = MOCK_COMMENTS.map((comment) => ({ ...comment }));
    this.commentsBySection.set(sectionId, initial);
    return initial;
  }
}
