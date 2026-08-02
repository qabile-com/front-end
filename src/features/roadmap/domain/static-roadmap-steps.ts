import type { RoadmapStatus } from '@/features/dashboard/domain/dashboard.types';

export type RoadmapStepKind =
  | 'social-compose'
  | 'social-profile'
  | 'article'
  | 'social-follow'
  | 'social-connect'
  | 'checklist';

export type RoadmapStepCondition =
  | { type: 'posts'; min: number }
  | { type: 'engagement'; minLikes: number; minComments: number }
  | { type: 'timer'; seconds: number }
  | { type: 'follows'; min: number }
  | { type: 'checklist' };

export interface StaticRoadmapStep {
  id: number;
  title: string;
  category: string;
  description: string;
  xp: number;
  type: string;
  status: RoadmapStatus;
  kind: RoadmapStepKind;
  duration?: string;
  audioSrc?: string;
  content?: string[];
  instructions?: { title?: string; mobile: string; desktop: string }[];
  imageSlots?: { src: string; alt: string; size?: 'default' | 'wide'; fit?: 'cover' | 'contain' }[];
  socialLinks?: { label: string; value: string }[];
  checklist?: string[];
  condition?: RoadmapStepCondition;
}

export const ROADMAP_ASSET_PATHS = {
  step2First: '/assets/roadmap/step-2-1.webp',
  step2Second: '/assets/roadmap/step-2-2.webp',
  step3First: '/assets/roadmap/step-3-1.webp',
  step3Second: '/assets/roadmap/step-3-2.webp',
  step6: '/assets/roadmap/step-6-1.webp',
} as const;

