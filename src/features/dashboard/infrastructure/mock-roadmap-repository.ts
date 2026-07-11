// src/features/dashboard/infrastructure/mock-roadmap-repository.ts

import type { IRoadmapStepRepository } from '../domain/roadmap-repository';
import type { RoadmapStepDetail } from '../domain/roadmap.types';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Mock data mapping step numbers to details
const stepDetails: Record<number, RoadmapStepDetail> = {
  1: {
    id: 's1',
    title: 'مبانی ذهنیت رشد',
    type: 'lesson',
    introText:
      'در این بخش با اصول پایه‌ای ذهنیت رشد آشنا می‌شوید. ذهنیت رشد باور به این است که توانایی‌ها و هوش می‌توانند از طریق تلاش و یادگیری بهبود یابند.',
    contentText:
      'ذهنیت رشد در مقابل ذهنیت ثابت: افراد با ذهنیت ثابت معتقدند که توانایی‌هایشان ذاتی و غیرقابل تغییر است. در حالی که افراد با ذهنیت رشد می‌دانند که می‌توانند با تمرین و ممارست پیشرفت کنند. این طرز فکر باعث می‌شود که در مواجهه با چالش‌ها تسلیم نشوند و شکست را به عنوان فرصتی برای یادگیری ببینند.',
    xpReward: 50,
  },
  2: {
    id: 's2',
    title: 'تمرین تمرکز عمیق',
    type: 'exercise',
    introText:
      'تمرکز عمیق به شما کمک می‌کند تا در دنیای پر از حواس‌پرتی امروزی، روی مهم‌ترین کارها متمرکز بمانید.',
    steps: [
      { id: 'e1', text: 'محیط خود را آماده کنید (موبایل را کنار بگذارید، فضای ساکتی فراهم کنید).' },
      { id: 'e2', text: 'یک هدف مشخص برای ۳۰ دقیقه آینده تعیین کنید.' },
      { id: 'e3', text: 'تایمر ۳۰ دقیقه‌ای تنظیم کرده و بدون وقفه کار کنید.' },
      { id: 'e4', text: 'پس از پایان، ۵ دقیقه استراحت کنید و سپس بازخورد خود را ثبت نمایید.' },
    ],
    xpReward: 100,
  },
  3: {
    id: 's3',
    title: 'فالو کردن پیج قبیله',
    type: 'lesson',
    introText:
      'با دنبال کردن صفحات اجتماعی قبیله ققنوس در اینستاگرام، از جدیدترین نکات و محتوای آموزشی مطلع شوید.',
    contentText:
      'فالو کردن صفحه اینستاگرام قبیله ققنوس به شما امکان دسترسی به محتوای اختصاصی، نقل‌قول‌های انگیزشی و اعلام رویدادهای جدید را می‌دهد. کافیست در اینستاگرام @phoenix_tribe را جستجو کرده و دکمه Follow را بزنید.',
    xpReward: 30,
  },
  4: {
    id: 's4',
    title: 'انضباط و عادت‌سازی',
    type: 'exercise',
    introText:
      'عادت‌سازی مؤثر نیازمند نظم و تکرار آگاهانه است. این تمرین به شما کمک می‌کند تا عادات مثبت را در زندگی خود تثبیت کنید.',
    steps: [
      { id: 'e5', text: 'یک عادت کوچک و مشخص انتخاب کنید (مثلاً ۵ دقیقه مطالعه صبحگاهی).' },
      { id: 'e6', text: 'برای ۷ روز آینده، هر روز در یک ساعت ثابت آن را انجام دهید.' },
      { id: 'e7', text: 'پیشرفت خود را در یک جدول ردیابی ساده ثبت کنید.' },
    ],
    xpReward: 150,
  },
  5: {
    id: 's5',
    title: 'مدیتیشن صبح‌گاهی',
    type: 'exercise',
    introText: 'مدیتیشن صبحگاهی به شما کمک می‌کند تا روز خود را با آرامش و وضوح ذهنی آغاز کنید.',
    steps: [
      { id: 'e8', text: 'در یک جای آرام بنشینید یا دراز بکشید.' },
      { id: 'e9', text: 'چشمان خود را ببندید و ۵ نفس عمیق بکشید.' },
      { id: 'e10', text: 'توجه خود را به دم و بازدم معطوف کنید و ۵ دقیقه ادامه دهید.' },
    ],
    xpReward: 75,
  },
};

export class MockRoadmapStepRepository implements IRoadmapStepRepository {
  async getStepDetail(stepId: number): Promise<RoadmapStepDetail> {
    await delay(300);
    const detail = stepDetails[stepId];
    if (!detail) throw new Error(`Step ${stepId} not found`);
    return detail;
  }
}
