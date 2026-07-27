export const ONBOARDING_STORAGE_KEY = 'qabile:onboarding:completed';

export interface OnboardingSlide {
  id: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  accentClassName: string;
  accentGradient: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'progress-path',
    imageSrc: '/assets/onboarding/step-1.webp',
    imageAlt: 'ققنوس روی مسیر کوهستانی پیشرفت',
    title: 'هر قدم، یک پیشرفت',
    description:
      'هر هدف بزرگ، با یک قدم کوچک شروع می‌شود. مسیرهای آموزشی را دنبال کن، مأموریت‌ها را انجام بده و هر روز یک قدم به نسخه‌ای بهتر از خودت نزدیک‌تر شو',
    accentClassName: 'from-[#ff4b00] to-[#ffb45d]',
    accentGradient: 'linear-gradient(90deg,#ff4b00,#ffb45d)',
  },
  {
    id: 'reward',
    imageSrc: '/assets/onboarding/step-2.webp',
    imageAlt: 'ققنوس بنفش و نشان آتش',
    title: 'پاداش تلاش تو',
    description:
      'با انجام مأموریت‌های رودمپ، تماشای ویدیوهای آموزشی و فعالیت در قبیله، آتش به دست بیاور. هرچه آتش بیشتری داشته باشی، امکانات و پاداش‌های بیشتری در انتظارت خواهد بود',
    accentClassName: 'from-[#6f2cff] to-[#c471ff]',
    accentGradient: 'linear-gradient(90deg,#6f2cff,#c471ff)',
  },
  {
    id: 'tribe',
    imageSrc: '/assets/onboarding/step-3.webp',
    imageAlt: 'ققنوس در کنار قبیله',
    title: 'تنها پرواز نکن',
    description:
      'رشد کردن کنار افرادی که انگیزه و هدف مشترک دارند، ساده‌تر و لذت‌بخش‌تر است. انجمن قبیله جایی است که همیشه یک همراه برای ادامه مسیر پیدا می‌کنی',
    accentClassName: 'from-[#0c7c73] to-[#6ee7d8]',
    accentGradient: 'linear-gradient(90deg,#0c7c73,#6ee7d8)',
  },
  {
    id: 'start',
    imageSrc: '/assets/onboarding/step-4.webp',
    imageAlt: 'ققنوس آماده پرواز در میان اعضای قبیله',
    title: 'آماده‌ای برای پرواز؟',
    description:
      'حالا وقت آن رسیده که توانایی‌هایت را به چالش بکشی. آتش جمع کن، در رقابت‌ها شرکت کن و جایگاهت را در میان اعضای قبیله ققنوس به دست بیاور.',
    accentClassName: 'from-[#d97706] to-[#fbbf24]',
    accentGradient: 'linear-gradient(90deg,#d97706,#fbbf24)',
  },
];