export const STATIC_ROADMAP_STEPS: StaticRoadmapStep[] = [
  // {
  //   id: 1,
  //   title: 'از خاکستر پرواز آغاز می‌شود',
  //   category: 'شروع سفر',
  //   description:
  //     'قبل از هر چیز باید بدانیم از کجا شروع می‌کنیمقبل از هر پروازی باید مسیر را بشناسی. این ویدیو را ببین تا با استاد آدام، قبیله ققنوس و سفری که قرار است با هم شروع کنیم آشنا شوی.',
  //   xp: 50,
  //   type: 'ویدیو',
  //   status: 'current',
  //   kind: 'video',
  //   duration: '۸:۳۰',
  // },
  {
    id: 1,
    title: 'اولین شعله‌ات را روشن کن',
    category: 'تعامل اجتماعی',
    description:
      'هیچ ققنوسی در سکوت متولد نمی‌شود. وارد محفل شو، خودت را معرفی کن و اولین پستت را منتشر کن تا هم‌قبیله‌ای‌ها تو را بشناسند.',
    xp: 70,
    type: 'تعامل اجتماعی',
    status: 'next',
    kind: 'social-compose',
    condition: { type: 'posts', min: 1 },
    instructions: [
      {
        title: 'در موبایل',
        desktop:
          'از منوی پایین وارد محفل شو و دکمه نارنجی ️ پایینِ سمت چپ صفحه استفاده کن و اولین پستت را بنویس.',
        mobile:
          'از منوی پایین وارد محفل شو و دکمه نارنجی ️ پایینِ سمت چپ صفحه استفاده کن و اولین پستت را بنویس.',
      },
      {
        title: 'در دسکتاپ',
        desktop:
          'در ساید بار سمت راست وارد محفل شو و از دکمه نارنجی پایین سمت چپ صفحه استفاده کن، متن پستت را داخل کادر بنویس و روی دکمه «انتشار» کلیک کن.',
        mobile:
          'در ساید بار سمت راست وارد محفل شو و از دکمه نارنجی پایین سمت چپ صفحه استفاده کن، متن پستت را داخل کادر بنویس و روی دکمه «انتشار» کلیک کن.',
      },
    ],
    imageSlots: [
      { src: ROADMAP_ASSET_PATHS.step2First, alt: 'راهنمای ایجاد پست در محفل' },
      {
        src: ROADMAP_ASSET_PATHS.step2Second,
        alt: 'راهنمای نوشتن متن پست',
        size: 'wide',
        fit: 'contain',
      },
    ],
  },
  {
    id: 2,
    title: 'آتش با آتش زنده می‌ماند',
    category: 'تعامل اجتماعی',
    description:
      'انسان برای رشد به ارتباط نیاز دارد. وارد محفل شو، حداقل 5 را لایک کن و برای 5 نفر یک نظر ارزشمند بنویس. شاید شروع یک دوستی بزرگ همین امروز باشد.',
    xp: 150,
    type: 'تعامل اجتماعی',
    status: 'next',
    kind: 'social-profile',
    condition: { type: 'engagement', minLikes: 5, minComments: 5 },
    instructions: [
      {
        title: 'در موبایل',
        mobile:
          'از منوی پایین وارد محفل شو و پست دلخواهت رو انتخاب کن و از طریق قلب لایکش کن یا از طریق آیکون نظر پیامت رو برای نویسنده بنویس.',
        desktop:
          'از منوی پایین وارد محفل شو و پست دلخواهت رو انتخاب کن و از طریق قلب لایکش کن یا از طریق آیکون نظر پیامت رو برای نویسنده بنویس.',
      },
      {
        title: 'در دسکتاپ',
        mobile:
          'در ساید بار سمت راست وارد محفل شو و و پست دلخواهت رو انتخاب کن و از طریق قلب لایکش کن یا از طریق آیکون نظر پیامت رو برای نویسنده بنویس.',
        desktop:
          'در ساید بار سمت راست وارد محفل شو و و پست دلخواهت رو انتخاب کن و از طریق قلب لایکش کن یا از طریق آیکون نظر پیامت رو برای نویسنده بنویس.',
      },
    ],
    imageSlots: [
      {
        src: ROADMAP_ASSET_PATHS.step3First,
        alt: 'راهنمای تعامل با پست اجتماعی',
        size: 'wide',
        fit: 'contain',
      },
    ],
  },
  {
    id: 3,
    title: 'سوخت مغزت را بشناس',
    category: 'روانشناسی',
    description:
      'انگیزه فقط اراده نیست. این مقاله را بخوان و یاد بگیر تغذیه چطور روی انرژی، تمرکز، خلق‌وخو و پشتکار تو اثر می‌گذارد.',
    xp: 30,
    type: 'مقاله',
    status: 'next',
    kind: 'article',
    condition: { type: 'timer', seconds: 5 },
    content: [
      `انگیزه فقط اراده نیست؛ تغذیه چگونه روی انرژی، تمرکز، خلق‌وخو و پشتکار تو اثر می‌گذارد؟
خیلی از ما وقتی انگیزه کافی برای انجام کارها نداریم، خودمان را سرزنش می‌کنیم. فکر می‌کنیم مشکل از اراده ضعیف یا تنبلی است. اما واقعیت این است که مغز و بدن ما قبل از هر چیز به سوخت مناسب نیاز دارند.
اگر چند روز خواب نامناسب داشته باشی، آب کافی ننوشی یا وعده‌های غذایی نامنظم بخوری، احتمال زیادی وجود دارد که حتی ساده‌ترین کارها هم سخت به نظر برسند. در چنین شرایطی، مشکل فقط «کمبود انگیزه» نیست؛ بلکه مغزت انرژی لازم برای تصمیم‌گیری، تمرکز و ادامه دادن را ندارد.
در این مقاله می‌بینیم که تغذیه چگونه می‌تواند روی انگیزه، تمرکز، خلق‌وخو و پشتکار اثر بگذارد.
مغز؛ پرمصرف‌ترین عضو بدن
با اینکه مغز تنها حدود ۲ درصد وزن بدن را تشکیل می‌دهد، نزدیک به ۲۰ درصد انرژی روزانه بدن را مصرف می‌کند. هر تصمیم، هر فکر، هر یادگیری و حتی مقاومت در برابر حواس‌پرتی، انرژی مصرف می‌کند.
وقتی سوخت کافی به مغز نرسد، اولین نشانه‌ها معمولاً این‌ها هستند:
کاهش تمرکز
احساس خستگی ذهنی
بی‌حوصلگی
تصمیم‌گیری سخت‌تر
کاهش انگیزه برای شروع کارها
رها کردن کارها در نیمه راه
به همین دلیل است که گاهی بعد از یک وعده غذایی مناسب، احساس می‌کنی دوباره توان انجام کارها را پیدا کرده‌ای.
نوسان قند خون؛ دشمن تمرکز`,
    ],
  },
  // {
  //   id: 5,
  //   title: 'راز استمرار',
  //   category: 'روانشناسی',
  //   description:
  //     'موفق‌ها با انگیزه زندگی نمی‌کنند؛ با عادت زندگی می‌کنند. این فایل صوتی کوتاه را گوش کن و یاد بگیر چطور به مسیرت پایبند بمانی.',
  //   xp: 70,
  //   type: 'صوت',
  //   status: 'next',
  //   kind: 'audio',
  //   duration: '۱۰ ثانیه',
  // },
  {
    id: 4,
    title: 'آتش را همه‌جا دنبال کن',
    category: 'شبکه‌های اجتماعی',
    description:
      'آموزش فقط داخل قبیله نیست. صفحه‌های رسمی قبیله ققنوس را دنبال کن تا هیچ نکته، چالش یا فرصت تازه‌ای را از دست ندهی.',
    xp: 50,
    type: 'شبکه اجتماعی',
    status: 'next',
    kind: 'social-follow',
    condition: { type: 'timer', seconds: 10 },
    socialLinks: [
      { label: 'tt49', value: 'https://instagram.com/tt49' },
      { label: 'trade.adam', value: 'https://instagram.com/trade.adam' },
    ],
    imageSlots: [{ src: ROADMAP_ASSET_PATHS.step6, alt: 'راهنمای دنبال کردن صفحه اینستاگرام' }],
  },
  {
    id: 5,
    title: 'با فالویینگ‌هایت اوج بگیر',
    category: 'تعامل اجتماعی',
    description:
      'رشد، تنهایی اتفاق نمی‌افتد. وارد محفل شو، پروفایل ۵ نفر که احساس می‌کنی هم‌مسیرت هستند را باز کن و روی دکمه «فالو کردن» بزن. هر مسیر بزرگ، از یک همراه خوب شروع می‌شود.',
    xp: 150,
    type: 'تعامل اجتماعی',
    status: 'next',
    kind: 'social-connect',
    condition: { type: 'follows', min: 5 },
    instructions: [
      {
        title: 'در موبایل',
        mobile:
          'از منوی پایین وارد محفل شو و فرد دلخواهت رو انتخاب کن و روی اسم یا پروفایلش کلیک کن و روی دکمه فالو کردن بزن.',
        desktop:
          'از منوی پایین وارد محفل شو و فرد دلخواهت رو انتخاب کن و روی اسم یا پروفایلش کلیک کن و روی دکمه فالو کردن بزن.',
      },
      {
        title: 'در دسکتاپ',
        mobile:
          'در ساید بار سمت راست وارد محفل شو و فرد دلخواهت رو انتخاب کن و روی اسم یا پروفایلش کلیک کن و روی دکمه فالو کردن بزن.',
        desktop:
          'در ساید بار سمت راست وارد محفل شو و فرد دلخواهت رو انتخاب کن و روی اسم یا پروفایلش کلیک کن و روی دکمه فالو کردن بزن.',
      },
    ],
  },
  {
    id: 6,
    title: 'تمرین تمرکز عمیق',
    category: 'مهارت',
    description:
      'در این تمرین باید به یک جلسه تمرکز عمیق ۲۵ دقیقه‌ای وارد شوی و مراحل زیر را به ترتیب کامل کنی.',
    xp: 120,
    type: 'مهارت',
    status: 'next',
    kind: 'checklist',
    condition: { type: 'checklist' },
    checklist: [
      'گوشیت رو روی حالت بی‌صدا یا پرواز بگذار',
      'به تایمر ۲۵ دقیقه‌ای ست کن',
      'یک کار مشخص انتخاب کن و فقط روی اون تمرکز کن',
      'بعد از ۲۵ دقیقه یه استراحت ۵ دقیقه‌ای داشته باش',
    ],
  },
];

export const STATIC_ROADMAP_ITEMS = STATIC_ROADMAP_STEPS.map((step) => ({
  num: step.id,
  type: step.type,
  title: step.title,
  xp: step.xp,
  status: step.status,
}));

export function getStaticRoadmapStep(stepId: number) {
  return STATIC_ROADMAP_STEPS.find((step) => step.id === stepId) ?? null;
}
